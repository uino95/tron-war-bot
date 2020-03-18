const config = require("./config");
const fakeNews = require("./fakeNews");
// const CIVIL_WAR_LIKELIHOOD = config.wwb.civilWarLikelihood;
// const BATTLE_WEIGHT = config.wwb.battleWeight;
var FATALITY_RATE = config.wwb.fatality.initial;
var TRANSMISSION_RATE = config.wwb.transmission.initial;
var RECOVERY_RATE = config.wwb.recovery.initial;

//The rates are daily assumptions thus must be scaled for the number of iterations in a day.
const RATE_MULTIPLIER = Math.floor(24*60*60/(config.timingProd.turn || 1))

// const neighborCountries = require('./map-utilities/neighborCountries');
const utils = require("./utils");

const initTurnData = () => {
  return {
    sender: null,
    receiver: null,
    description: "this is a dummy description",
    cohesion: null,
    infected: null,
    deaths: null
  };
}

const conquerableTerritoriesOf = (countriesMap, c) => {
  return countriesMap.filter((t)=>{
    return t.population != 1 && t.idx != c;
    // return countriesMap[t].occupiedBy != countriesMap[c].occupiedBy;
  })
}

// const conqueredTerritoriesOf = (countriesMap, c) => {
//   return Object.keys(countriesMap).filter((t)=>countriesMap[t].occupiedBy==c);
// }


const deadCountries = (countriesMap) => {
  return Object.keys(countriesMap).filter((c)=>{
    return countriesMap[c].active == 0;
  })
}

// const countriesStillAlive = (countriesMap) => {
//   return [...new Set(
//     countriesMap.map((c)=>{return c.occupiedBy;})
//   )];
// }


const pdf = (countriesMap) => {
  let r = rawPdf(countriesMap);
  let total = r.reduce((acc, c) => {
    return acc + c.reduce((a,v)=>a+v,0);
  }, 0);
  return r.map(c=>{
    let o = []
    for (var i in c) o.push(c[i]/total)
    return o;
  });
}

const cumulatedPdf = (countriesMap) => {
  let cumulated = 0;
  return pdf(countriesMap).map(c=>{
    let r = []
    for (var i in c) r.push(cumulated += c[i])
    return r;
  });
}

// Returns array of countryIndexes
const realPdf = (countriesMap) => {
  var p = new Array(countriesMap.length).fill(0);
  pdf(countriesMap).forEach((e,i)=>{
    p[countriesMap[i].occupiedBy] += e[0];
    p[i] += e[1];
  })
  return p;
}

const winner = (countriesMap) => {
  if (deadCountries(countriesMap).length) return deadCountries(countriesMap)[0];
  return null;
}

const computeRandom = (firstEntropy, secondEntropy, thirdEntropy) => {
  return utils.randomFromHex(firstEntropy.toString(16) + secondEntropy.toString(16) + thirdEntropy.toString(16));
}

const getIntegerFrom = (random, odds) => {
  return Math.floor(random * odds);
}

// const battlePdf = (countriesMap, nextData) => {
//   let _1 = BATTLE_WEIGHT[1] * countriesMap[nextData.o].cohesion
//   let _2 = BATTLE_WEIGHT[2] * countriesMap[nextData.d].cohesion
//   let _x = BATTLE_WEIGHT[0] * (countriesMap[nextData.ot].cohesion + countriesMap[nextData.dt].cohesion)/2
//   if (nextData.civilWar) {
//     _x = _2;
//     _2 = 0;
//   }
//   let _tot = _x + _1 + _2;
//   return [_x/_tot, _1/_tot, _2/_tot];
// }
//
// const cumulatedBattlePdf = (countriesMap, nextData) => {
//   let cumulated = 0;
//   return battlePdf(countriesMap, nextData).map(c=>cumulated += c);
// }

const resolveScenario = (cpdf, random) => {
  let scenario = cpdf.length - 1;
  for (var i=0; i < cpdf.length; i++) {
    if (random > cpdf[i]) continue;
    scenario = i;
    break;
  }
  return scenario;
}

const resolveNextBattle = (countriesMap, turnData, firstEntropy, secondEntropy) => {
  let battle = {};
  let rand0 = computeRandom(firstEntropy, secondEntropy, 0);
  let rand1 = computeRandom(firstEntropy, secondEntropy, 1);
  let rand2 = computeRandom(firstEntropy, secondEntropy, 2);

  let deltaFatality = 1 + (((rand0-0.5) + config.wwb.fatality.bias) * config.wwb.fatality.spread)
  FATALITY_RATE = Math.max(config.wwb.fatality.min, Math.min(0.99, FATALITY_RATE *  deltaFatality))

  let deltaRecovery = 1 + (((rand1-0.5) + config.wwb.recovery.bias) * config.wwb.recovery.spread)
  RECOVERY_RATE = Math.max(config.wwb.recovery.min, Math.min(0.99, RECOVERY_RATE *  deltaRecovery))

  let deltaTransmission = 1 + (((rand2-0.5) + config.wwb.transmission.bias) * config.wwb.transmission.spread)
  TRANSMISSION_RATE = Math.max(config.wwb.transmission.min, TRANSMISSION_RATE *  deltaTransmission)

  battle.fatality = FATALITY_RATE;
  battle.transmission = TRANSMISSION_RATE;
  battle.recovery = RECOVERY_RATE;
  battle.stats = {};

  for (var c of countriesMap) {
    let stats = {
      deaths:0,
      infected:0,
      recovered:0,
      cohesion:0,
    }
    battle.stats[c.idx] = stats;
    // SKIP STUPID COUNTRIES
    if (c.population == 1) continue;

    // EVALUATE RESISTANCE
    let resistance = (0.5 + c.cohesion)**4

    // EVALUATE NEW DEATHS
    let newDeaths = Math.ceil( c.infected * (FATALITY_RATE/RATE_MULTIPLIER) / resistance);
    c.deaths = c.deaths + newDeaths;
    c.active = c.population - c.deaths;
    c.infected = Math.min(c.infected - newDeaths, c.active);

    stats.deaths = newDeaths;
    if (c.active <= 0 ) continue;
    // EVALUATE NEW RECOVERED
    let newRecovered = Math.floor(c.infected * (RECOVERY_RATE/RATE_MULTIPLIER) * resistance);

    // EVALUATE NEW INFECTIONS
    let newInfected = Math.ceil( (c.active - c.infected) * (c.infected/c.active) * ((TRANSMISSION_RATE/RATE_MULTIPLIER) / resistance) );

    // SHAKE RESISTANCE
    // let delta = (((newRecovered+newDeaths-newInfected)/c.infected)**(1/2) + config.wwb.cohesion.battle.bias) * Math.log(c.population)**2
    // let delta =  - Math.cos((0.34 + c.deaths/c.population) * 1.15 * Math.PI) + config.wwb.cohesion.battle.bias
    let rate = (c.deaths/c.population)
    delta = rate > 0.001 ? -1 : -1.5;
    delta = rate > 0.002 ? 0 : delta;
    delta = rate > 0.003 ? 1 : delta;
    delta = rate > 0.997 ? 1 : delta;
    delta = rate > 0.998 ? -0.3 : delta;
    delta = rate > 0.999 ? -0.6 : delta;
    delta = rate > 0.99995 ? 1 : delta;
    // delta = Math.min(Math.max(-config.wwb.cohesion.battle.spread, delta), config.wwb.cohesion.battle.spread)
    delta = delta * config.wwb.cohesion.battle.spread * ((1 + (c.infected/c.active))**(2))
    c.infected = Math.min(c.infected + newInfected - newRecovered, c.active);

    stats.infected = newInfected;
    stats.recovered = newRecovered;
    stats.cohesion = delta;

  }

  return [battle, [rand0, rand1, rand2]];
}

const rawPdf = (countriesMap) => {
  return countriesMap.map((c,idx)=>{
    if (c.population == 1) return [0,0,0,0];
    let popLog = c.population**(1/2);
    let pOfDeaths = popLog * (c.infected + 1) / c.population;
    let pOfInfected = popLog * (c.active + 1) / c.population;
    let pOfCohesion = popLog * (c.deaths + 1) / c.population;
    let pOfRandom = popLog / c.population;
    return [pOfDeaths,  pOfInfected, pOfCohesion, pOfRandom]; //NUMBER OF SCENARIOS TYPES
  })
}

// returns [newCountriesMap, nextData]
const resolveNextConqueror = (countriesMap, turnData, firstEntropy, secondEntropy) => {
  if (winner(countriesMap)!=null) return [undefined, undefined];
  let nextData = initTurnData();
  let rand1 = computeRandom(firstEntropy, secondEntropy, 1);
  let rand2 = computeRandom(firstEntropy, secondEntropy, 2);
  let rand3 = computeRandom(firstEntropy, secondEntropy, 3);

  let _cpdf = cumulatedPdf(countriesMap);
  let _scenarios = _cpdf[0].length;
  let cpdf = _cpdf.reduce((acc, val) => acc.concat(val), []);
  let scenario = resolveScenario(cpdf, rand1);
  let _height = scenario % _scenarios; //Type of scenario picked
  let _width = Math.floor(scenario / _scenarios); // Country picked

  nextData.receiver = _width;
  let cts = conquerableTerritoriesOf(countriesMap, nextData.receiver);
  nextData.sender = cts[getIntegerFrom(rand2, cts.length)].idx;
  nextData.cohesion = 0;
  nextData.infected = 0;
  nextData.deaths = 0;

  let rcv = countriesMap[nextData.receiver];

  switch(_height) {
    case 0:
      // Deaths impact
      {
        let popLog = Math.log(rcv.active||1);
        let _d = Math.floor(popLog * (rand3 + 1 - config.wwb.cohesion.next.bias));
        nextData.deaths = Math.floor(Math.min(Math.max(1, _d), rcv.active));
      }
      break;
    case 1:
      // Infected/recovered impacts
      {
        let popLog = rcv.active**(1/4);
        let _d = Math.floor(popLog * ((rand3 - 0.5)*2 - config.wwb.cohesion.next.bias));
        let newInfected = Math.min(Math.max(0, (rcv.infected + _d)), rcv.active);
        nextData.infected = newInfected - rcv.infected;
      }
      break;
    case 2:
      // Cohesion weakening/strengthening impacts
      {
        let popLog = rcv.deaths/rcv.population;
        let _d = Math.sign(popLog - rand3 + config.wwb.cohesion.next.bias) * (rand3**(1/3));
        nextData.cohesion =  _d * config.wwb.cohesion.next.spread;
      }
      break;
    default:
      // Random generic news. Do nothing.
  }

  nextData.description = fakeNews.generate(nextData);
  let originalInfected = rcv.infected;

  countriesMap[nextData.receiver].deaths = rcv.deaths + nextData.deaths;
  countriesMap[nextData.receiver].active = rcv.population - rcv.deaths;
  countriesMap[nextData.receiver].infected = Math.min(rcv.infected + nextData.infected, countriesMap[nextData.receiver].active);
  //Correction as non infected people can also dies
  nextData.infected = countriesMap[nextData.receiver].infected - originalInfected;
  return [nextData, [rand1, rand2, rand3]];
}



// const computeFairResult = (mapState, firstEntropy, secondEntropy) => {
//   let m = JSON.parse(Buffer.from(mapState, 'base64').toString('ascii'));
//   let countriesMap = m.countriesMap.map((e)=>{return {occupiedBy:e.o, cohesion : e.c}});
//   [battle, random] = resolveNextBattle(countriesMap, m.turnData, firstEntropy, secondEntropy);
//   [next, random] = resolveNextConqueror(countriesMap, m.turnData, firstEntropy, secondEntropy);
//   // console.log("Previous Battle:  " + utils.universalMap(battle.o) + " vs " + utils.universalMap(battle.d) + " ended with a " + (battle.result || "X" ) );
//   // if (next.civilWar) console.log("Next is a civil war:  " + utils.universalMap(next.o) + " is rebelling on " + utils.universalMap(next.d));
//   // else console.log("Next conqueror is:  " + utils.universalMap(next.o) + " attacking " + utils.universalMap(next.d) + " from: " + utils.universalMap(next.ot) + " to control: " + utils.universalMap(next.dt) );
//   return [battle, next];
// }


module.exports = {
  // countriesStillAlive,
  conquerableTerritoriesOf,
  // conqueredTerritoriesOf,
  deadCountries,
  cumulatedPdf,
  pdf,
  realPdf,
  resolveNextBattle,
  resolveNextConqueror,
  // computeFairResult,
  winner
}
