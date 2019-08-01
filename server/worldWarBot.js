// SIMULATION PARAMS
const SIMULATIONS = 10;
// DB interface
const firebase = require('./firebase')
const t = require('./tronWarBot')
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
const mapState = () => JSON.parse(JSON.stringify(countriesMap));
const currentTurnData = () => turnData;

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
      finalQuote: 0, // PRICE OF FINAL BET
      nextQuote: 0, // MULTIPLIER FOR BET ON NEXT CONQUERER
      territories: 1,
      probability: 0
    }
  });
  if (!restart) countriesMap = await loadSavedState();
  if (!restart) turn = await loadSavedTurn();
  ROUND = await t.getCurrentRound(0).then(r=>r.round);
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


const updateExternalData = async (conquerer, conquered, conquererTerritory, conqueredTerritory) => {
  // UPDATE TERRITORIES
  countriesMap[conquerer].territories = countriesMap[conquerer].territories + 1;
  countriesMap[conquered].territories = countriesMap[conquered].territories - 1;

  // GET JACKPOT
  let jackpot = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let bets = await firebase.bets.getCurrentTurnBets(0, ROUND);
  let betsPerCountry = new Array(COUNTRIES).fill(0);
  bets.forEach((e,i)=>betsPerCountry[e.userChoice]+=1);

  // CALCULATE NEW EXACT PDF
  realPdf().forEach((e,i)=>{
    countriesMap[i].probability = e;
    let next = e ? Math.min(1/e, 200) : 200;
    countriesMap[i].nextQuote = Math.floor(next*100)/100;
    countriesMap[i].finalQuote = Math.round(((jackpot * e)/(betsPerCountry[i]+1)) + 50 + (turn/100));
  })
}


const updateTurn = () => {
  if (paused) throw "Turn needs to be resumed before updating turn.";
  turn += 1;
  paused = true;
}


// Returns is game over?
const launchNextTurn = async () => {
  if (!paused) throw "Turn needs to be paused before computing next state.";
  paused = false;

  if (!countriesMap) await init();

  // GAME IS ALREADY OVER
  if (fairness.winner(countriesMap)!=null) return true;

  // COMPUTE NEW TURN
  let entropy = Math.random();
  [countriesMap, turnData] = fairness.computeNextState(countriesMap, entropy, entropy);
  turnData.turn = turn - 1;

  // UPDATE EXTERNAL DATA
  await updateExternalData(turnData.o, turnData.d, turnData.ot, turnData.dt);

  if (simulation) return turnData.winner != null;

  await saveCurrentState();
  console.log("[WWB]:Random is: " + entropy);
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
  var civilWars = 0;
  simulation = true;
  for (var i=0; i<SIMULATIONS; i++){
    init(true);
    while (!!(await launchNextTurn())) {
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
  updateTurn,
  launchNextTurn,
  conquerableTerritoriesOf,
  conqueredTerritoriesOf,
  countriesOnTheBorders,
  cumulatedPdf,
  printStatus,
  pdf,
  simulate,
  winner
}
