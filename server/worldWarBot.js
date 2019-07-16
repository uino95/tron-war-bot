
// SIMULATION PARAMS
const COHESION_BIAS = 0.25;
const COUNTRIES = 200;
const CIVIL_WAR_LIKELIHOOD = 0.1;
const SIMULATIONS = 20;

// the countryMap is an array of (CountryIndex => CountryStatus) where CountryStatus is:
// {
//   occupiedBy: CountryIndex,
//   angerIndex: [0-1], Index representing the unity of the country that impacting on civil rebelions probability
// }
var countryMap;

// the neighborCountries is an array of (CountryIndex => [CountryIndexes])
var neighborCountries;

var turn;

const init = async () => {
  turn = 0;
  countryMap = new Array(COUNTRIES).fill(0).map((e,idx)=>{
   return {
     occupiedBy: idx,
     cohesion: 1
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

const loadSavedState = async () => {};

const saveCurrentState = async () => {};

// Returns array of countryIndexes
const conquerableTerritories = (c) => {
  return neighborCountries[c].filter((t)=>{
    return countryMap[t].occupiedBy != countryMap[c].occupiedBy;
  })
}

const conqueredTerritories = (c) => {
  return Object.keys(countryMap).filter((t)=>countryMap[t].occupiedBy==c);
}

// Returns array of countryIndexes
const countryOnTheBorders = () => {
  return Object.keys(countryMap).filter((c)=>{
    return conquerableTerritories(c).length;
  })
}

// Returns array of countryIndexes
const countriesStillAlive = () => {
  return [...new Set(
    countryMap.map((c)=>{return c.occupiedBy;})
  )];
}

const winner = () => {
  if (!countryOnTheBorders().length) return countryMap[0].occupiedBy;
  return false;
}

const updateCohesion = (cr, cd) => {
  let cRatio = conqueredTerritories(cr).length / countryMap.length;
  let cRand = Math.random() - COHESION_BIAS;
  let crDelta = cRatio * cRand * countryMap[cd].cohesion;
  let cdDelta = cRatio * cRand * (1 - countryMap[cr].cohesion);
  countryMap[cr].cohesion =  Math.max(0, Math.min(1, countryMap[cr].cohesion - crDelta));
  countryMap[cd].cohesion = Math.max(0, Math.min(1, countryMap[cd].cohesion + cdDelta));
}



// Returns is game on?
const nextTurn = async () => {
  // Calculate countries on the borders
  let availableTerritories = countryOnTheBorders();
  if (!availableTerritories.length) return false;

  let conquerer, conquered, civilWar;

  // COMPUTE NEW TURN
  turn += 1;

  let events = COUNTRIES;
  // CALCULATE CIVIL WAR
  for (var i = 0; i<events; i++) {
    let t = getRandom(COUNTRIES);
    let o = countryMap[t].occupiedBy;
    if (o == t) continue;
    civilWar = Math.random() < (CIVIL_WAR_LIKELIHOOD * (countryMap[t].cohesion  * (1 - countryMap[o].cohesion)) / events);
    if (civilWar) {
      console.log("[WWB]:KABOOM! There was a civil war: " + t + " rebelled on " + o);
      conquerer = t;
      conquered = t;
      break;
    }
  }

  // CALCULATE CONQUERER
  if (!civilWar){
    // console.log("[WWB]:Conquerer countries: " + JSON.stringify(availableTerritories));
    let odds = availableTerritories.length;
    let conquererCountry = availableTerritories[getRandom(odds)];
    conquerer = countryMap[conquererCountry].occupiedBy;
    // console.log("[WWB]:Conquerer is: " + conquerer + "  from country: " + conquererCountry);

    // CALCULATE CONQUERED
    availableTerritories = conquerableTerritories(conquererCountry);
    // console.log("[WWB]:Conquerable countries: " + JSON.stringify(availableTerritories));
    odds = availableTerritories.length;
    conquered = availableTerritories[getRandom(odds)];
    // console.log("[WWB]:Conquered is: " + conquered);
  }


  updateCohesion(conquerer, conquered);
  countryMap[conquered].occupiedBy = conquerer;
  await saveCurrentState();
  // printStatus();
  return !!countryOnTheBorders().length;
}

const printStatus = ()=>{
  countryMap.forEach((c,idx)=>console.log(idx + " => " + c.occupiedBy + "  cohesion:" + c.cohesion.toFixed(4)));
}

const currentTurn = () => turn;



const simulate = async () => {
  var wins = new Array(countryMap.length).fill(0);
  var rounds = 0;
  var maxRounds = 0;
  for (var i=0; i<SIMULATIONS; i++){
    init();
    while (!!(await nextTurn())) {
      // console.log("[WWB]:Next turn is: " + turn)
    };
    console.log("[WWB]:Winner is:  " + winner());
    if (turn> maxRounds) maxRounds = turn;
    wins[winner()]+=1;
    rounds += turn;
  }
  console.log("[WWB]:###########  Results ###########")
  console.log("[WWB]:Average turn: " + rounds/SIMULATIONS);
  console.log("[WWB]:Max turn: " + maxRounds);
  console.log("[WWB]:Wins:")
  // wins.forEach((c,idx)=>console.log(idx + " => " + c));
}

module.exports = {
  init,
  currentTurn,
  nextTurn,
  conquerableTerritories,
  conqueredTerritories,
  countryOnTheBorders,
  simulate
}


init();
