const admin = require('firebase-admin');
const config = require('../config');
const firebase = require('../firebase')
const utils = require('../utils')
const UPDATE_EVERY = 5;
const VERSION = 2;
const WRITE_DB="TestDatabase";

admin.initializeApp({
    credential: admin.credential.cert(config.firebaseTest),
    databaseURL: 'https://tron-war-bot-test.firebaseio.com/'
},WRITE_DB);

const db = admin.database(admin.app(WRITE_DB));
const testDB = {
  data : db.ref('public/data'),
  timelapseMap : db.ref('public/timelapseMap')
}


const COUNTRIES = 241;
var timelapseTurn;
var countriesMap;

const saveTimelapseState = () => {
  testDB.timelapseMap.set(countriesMap);
  return testDB.data.update({ timelapseTurn });
}

const init = async () => {
  timelapseTurn=1;
  countriesMap = new Array(COUNTRIES).fill(0).map((e,idx)=>{
    return {
      occupiedBy: idx,
      cohesion: 0.5,
      nextCohesion: 0.5,
      finalQuote: 25, // PRICE OF FINAL BET
      nextQuote: 200, // MULTIPLIER FOR BET ON NEXT CONQUERER
      territories: 1,
      probability: (1/COUNTRIES)
    }
  });
  await saveTimelapseState()
}


const timelapse = async () => {
  console.log('Launching timelapse script...');
  await init();
  console.log('Fetching data...');
  let feed = await fetchData();
  console.log('Waiting 5s before running...');
  await utils.sleep(5000)
  console.log('Running...');
  for (let f of feed) {
    updateMap(countriesMap, f)
    if (f.turn == timelapseTurn) continue;
    timelapseTurn = f.turn;
    if (timelapseTurn%UPDATE_EVERY) continue;
    await saveTimelapseState();
    console.log('Turn: ' + timelapseTurn + ' updating and sleeping...')
    await utils.sleep(5000);
  }
  await saveTimelapseState();
  console.log("Done!");
}

const updateMap = (cMap, td) => {
  if (VERSION==1) return updateMapV1(cMap, td);
  if (VERSION==2) return updateMapV2(cMap, td);
  return;
}

const fetchData = async () => {
  if (VERSION==1) return await fetchDataV1();
  if (VERSION==2) return await fetchDataV2();
  return;
}


const updateMapV2 = (cMap, td) => {
  if (!!td.delta) {
    cMap[td.country].cohesion = td.new;
    return cMap;
  }
  turn = td.turn+1;
  if (!td.battle) return cMap;
  let r = parseInt(td.battle.result)
  if (!r) return countriesMap;
  let w = r==1 ? td.battle.o : td.battle.d;
  let ct = r==1 ? td.battle.dt : td.battle.ot;
  let l = r==1 ? td.battle.d : td.battle.o;
  cMap[ct].occupiedBy=w;
  cMap[w].territories++;
  cMap[l].territories--;
  return cMap
}

const updateMapV1 = (cMap, td) => {
  turn = td.turn+1;
  if (!!td.data) {
    let data = td.data;
    cMap[data.o].territories++;
    cMap[data.d].territories--;
    cMap[data.dt].occupiedBy=data.o;
    cMap[data.dt].cohesion = data.cohesion.dt;
    cMap[data.ot].cohesion = data.cohesion.ot;
    cMap[data.d].cohesion = data.cohesion.d;
    cMap[data.o].cohesion = data.cohesion.o;
    return cMap;
  }
  cMap[td.conquest[0]].territories++;
  cMap[td.prev].territories--;
  cMap[td.conquest[1]].occupiedBy=td.conquest[0];
  return cMap
}

const fetchDataV2 = async () => {
  let history = await firebase.history.once('value').then(r=>r.val());
  let cohesion = await firebase.cohesion.once('value').then(r=>r.val());
  return Object.values(history)
    .concat(Object.values(cohesion))
    .sort((a,b)=>(a.turn-b.turn) || (!!b.delta - !!a.delta));
}

const fetchDataV1 = async () => {
  let history = await firebase.history.once('value').then(r=>r.val());
  return Object.values(history)
    .sort((a,b)=>(a.turn-b.turn));
}

const leaderboard = ()=>{
  return countriesMap.map((e,idx)=>{
    e.idx = idx;
    return e;
  }).sort((a, b)=>{
    return b.territories - a.territories;
  });
}

module.exports = {
  timelapse
}
