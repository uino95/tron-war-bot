// DB interface
const firebase = require('./firebase')
const twb = require('./tronWarBot')
const utils = require('./utils')
const config = require('./config')
const fairness = require('./fairness')
const neighborCountries = require('./map-utilities/neighborCountries');
const COUNTRIES = neighborCountries.length;
var ROUND = 0;
// SIMULATION PARAMS
const SIMULATIONS = 5;
const EXPECTED_TURN_DURATION = 300;

var countriesMap, turnData;
const turnQueue = {};
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
const currentTurnData = async () => {if (!countriesMap) await init(); return JSON.parse(JSON.stringify(turnData))};
const mapState = async () => {if (!countriesMap) await init(); return JSON.parse(JSON.stringify(countriesMap));}

// Returns array of countryIndexes
// const countriesStillAlive = () => fairness.countriesStillAlive(countriesMap);

const pdf = () => fairness.pdf(countriesMap);
const cumulatedPdf = () => fairness.cumulatedPdf(countriesMap);
const realPdf = () => fairness.realPdf(countriesMap);

const winner = () => fairness.winner(countriesMap);

// const compressedState = async ()=>{
//   let cMap = await mapState();
//   let td = await currentTurnData();
//   let mapCompressedCopy = new Array(COUNTRIES).fill({});
//   cMap.forEach((e, idx)=>{
//     mapCompressedCopy[idx] = {
//       c: e.cohesion,
//       o: e.occupiedBy
//     }
//   });
//   if (td.battle && td.battle.quotes) delete td.battle.quotes;
//   if (td.next && td.next.quotes) delete td.battle.quotes;
//   let o = {countriesMap : mapCompressedCopy, turnData: td}
//   return Buffer.from(JSON.stringify(o), "ascii").toString("base64");
// }

const init = async (restart) => {
  if(restart) console.warn("[WWB]: Restarting game...")
  turn = 1;
  turnData = {};
  countriesMap = new Array(COUNTRIES).fill(0).map((e,idx)=>{
    return {
      // occupiedBy: idx,
      idx,
      cohesion: 0.5, // infection rate
      nextCohesion: 0.5,
      // finalQuote: 25, // PRICE OF FINAL BET
      // nextQuote: 200, // MULTIPLIER FOR BET ON NEXT CONQUERER
      // territories: 1,
      probability: (1/COUNTRIES),
      population:100, //total population
      deaths:0, // total deaths
      infected:0, // active * infection rate
      active:100,  // total pop - deaths
    }
  });
  if (!restart)  await loadSavedState();
  if (!simulation) ROUND = await twb.getCurrentRound(0).then(r=>r.round);
  if (!simulation && restart) return await saveCurrentState();
};

const loadSavedState = async () => {
  let r = await firebase.data.once('value').then(r=>r.val());
  countriesMap = await firebase.countriesMap.once('value').then(r=>r.val());
  turn = r["turn"];
  turnData = r["turnData"] || {};
};

const saveCurrentState = async () => {
  firebase.countriesMap.set(countriesMap);
  return firebase.data.update({ turn, turnData });
};


const printStatus = ()=>{
  // countriesMap.forEach((c,idx)=>console.log(idx + " => " + c.occupiedBy + "  cohesion:" + c.cohesion.toFixed(4)));
}

const isValidAmbassador = (u) => {
  return !countriesMap
    .filter(e=>e.ambassador && (e.ambassador.id==u.id || e.ambassador.address==u.address))
    .length
}

const addAmbassador = (u)=>{
  if (!countriesMap || !countriesMap[u.country] || !!countriesMap[u.country].ambassador)
    return false;
  if (!u.link) delete u.link;
  countriesMap[u.country].ambassador = u;
  firebase.countriesMap.child(u.country).set(countriesMap[u.country]);
  console.log("[WWB]: Added new Ambassador " + u.name + " for " + utils.universalMap(u.country));
  return true;
}

const leaderboard = ()=>{
  return countriesMap
      .map((e,idx)=>{ return e })
      .sort((a, b)=>{
        return (b.deaths/b.population) - (a.deaths/a.population);
      });
}


const onTurn = (tn, fn)=>{
  if (!tn) throw "Missing callback or turn number";
  if (!fn && typeof tn != "function") throw "Missing callback or turn number";
  if (fn && !parseInt(tn)) throw "Invalid parameter";
  if (fn && typeof fn != "function") throw "Missing callback";
  if (typeof tn == "function") {fn = tn; tn = 0;}
  tn = parseInt(tn);
  if (tn!=0 && tn < turn) return;
  turnQueue[tn.toString()] = turnQueue[tn.toString()] || [];
  let idx = turnQueue[tn.toString()].push(fn);
  return {
    stop:()=>{ turnQueue[tn.toString()][idx] = undefined; }
  };
}

const preTurn = async () => {
  if (paused) throw "Turn needs to be resumed before updating turn.";
  if (winner() != null) return;
  turn += 1;
  paused = true;
}

const postTurn = async (turnData) => {
  // GET JACKPOT
  // let jackpot = await twb.jackpot();
  // let bets = (await firebase.bets.getCurrentTurnBets(0, ROUND) )|| [];
  // let betsPerCountry = new Array(COUNTRIES).fill(0);
  // bets.forEach((e,i)=>betsPerCountry[e.userChoice]+=1);

  // CALCULATE NEW EXACT PDF AND QUOTES
  realPdf().forEach((e,i)=>{
    countriesMap[i].probability = e;
    // let pf = countriesMap[i].territories/COUNTRIES;
    // countriesMap[i].nextQuote = utils.quoteFromProbability(e);
    // let discountFactor = (betsPerCountry[i]+1)/(betsPerCountry[i]+2);
    // countriesMap[i].finalQuote = Math.round((((jackpot * pf)/(betsPerCountry[i]+1)) + 50) * discountFactor);
  })
  // if (turnData.next) turnData.next.quotes = turnData.next.probabilities.map(e=>utils.quoteFromProbability(e));
  //CALL EXTERNAL SCHEDULED FUNCTIONS
  let awakeFn = turnQueue[turnData.turn.toString()] || [];
  awakeFn = awakeFn.concat(turnQueue["0"] || []);
  if (!awakeFn.length) return;
  let cmap = await mapState();
  let td = await currentTurnData();
  awakeFn.forEach((fn)=>{
    try { if(fn) fn(cmap,td); }
    catch (e) {console.error(e)}
  });
  delete turnQueue[turn.toString()];
}


const updateCohesion = (battle, next) => {
  countriesMap.forEach((e,i)=>{
    if (next && i==next.receiver){
      //TO UPDATE FRONTEND AS +/- GETS SHOWN UNDER battle.stats
      battle.stats[i].deaths += next.deaths;
      battle.stats[i].infected += next.infected;
      battle.stats[i].cohesion += next.cohesion;
    }
    let delta = ((battle.stats[i] || {}).cohesion || 0);
    let nc = editCohesion(i, delta, undefined, false);
    battle.stats[i].cohesion = (nc || {}).delta || 0;
    countriesMap[i].cohesion = countriesMap[i].nextCohesion;
  });
}

const editPopulation =  (country, params) => {
  let c = countriesMap[country]
  let deaths = Math.min(Math.ceil(params.deaths * 0.01 * c.active), c.active);
  countriesMap[country].deaths = c.deaths + deaths;
  countriesMap[country].active = c.population - c.deaths;
  countriesMap[country].infected = Math.max(0,c.infected - deaths);

  let infected = Math.min((c.active - c.infected), Math.ceil(params.infected * 0.01 * (c.active - c.infected)))
  let recovered = Math.min(c.infected, Math.ceil(params.recovered * 0.01 * c.infected));
  countriesMap[country].infected = c.infected + infected - recovered;

  firebase.countriesMap.child(country).set(countriesMap[country]);
  return {deaths, infected, recovered};
}


const editCohesion = (country, delta, threshold={upper: 100, lower: 0.1}, save=true) => {
  if (!delta) return;
  let old = countriesMap[country].nextCohesion;
  delta = parseFloat(delta.toFixed(1));
  delta = delta/100;
  const upper = Math.max(old, (threshold.upper/100));
  const lower = Math.min(old, (threshold.lower/100));
  let _new = old + delta;
  _new = Math.max(Math.min(_new, upper), lower);
  if (old == _new) return;
  countriesMap[country].nextCohesion = _new;
  if (save && !simulation) {
    //Save on db
    firebase.countriesMap.child(country).set(countriesMap[country]);
    console.log("[WWB]: Updating cohesion of " + utils.universalMap(country) +  "("+utils.toPercent(countriesMap[country].cohesion)+") by: " + utils.toPercent(delta)+ "\tnew value: " +  utils.toPercent(countriesMap[country].nextCohesion));
  }
  return {
    turn: turn,
    country: country,
    old,
    new: _new,
    delta: _new - old
  }
}

const saveCohesion = async (update, battle)=>{
  if (simulation) return;
  if (!update) return;
  update.update_type= "BATTLE";
  update.battle = battle;
  let id = update.turn +'|TWB|' + update.update_type +'|'+ update.country;
  await firebase.cohesion.child(id).set(update);
}

// Returns is game over?
const launchNextTurn = async (_entropy1=utils.randomHex(), _entropy2=utils.randomHex()) => {
  if (!paused) throw "Turn needs to be paused before computing next state.";
  paused = false;

  if (!countriesMap) await init();
  // GAME IS ALREADY OVER
  if (fairness.winner(countriesMap)!=null) return true;


  let nextData, battleData, computedRandom;
  // COMPUTE NEW TURN
  // Mutate virus. Determines fatality and spreading rate
  [battleData, computedRandom] = fairness.resolveNextBattle(countriesMap, turnData, _entropy1, _entropy2);
  // Send virus pack to another county or open a virus box or quarantine the country
  [nextData, computedRandom] = fairness.resolveNextConqueror(countriesMap, turnData, _entropy1, _entropy2);
  // Update new infection levels
  updateCohesion(battleData, nextData);

  turnData = {};
  turnData.turn = turn - 1;
  turnData.battle = battleData || "";
  turnData.next = nextData || "";
  turnData.winner = fairness.winner(countriesMap);
  if (simulation) return turnData.winner != null;

  // UPDATE EXTERNAL DATA
  await postTurn(turnData);
  await saveCurrentState();

  // if (turnData.next && turnData.next.civilWar) console.log("[WWB]:KABOOM! " + turnData.next.o + " is rebelling on " + turnData.next.d);
  return turnData.winner != null;
}




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
    await init(true);
    let go
    let leaders = {}
    do {
      preTurn();
      go = await launchNextTurn()
      // if (!(turn % 5)) editCohesion(utils.randomInt(15), (utils.randomInt(12)-2)/10)
      // if (!(turn % 100)) {saveCurrentState(), await utils.sleep(5000)}
      if (!(turn % 2)) {
        realPdf().forEach((e,i)=>{
          countriesMap[i].probability = e;
        })
        let l = leaderboard();
        leaders[l[0].idx] = l[0];
        console.log("Current leader at " + turn + " is: " + l[0].idx + " with cohesion: " + utils.toPercent(l[0].cohesion) + " deaths: " + l[0].deaths + " and infected: " + l[0].infected)
      }
      let d = turnData;
      if (d.next) {
        civilWars += d.next.civilWar;
        conquest[d.next.o] += 1;
      }
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
  console.log("\n[WWB]: Using civil War Likelihood: " + config.wwb.civilWarLikelihood);
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
  isValidAmbassador,
  addAmbassador,
  leaderboard,
  preTurn,
  onTurn,
  launchNextTurn,
  editPopulation,
  editCohesion,
  // countriesStillAlive,
  cumulatedPdf,
  printStatus,
  pdf,
  simulate,
  // compressedState,
  winner
}
