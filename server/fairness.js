const config = require("./config");
const COHESION_BIAS = config.wwb.cohesionBias;
const CIVIL_WAR_LIKELIHOOD = config.wwb.civilWarLikelihood;
const BATTLE_WEIGHT = [0.1, 2, 1];
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


const updateCohesion = (countriesMap, turnData, random) => {
  // let o = turnData.o;
  // let d = turnData.d;
  // let ot = turnData.ot;
  // let dt = turnData.dt;
  // let o_amp = conqueredTerritoriesOf(countriesMap, o).length / countriesMap.length;
  // let d_amp = conqueredTerritoriesOf(countriesMap, d).length / countriesMap.length;
  // let rnd = COHESION_BIAS - random;
  // let c_o = countriesMap[o].cohesion - 0.5;
  // let c_d = countriesMap[d].cohesion - 0.5;
  // let c_ot = countriesMap[ot].cohesion - 0.5;
  // let c_dt = countriesMap[dt].cohesion - 0.5;
  // let delta_o =  (rnd + (-c_ot - c_d - c_dt)/3) * o_amp;
  // let delta_d =  (rnd + (c_ot - c_o - c_dt)/3) * d_amp;
  // let delta_ot = (rnd + (-c_o + c_d + c_dt)/3) * o_amp;
  // let delta_dt = (rnd + (-c_o + c_d + c_ot)/3) * d_amp;
  // let new_o = countriesMap[o].cohesion + delta_o;
  // let new_d = countriesMap[d].cohesion + delta_d;
  // let new_ot = countriesMap[ot].cohesion + delta_ot;
  // let new_dt = countriesMap[dt].cohesion + delta_dt;
  // countriesMap[dt].cohesion = Math.max(0, Math.min(1, new_dt));
  // countriesMap[ot].cohesion =  Math.max(0, Math.min(1, new_ot));
  // countriesMap[d].cohesion = Math.max(0.001, Math.min(1, new_d));
  // countriesMap[o].cohesion =  Math.max(0.001, Math.min(1, new_o));
  // turnData.cohesion = {
  //   o :countriesMap[o].cohesion,
  //   d :countriesMap[d].cohesion,
  //   ot :countriesMap[ot].cohesion,
  //   dt :countriesMap[dt].cohesion,
  //   delta_o,
  //   delta_d,
  //   delta_ot,
  //   delta_dt,
  // }
}

const battlePdf = (countriesMap, nextData) => {
  var _x = BATTLE_WEIGHT[0] * (countriesMap[nextData.ot].cohesion + countriesMap[nextData.dt].cohesion)
  var _1 = BATTLE_WEIGHT[1] * countriesMap[nextData.o].cohesion
  var _2 = BATTLE_WEIGHT[2] * countriesMap[nextData.d].cohesion
  var _tot = _x + _1 + _2;
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
  if (!turnData.next) return [countriesMap, undefined];
  let battleData = turnData.next;
  let rand = computeRandom(firstEntropy, secondEntropy, 0);
  let cpdf = cumulatedBattlePdf(countriesMap, battleData);
  let scenario = resolveScenario(cpdf, rand);
  battleData.result = scenario;
  return [countriesMap, battleData];
}


// returns [newCountriesMap, nextData]
const resolveNextConqueror = (countriesMap, turnData, firstEntropy, secondEntropy) => {
  if (winner(countriesMap)!=null) return [countriesMap, undefined];
  let nextData = initTurnData();

  let rand0 = computeRandom(firstEntropy, secondEntropy, 0);
  let rand1 = computeRandom(firstEntropy, secondEntropy, 1);

  let cpdf = cumulatedPdf(countriesMap).reduce((acc, val) => acc.concat(val), []);
  let scenario = resolveScenario(cpdf, rand0);

  let civilWar = scenario % 2;
  let ot = Math.floor(scenario / 2);
  let o = civilWar ? ot : countriesMap[ot].occupiedBy;
  let cts = conquerableTerritoriesOf(countriesMap, ot);
  let dt = civilWar ? countriesMap[ot].occupiedBy : cts[getIntegerFrom(rand1, cts.length)];

  nextData.civilWar = civilWar;
  nextData.ot = ot;
  nextData.o = o;
  nextData.dt = dt;
  nextData.d = civilWar ? countriesMap[ot].occupiedBy : countriesMap[dt].occupiedBy;
  nextData.probabilities = battlePdf(countriesMap, nextData);

  return [countriesMap, nextData, [rand0, rand1]];
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
  winner
}
