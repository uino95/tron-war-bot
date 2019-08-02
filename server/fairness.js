const COHESION_BIAS = 0.3;
const CIVIL_WAR_LIKELIHOOD = 0.2;
const neighborCountries = require('./map-utilities/neighborCountries');
const utils = require("./utils");

const initTurnData = () => {
  return {
    winner: null,
    civilWar: false,
    o: null,
    ot: null,
    d: null,
    dt: null,
    cohesion: {
      o: null,
      d: null,
      ot: null,
      dt: null,
      delta_o: null,
      delta_d: null,
      delta_ot: null,
      delta_dt: null,
    }
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
    let pOfConquest = Math.min(conquerableTerritoriesOf(countriesMap, idx).length,1) * countriesMap[c.occupiedBy].cohesion;
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
  return utils.randomFromHex(utils.sha256(firstEntropy + secondEntropy + thirdEntropy));
}

const getIntegerFrom = (random, odds) => {
  return Math.floor(random * odds);
}


const updateCohesion = (countriesMap, turnData, random) => {
  let o = turnData.o;
  let d = turnData.d;
  let ot = turnData.ot;
  let dt = turnData.dt;
  let o_amp = conqueredTerritoriesOf(countriesMap, o).length / countriesMap.length;
  let d_amp = conqueredTerritoriesOf(countriesMap, d).length / countriesMap.length;
  let rnd = COHESION_BIAS - random;
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

// returns [newCountriesMap, turnData]
const computeNextState = (countriesMap, firstEntropy, secondEntropy) => {
  let turnData = initTurnData();
  //CHECK WINNER
  if (winner(countriesMap)!=null) {
    turnData.winner = winner(countriesMap);
    return [countriesMap, turnData];
  }

  let rand0 = computeRandom(firstEntropy, secondEntropy, 0);
  let rand1 = computeRandom(firstEntropy, secondEntropy, 1);
  let rand2 = computeRandom(firstEntropy, secondEntropy, 2);

  let cpdf = cumulatedPdf(countriesMap).reduce((acc, val) => acc.concat(val), []);
  let scenario = cpdf.length - 1;
  for (var i in cpdf) {
    if (rand0 > cpdf[i]) continue;
    scenario = i;
    break;
  }
  let conquererTerritory = Math.floor(scenario / 2);
  let civilWar = scenario % 2;
  let conquerer = civilWar ? conquererTerritory : countriesMap[conquererTerritory].occupiedBy;
  let cts = conquerableTerritoriesOf(countriesMap, conquererTerritory);
  let conqueredTerritory = civilWar ? conquerer : cts[getIntegerFrom(rand1, cts.length)];
  let conquered = civilWar ? countriesMap[conquererTerritory].occupiedBy : countriesMap[conqueredTerritory].occupiedBy;

  turnData.civilWar = civilWar;
  turnData.o = conquerer;
  turnData.ot = conquererTerritory;
  turnData.d = conquered;
  turnData.dt = conqueredTerritory;
  // UPDATE CORE DATA
  updateCohesion(countriesMap, turnData, rand2);
  countriesMap[conqueredTerritory].occupiedBy = conquerer;

  turnData.winner = winner(countriesMap);

  return [countriesMap, turnData, [rand0, rand1, rand2]]
}



module.exports = {
  countriesStillAlive,
  conquerableTerritoriesOf,
  conqueredTerritoriesOf,
  countriesOnTheBorders,
  cumulatedPdf,
  pdf,
  realPdf,
  computeNextState,
  winner
}
