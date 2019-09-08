// SIMULATION PARAMS
const SIMULATIONS = 10;
const EXPECTED_TURN_DURATION = 300;
// DB interface
const firebase = require('./firebase')
const t = require('./tronWarBot')
const utils = require('./utils')
const config = require('./config')
const fairness = require('./fairness')
const neighborCountries = require('./map-utilities/neighborCountries');
const COUNTRIES = neighborCountries.length;
var ROUND = 0;

var countriesMap;
// the countriesMap is an array of (CountryIndex => CountryStatus) where CountryStatus is:
// {
  //   occupiedBy: CountryIndex,
  //   cohesion: [0-1], Index representing the unity of the country that impacting on civil rebelions probability
  // finalQuote: 0, // PRICE OF FINAL BET
  // nextQuote: 0, // MULTIPLIER FOR BET ON NEXT CONQUERER
  // territories: 1,
  // probability: 0
  // }
var turn = 0;
var turnData = {};
var simulation = false;
var paused = false;

const currentTurn = () => turn;
const currentTurnData = () => turnData;
const mapState = async () => {if (!countriesMap) await init(); return JSON.parse(JSON.stringify(countriesMap));}

// Returns array of countryIndexes
const conquerableTerritoriesOf = (c) => fairness.conquerableTerritoriesOf(countriesMap, c);
const conqueredTerritoriesOf = (c) => fairness.conqueredTerritoriesOf(countriesMap, c);
const countriesOnTheBorders = () => fairness.countriesOnTheBorders(countriesMap);
const countriesStillAlive = () => fairness.countriesStillAlive(countriesMap);

const pdf = () => fairness.pdf(countriesMap);
const cumulatedPdf = () => fairness.cumulatedPdf(countriesMap);
const realPdf = () => fairness.realPdf(countriesMap);

const winner = () => fairness.winner(countriesMap);


const init = async (restart) => {
  turn = 1;
  countriesMap = new Array(COUNTRIES).fill(0).map((e,idx)=>{
    return {
      occupiedBy: idx,
      cohesion: 0.5,
      finalQuote: 50, // PRICE OF FINAL BET
      nextQuote: 200, // MULTIPLIER FOR BET ON NEXT CONQUERER
      territories: 1,
      probability: (1/COUNTRIES)
    }
  });
  if (!restart) countriesMap = await loadSavedState();
  if (!restart) turn = await loadSavedTurn();
  if (!simulation) ROUND = await t.getCurrentRound(0).then(r=>r.round);
  if (!simulation && restart) return await saveCurrentState();
};


const loadSavedTurn = async () => {
  return firebase.data.once('value').then(r=>r.val()["turn"]);
};

const loadSavedState = async () => {
  return firebase.countriesMap.once('value').then(r=>r.val());
};

const saveCurrentState = async () => {
  firebase.countriesMap.set(countriesMap);
  return firebase.data.update({ turn });
};


const printStatus = ()=>{
  countriesMap.forEach((c,idx)=>console.log(idx + " => " + c.occupiedBy + "  cohesion:" + c.cohesion.toFixed(4)));
}

const leaderboard = ()=>{
  return countriesMap.map((e,idx)=>{
    e.idx = idx;
    return e;
  }).sort((a, b)=>{
    return b.territories - a.territories;
  });
}

const updateExternalData = async (conquerer, conquered, conquererTerritory, conqueredTerritory) => {

  // GET JACKPOT
  let jackpot = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let bets = await firebase.bets.getCurrentTurnBets(0, ROUND);
  let betsPerCountry = new Array(COUNTRIES).fill(0);
  bets.forEach((e,i)=>betsPerCountry[e.userChoice]+=1);

  // CALCULATE NEW EXACT PDF
  realPdf().forEach((e,i)=>{
    countriesMap[i].probability = e;
    let next = e ? Math.min(1/e, 200) : 200;
    let pf = countriesMap[i].territories/COUNTRIES;
    countriesMap[i].nextQuote = Math.floor(next*100)/100;
    countriesMap[i].finalQuote = Math.round(((jackpot * pf)/(betsPerCountry[i]+1)) + 50 + (turn/100));
  })
}


const updateTurn = () => {
  if (paused) throw "Turn needs to be resumed before updating turn.";
  turn += 1;
  paused = true;
}


// Returns is game over?
const launchNextTurn = async (_entropy1, _entropy2) => {
  if (!paused) throw "Turn needs to be paused before computing next state.";
  paused = false;

  if (!countriesMap) await init();

  // GAME IS ALREADY OVER
  if (fairness.winner(countriesMap)!=null) return true;

  // COMPUTE NEW TURN
  [countriesMap, turnData, computedRandom] = fairness.computeNextState(countriesMap, (_entropy1 || utils.randomHex()), (_entropy2 || utils.randomHex()));
  turnData.turn = turn - 1;

  // UPDATE TERRITORIES
  countriesMap[turnData.o].territories = countriesMap[turnData.o].territories + 1;
  countriesMap[turnData.d].territories = countriesMap[turnData.d].territories - 1;

  if (simulation) return turnData.winner != null;

  // UPDATE EXTERNAL DATA
  await updateExternalData(turnData.o, turnData.d, turnData.ot, turnData.dt);

  await saveCurrentState();
  if (turnData.civilWar) console.log("[WWB]:KABOOM! There was a civil war: " + turnData.o + " rebelled on " + turnData.d);
  console.log("[WWB]:Conquerer is: " + turnData.o + "  on: " + turnData.d + "   from country: " + turnData.ot);

  return turnData.winner != null;
}


init();

const simulate = async () => {
  console.log("Simulating with " + COUNTRIES + " countries");
  var wins = new Array(COUNTRIES).fill(0);
  var conquest = new Array(COUNTRIES).fill(0);
  var cohesion = new Array(COUNTRIES).fill(0);
  var rounds = 0;
  var maxRounds = 0;
  var minRounds = 99999999;
  var civilWars = 0;
  simulation = true;
  for (var i=0; i<SIMULATIONS; i++){
    init(true);
    let go
    let leaders = {}
    do {
      updateTurn();
      if (!(turn % 100)) {
        let l = leaderboard();
        leaders[l[0].idx] = l[0];
        // console.log("Current leader at " + turn + " is: " + l[0].idx + " with cohesion of: " + l[0].cohesion)
      }
      go = await launchNextTurn()
      let d = currentTurnData()
      civilWars += d.civilWar;
      conquest[d.o] += 1;
      cohesion = cohesion.map((e,idx)=> e + countriesMap[idx].cohesion);
    } while (!go);
    let c_tot = countriesMap.reduce((acc, c) => acc + c.cohesion, 0);
    console.log("[WWB]:Winner is:  " + winner() + " in turns: " + turn + "  g_cohesion: " + (c_tot/COUNTRIES).toFixed(3) + " with: " + Object.keys(leaders).length + " different leaders!");
    if (turn > maxRounds) maxRounds = turn;
    if (turn < minRounds) minRounds = turn;
    wins[winner()]+=1;
    rounds += turn;
  }
  simulation = false;
  cohesion = cohesion.map((e,idx)=> e / rounds);
  conquest = conquest.map((e,idx)=> e / SIMULATIONS);
  console.log("[WWB]:###########  Results ###########")
  console.log("[WWB]: Wins:   Conquest:   \tAvg.Cohesion: ")
  wins.forEach((c,idx)=>{if (c) console.log(idx + " => \t" + c + "    \t" + (conquest[idx]).toFixed(2) + "    \t" + (cohesion[idx]).toFixed(5))});
  console.log("\n[WWB]: Using Cohesion Bias: " + config.wwb.cohesionBias + " and civil War Likelihood: " + config.wwb.civilWarLikelihood);
  console.log("\n[WWB]: Turns => min: " + minRounds + "  avg: " + rounds/SIMULATIONS + "  max:" + maxRounds);
  console.log("[WWB]:Average civil wars: " + civilWars/SIMULATIONS);
  console.log("[WWB]:Civil wars a posteriori likelihood: " + (civilWars*100/rounds).toFixed(2) + "%");
  console.log("\n[WWB]: Expected full run duration: (" + ((EXPECTED_TURN_DURATION * minRounds)/86400).toFixed(2) + ") => " + ((EXPECTED_TURN_DURATION * rounds/SIMULATIONS)/86400).toFixed(2) + " => (" + ((EXPECTED_TURN_DURATION * maxRounds)/86400).toFixed(2) +")  days\n\n");
}

module.exports = {
  init,
  currentTurn,
  currentTurnData,
  mapState,
  leaderboard,
  updateTurn,
  launchNextTurn,
  countriesStillAlive,
  conquerableTerritoriesOf,
  conqueredTerritoriesOf,
  countriesOnTheBorders,
  cumulatedPdf,
  printStatus,
  pdf,
  simulate,
  winner
}
