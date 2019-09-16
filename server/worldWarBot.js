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

var countriesMap, turnData;
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
var simulation = false;
var paused = false;

const currentTurn = () => turn;
const currentTurnData = async () => {if (!countriesMap) await init(); JSON.parse(JSON.stringify(turnData))};
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
      nextCohesion: 0.5,
      finalQuote: 50, // PRICE OF FINAL BET
      nextQuote: 200, // MULTIPLIER FOR BET ON NEXT CONQUERER
      territories: 1,
      probability: (1/COUNTRIES)
    }
  });
  if (!restart)  await loadSavedState();
  if (!simulation) ROUND = await t.getCurrentRound(0).then(r=>r.round);
  if (!simulation && restart) return await saveCurrentState();
};

const loadSavedState = async () => {
  let r = firebase.data.once('value').then(r=>r.val());
  countriesMap = firebase.countriesMap.once('value').then(r=>r.val());
  turn = r["turn"];
  turnData = r["turnData"];
};

const saveCurrentState = async () => {
  firebase.countriesMap.set(countriesMap);
  return firebase.data.update({ turn, turnData });
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



const preTurn = async () => {
  if (paused) throw "Turn needs to be resumed before updating turn.";
  if (winner() != null) return;
  turn += 1;
  paused = true;
}

const postTurn = async (turnData) => {
  // UPDATE TERRITORIES
  if (turnData.battle)
    switch (turnData.battle.result) {
      case 1:
        countriesMap[turnData.battle.o].territories = (countriesMap[turnData.battle.o].territories || 1) + 1;
        countriesMap[turnData.battle.d].territories = (countriesMap[turnData.battle.d].territories || 1) - 1;
        break;
      case 2:
        countriesMap[turnData.battle.o].territories = (countriesMap[turnData.battle.o].territories || 1) - 1;
        countriesMap[turnData.battle.d].territories = (countriesMap[turnData.battle.d].territories || 1) + 1;
        break;
    }
  // GET JACKPOT
  let jackpot = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let bets = await firebase.bets.getCurrentTurnBets(0, ROUND);
  let betsPerCountry = new Array(COUNTRIES).fill(0);
  bets.forEach((e,i)=>betsPerCountry[e.userChoice]+=1);

  // CALCULATE NEW EXACT PDF AND QUOTES
  realPdf().forEach((e,i)=>{
    countriesMap[i].probability = e;
    let pf = countriesMap[i].territories/COUNTRIES;
    countriesMap[i].nextQuote = utils.quoteFromProbability(e);
    countriesMap[i].finalQuote = Math.round(((jackpot * pf)/(betsPerCountry[i]+1)) + 50 + (turn/100));
    countriesMap[i].cohesion = countriesMap[i].nextCohesion;
  })
  turnData.next.quotes = turnData.next.probabilities.map(e=>utils.quoteFromProbability(e));

}


// Returns is game over?
const launchNextTurn = async (_entropy1, _entropy2) => {
  if (!paused) throw "Turn needs to be paused before computing next state.";
  paused = false;

  if (!countriesMap) await init();
  // GAME IS ALREADY OVER
  if (fairness.winner(countriesMap)!=null) return true;



  // COMPUTE NEW TURN
  [countriesMap, battleData, computedRandom] = fairness.resolveNextBattle(countriesMap, turnData, (_entropy1 || utils.randomHex()), (_entropy2 || utils.randomHex()));
  [countriesMap, nextData, computedRandom] = fairness.resolveNextConqueror(countriesMap, turnData, (_entropy1 || utils.randomHex()), (_entropy2 || utils.randomHex()));
  turnData = {};
  turnData.turn = turn - 1;
  turnData.battle = battleData;
  turnData.next = nextData;
  turnData.winner = fairness.winner(countriesMap);


  if (simulation) return turnData.winner != null;

  // UPDATE EXTERNAL DATA
  await postTurn(turnData);
  await saveCurrentState();

  console.log("[WWB]: War concluded with: " + turnData.battle.result)
  switch (turnData.battle.result) {
    case 0:
      console.log("[WWB]: FULL TIE! " + turnData.battle.o + " peacefully resolved with " + turnData.battle.d);
      break;
    case 1:
      console.log("[WWB]: Offender " + turnData.battle.o + " striked " + turnData.battle.d + " and got " + turnData.battle.dt);
      break;
    case 2:
      console.log("[WWB]: Defender " + turnData.battle.d + " counterattacked " + turnData.battle.o + " and gained " + turnData.battle.ot);
      break;
  }
  if (turnData.next.civilWar) console.log("[WWB]:KABOOM! " + turnData.next.o + " is rebelling on " + turnData.next.d);
  console.log("[WWB]: Conquerer " + turnData.next.o + "  is attacking: " + turnData.next.d + "   in country: " + turnData.next.dt + " from: "  + turnData.next.ot);

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
      preTurn();
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
  preTurn,
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
