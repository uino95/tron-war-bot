const firebase = require('../firebase')
const utils = require('../utils')
const COUNTRIES = 241;
var timelapseTurn;
var countriesMap;

const saveTimelapseState = () => {
  firebase.timelapseMap.set(countriesMap);
  return firebase.data.update({ timelapseTurn });
}

const fetchData = async () => {
  let history = await firebase.history.once('value').then(r=>r.val());
  let cohesion = await firebase.cohesion.once('value').then(r=>r.val());
  // cohesion = Object.values(cohesion).map(e=>!!e.delta)
  return Object.values(history)
    .concat(Object.values(cohesion))
    .sort((a,b)=>(a.turn-b.turn) || (!!b.delta - !!a.delta));
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
    if (timelapseTurn%10) continue;
    await saveTimelapseState();
    console.log('Turn: ' + timelapseTurn + ' updating and sleeping...')
    await utils.sleep(5000);
  }
}


const updateMap = (cMap, td) => {
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

module.exports = {
  timelapse
}
