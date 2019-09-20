const config = require("./config");
const CIVIL_WAR_LIKELIHOOD = config.wwb.civilWarLikelihood;
const BATTLE_WEIGHT = [0.5, 2, 1];
const neighborCountries = require('./map-utilities/neighborCountries');
const utils = require("./utils");

const initTurnData = () => {
  return {
    civilWar: false,
    o: null,
    ot: null,
    d: null,
    dt: null,
    probabilities: []
  };
}

const conquerableTerritoriesOf = (countriesMap, c) => {
  return neighborCountries[c].filter((t)=>{
    return countriesMap[t].occupiedBy != countriesMap[c].occupiedBy;
  })
}

const conqueredTerritoriesOf = (countriesMap, c) => {
  return Object.keys(countriesMap).filter((t)=>countriesMap[t].occupiedBy==c);
}


const countriesOnTheBorders = (countriesMap) => {
  return Object.keys(countriesMap).filter((c)=>{
    return conquerableTerritoriesOf(countriesMap, c).length;
  })
}

const countriesStillAlive = (countriesMap) => {
  return [...new Set(
    countriesMap.map((c)=>{return c.occupiedBy;})
  )];
}

const rawPdf = (countriesMap) => {
  return countriesMap.map((c,idx)=>{
    let pOfConquest = Math.min(conquerableTerritoriesOf(countriesMap, idx).length,1) * countriesMap[c.occupiedBy].cohesion * (1 - CIVIL_WAR_LIKELIHOOD);
    let pOfCivilWar =  (c.occupiedBy != idx ? 1 : 0) * c.cohesion * CIVIL_WAR_LIKELIHOOD;
    return [pOfConquest,  pOfCivilWar];
  })
}

const pdf = (countriesMap) => {
  let r = rawPdf(countriesMap);
  let total = r.reduce((acc, c) => acc + c[0] + c[1], 0);
  return r.map(c=>[c[0]/total, c[1]/total]);
}

const cumulatedPdf = (countriesMap) => {
  let cumulated = 0;
  return pdf(countriesMap).map(c=>{
    return [cumulated += c[0], cumulated += c[1]]
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
  if (!countriesOnTheBorders(countriesMap).length) return countriesMap[0].occupiedBy;
  return null;
}

const computeRandom = (firstEntropy, secondEntropy, thirdEntropy) => {
  return utils.randomFromHex(firstEntropy.toString(16) + secondEntropy.toString(16) + thirdEntropy.toString(16));
}

const getIntegerFrom = (random, odds) => {
  return Math.floor(random * odds);
}

const battlePdf = (countriesMap, nextData) => {
  let _1 = BATTLE_WEIGHT[1] * countriesMap[nextData.o].cohesion
  let _2 = BATTLE_WEIGHT[2] * countriesMap[nextData.d].cohesion
  let _x = BATTLE_WEIGHT[0] * (countriesMap[nextData.ot].cohesion + countriesMap[nextData.dt].cohesion)/2
  if (nextData.civilWar) {
    _x = _2;
    _2 = 0;
  }
  let _tot = _x + _1 + _2;
  return [_x/_tot, _1/_tot, _2/_tot];
}

const cumulatedBattlePdf = (countriesMap, nextData) => {
  let cumulated = 0;
  return battlePdf(countriesMap, nextData).map(c=>cumulated += c);
}

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
  if (!turnData.next) return [undefined, undefined];
  let battleData = turnData.next;
  let rand0 = computeRandom(firstEntropy, secondEntropy, 0);
  let cpdf = cumulatedBattlePdf(countriesMap, battleData);
  let scenario = resolveScenario(cpdf, rand0);
  battleData.result = scenario;
  return [battleData, [rand0]];
}


// returns [newCountriesMap, nextData]
const resolveNextConqueror = (countriesMap, turnData, firstEntropy, secondEntropy) => {
  if (winner(countriesMap)!=null) return [undefined, undefined];
  let nextData = initTurnData();

  let rand1 = computeRandom(firstEntropy, secondEntropy, 1);
  let rand2 = computeRandom(firstEntropy, secondEntropy, 2);

  let cpdf = cumulatedPdf(countriesMap).reduce((acc, val) => acc.concat(val), []);
  let scenario = resolveScenario(cpdf, rand1);

  nextData.civilWar = scenario % 2;
  let ot = Math.floor(scenario / 2);
  if (nextData.civilWar) {
    nextData.ot = ot;
    nextData.o = ot;
    nextData.dt = ot;
    nextData.d = countriesMap[ot].occupiedBy;
  } else {
    nextData.ot = ot;
    nextData.o = countriesMap[ot].occupiedBy;
    let cts = conquerableTerritoriesOf(countriesMap, nextData.ot);
    nextData.dt = cts[getIntegerFrom(rand2, cts.length)];
    nextData.d = countriesMap[nextData.dt].occupiedBy;
  }
  nextData.probabilities = battlePdf(countriesMap, nextData);

  return [nextData, [rand1, rand2]];
}


const computeFairResult = (mapState, firstEntropy, secondEntropy) => {
  let m = JSON.parse(Buffer.from(mapState, 'base64').toString('ascii'));
  [battle, random] = resolveNextBattle(m.countriesMap, m.turnData, firstEntropy, secondEntropy);
  [next, random] = resolveNextConqueror(m.countriesMap, m.turnData, firstEntropy, secondEntropy);
  // console.log("Previous Battle:  " + utils.universalMap(battle.o) + " vs " + utils.universalMap(battle.d) + " ended with a " + (battle.result || "X" ) );
  // if (next.civilWar) console.log("Next is a civil war:  " + utils.universalMap(next.o) + " is rebelling on " + utils.universalMap(next.d));
  // else console.log("Next conqueror is:  " + utils.universalMap(next.o) + " attacking " + utils.universalMap(next.d) + " from: " + utils.universalMap(next.ot) + " to control: " + utils.universalMap(next.dt) );
  return [battle, next];
}


module.exports = {
  countriesStillAlive,
  conquerableTerritoriesOf,
  conqueredTerritoriesOf,
  countriesOnTheBorders,
  cumulatedPdf,
  pdf,
  realPdf,
  resolveNextBattle,
  resolveNextConqueror,
  computeFairResult,
  winner
}
