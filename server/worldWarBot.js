// DB interface
const firebase = require('./firebase')
const db = firebase.db

// SIMULATION PARAMS
const COHESION_BIAS = 0.3;
const COUNTRIES = 241;
const CIVIL_WAR_LIKELIHOOD = 0.2;
const SIMULATIONS = 1;

// the countriesMap is an array of (CountryIndex => CountryStatus) where CountryStatus is:
// {
//   occupiedBy: CountryIndex,
//   angerIndex: [0-1], Index representing the unity of the country that impacting on civil rebelions probability
// }
var countriesMap;
// db ref
var countriesMapRef = db.ref('countriesMap')

// the neighborCountries is an array of (CountryIndex => [CountryIndexes])
var neighborCountries;

var turn;
var turnData = {};
var simulation = false;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const init = async () => {
  turn = 0;
  countriesMap = new Array(COUNTRIES).fill(0).map((e,idx)=>{
   return {
     occupiedBy: idx,
     cohesion: 0.5
   }
  });
  // the neighborCountries is an array of (CountryIndex => [CountryIndexes])
  neighborCountries = new Array(COUNTRIES).fill(0).map(()=>[]);
  for (var c=0; c<COUNTRIES; c++){
    let t = getRandom(COUNTRIES);
    while (t == c) t = getRandom(COUNTRIES);
    neighborCountries[c].push(t);
    neighborCountries[t].push(c);

    if (Math.random()>0.4) {
      t = getRandom(COUNTRIES);
      while (t == c) t = getRandom(COUNTRIES);
      neighborCountries[c].push(t);
      neighborCountries[t].push(c);
    }
  }
  neighborCountries = neighborCountries.map((e)=>{return [...new Set(e)]});
};


const getRandom = (odds) => {
  return Math.floor(Math.random() * odds);
}

const loadSavedState = async () => {
  return new Promise(async function(resolve, reject) {
    countriesMapRef.once('value', function(snapshot) {
      resolve(snapshot.val())
    })
  })
};

const saveCurrentState = async () => {
  countriesMapRef.set(countriesMap)
};

// Returns array of countryIndexes
const conquerableTerritoriesOf = (c) => {
  return neighborCountries[c].filter((t)=>{
    return countriesMap[t].occupiedBy != countriesMap[c].occupiedBy;
  })
}

const conqueredTerritoriesOf = (c) => {
  return Object.keys(countriesMap).filter((t)=>countriesMap[t].occupiedBy==c);
}

// Returns array of countryIndexes
const countriesOnTheBorders = () => {
  return Object.keys(countriesMap).filter((c)=>{
    return conquerableTerritoriesOf(c).length;
  })
}

// Returns array of countryIndexes
const countriesStillAlive = () => {
  return [...new Set(
    countriesMap.map((c)=>{return c.occupiedBy;})
  )];
}

const rawPdf = () => {
  return countriesMap.map((c,idx)=>{
    let pOfConquest = Math.min(conquerableTerritoriesOf(idx).length,1) * countriesMap[c.occupiedBy].cohesion;
    let pOfCivilWar =  (c.occupiedBy != idx ? 1 : 0) * c.cohesion * CIVIL_WAR_LIKELIHOOD;
    return [pOfConquest,  pOfCivilWar];
  })
}

const pdf = () => {
  let r = rawPdf();
  let total = r.reduce((acc, c) => acc + c[0] + c[1], 0);
  return r.map(c=>[c[0]/total, c[1]/total]);
}

const cumulatedPdf = () => {
  let cumulated = 0;
  return pdf().map(c=>{
    return [cumulated += c[0], cumulated += c[1]]
  });
}

const winner = () => {
  if (!countriesOnTheBorders().length) return countriesMap[0].occupiedBy;
  return false;
}

const updateCohesion = (o, d, ot, dt) => {
  let o_amp = conqueredTerritoriesOf(o).length / COUNTRIES;
  let d_amp = conqueredTerritoriesOf(d).length / COUNTRIES;
  let rnd = COHESION_BIAS - Math.random();
  let c_o = countriesMap[o].cohesion - 0.5;
  let c_d = countriesMap[d].cohesion - 0.5;
  let c_ot = countriesMap[ot].cohesion - 0.5;
  let c_dt = countriesMap[dt].cohesion - 0.5;
  let delta_o = (rnd - c_ot - c_d - c_dt) * o_amp;
  let delta_d = (rnd + c_ot - c_o - c_dt) * d_amp;
  let delta_ot = (rnd - c_o + c_d + c_dt) * o_amp;
  let delta_dt = (rnd - c_o + c_d + c_ot) * d_amp;
  let new_o = countriesMap[o].cohesion + delta_o;
  let new_d = countriesMap[d].cohesion + delta_d;
  let new_ot = countriesMap[ot].cohesion + delta_ot;
  let new_dt = countriesMap[dt].cohesion + delta_dt;
  countriesMap[dt].cohesion = Math.max(0, Math.min(1, new_dt));
  countriesMap[ot].cohesion =  Math.max(0, Math.min(1, new_ot));
  countriesMap[d].cohesion = Math.max(0.001, Math.min(1, new_d));
  countriesMap[o].cohesion =  Math.max(0.001, Math.min(1, new_o));
  turnData.cohesion = {
    o :countriesMap[o].cohesion,
    d :countriesMap[d].cohesion,
    ot :countriesMap[ot].cohesion,
    dt :countriesMap[dt].cohesion,
    delta_o,
    delta_d,
    delta_ot,
    delta_dt,
  }
}



// Returns is game on?
const nextTurn = async () => {
  // Calculate countries on the borders
  let availableTerritories = countriesOnTheBorders();
  if (!availableTerritories.length) return false;

  // COMPUTE NEW TURN
  turn += 1;

  let cpdf = cumulatedPdf().reduce((acc, val) => acc.concat(val), []);
  let rand = Math.random();
  if (!simulation) console.log("[WWB]:Random is: " + rand)
  let scenario = cpdf.length - 1;
  for (var i in cpdf) {
    if (rand > cpdf[i]) continue;
    scenario = i;
    break;
  }
  let conquererTerritory = Math.floor(scenario / 2);
  let civilWar = scenario % 2;
  let conquerer = civilWar ? conquererTerritory : countriesMap[conquererTerritory].occupiedBy;
  let cts = conquerableTerritoriesOf(conquererTerritory);
  let conqueredTerritory = civilWar ? conquerer : cts[getRandom(cts.length)];
  let conquered = civilWar ? countriesMap[conquererTerritory].occupiedBy : countriesMap[conqueredTerritory].occupiedBy;

  if (!simulation && civilWar) console.log("[WWB]:KABOOM! There was a civil war: " + conquerer + " rebelled on " + conquered);
  if (!simulation) console.log("[WWB]:Conquerer is: " + conquerer + "  on: " + conquered + "   from country: " + conquererTerritory);

  turnData = {
    turn,
    civilWar,
    o: conquerer,
    ot: conquererTerritory,
    d: conquered,
    dt: conqueredTerritory,
  }
  updateCohesion(conquerer, conquered, conquererTerritory, conqueredTerritory);

  countriesMap[conqueredTerritory].occupiedBy = conquerer;


  await saveCurrentState();
  printStatus();
  return !!countriesOnTheBorders().length;
}

const currentTurnData = () => turnData;

const printStatus = ()=>{
  if (!simulation) countriesMap.forEach((c,idx)=>console.log(idx + " => " + c.occupiedBy + "  cohesion:" + c.cohesion.toFixed(4)));
}

const currentTurn = () => turn;
const mapState = () => countriesMap;


const simulate = async () => {
  var wins = new Array(COUNTRIES).fill(0);
  var conquest = new Array(COUNTRIES).fill(0);
  var cohesion = new Array(COUNTRIES).fill(0);
  var rounds = 0;
  var maxRounds = 0;
  var civilWars = 0;
  simulation = true;
  for (var i=0; i<SIMULATIONS; i++){
    init();
    while (!!(await nextTurn())) {
      await sleep(5000);
      let d = currentTurnData()
      civilWars += d.civilWar;
      conquest[d.o] += 1;
      cohesion = cohesion.map((e,idx)=> e + countriesMap[idx].cohesion);
    };
    let c_tot = countriesMap.reduce((acc, c) => acc + c.cohesion, 0);
    console.log("[WWB]:Winner is:  " + winner() + " in turns: " + turn + "  g_cohesion: " + (c_tot/COUNTRIES).toFixed(4));
    if (turn> maxRounds) maxRounds = turn;
    wins[winner()]+=1;
    rounds += turn;
  }
  simulation = false;
  cohesion = cohesion.map((e,idx)=> e / rounds);
  conquest = conquest.map((e,idx)=> e / SIMULATIONS);
  console.log("[WWB]:###########  Results ###########")
  console.log("[WWB]:Average turns: " + rounds/SIMULATIONS);
  console.log("[WWB]:Max turn: " + maxRounds);
  console.log("[WWB]:Average civil wars: " + civilWars/SIMULATIONS);
  console.log("[WWB]:Civil wars a posteriori likelihood: " + (civilWars/rounds).toFixed(3));
  console.log("[WWB]: Wins:   Conquest:   \tCohesion: ")
  wins.forEach((c,idx)=>console.log(idx + " => \t" + c + "    \t" + (conquest[idx]).toFixed(2) + "    \t" + (cohesion[idx]).toFixed(5)));
}

module.exports = {
  init,
  currentTurn,
  currentTurnData,
  mapState,
  nextTurn,
  conquerableTerritoriesOf,
  conqueredTerritoriesOf,
  countriesOnTheBorders,
  cumulatedPdf,
  printStatus,
  pdf,
  simulate
}


init();
