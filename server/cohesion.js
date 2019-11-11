const config = require("./config");
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const utils = require('./utils')
const vader = require('vader-sentiment');
const fuzz = require('fuzzball');

let map = JSON.parse(JSON.stringify(utils.map))
const REGEXPMATCHER = map.sort((a,b)=>{return b.name.split(/ |-/g).length - a.name.split(/ |-/g).length}).map(e=>e.name.toLowerCase().replace(/ |-/g,"")).toString().replace(/,/g,"|")
const FUZZYMATCHER = map.map(e=>e.name).map(e=>e.toLowerCase()).map(e=>e.replace(/-/g," "))


const analyze = (txt) => {
  if (typeof txt != "string") return;
  txt = txt.toLowerCase().replace(/-|#|@/g," ");
  let c = regexMatch(txt) || fuzzyMatch(txt);
  if (!c) return;
  let s = sentenceScore(txt);
  if (!s) return;
  return {
    country: c,
    name: utils.universalMap(c),
    score: s
  };
}

const sentenceScore = (txt) => {
  let intensity = vader.SentimentIntensityAnalyzer.polarity_scores(txt);
  return intensity.compound;
}

const regexMatch = (txt) => {
  txt = txt.replace(/ /g,"")
  let r = txt.match(new RegExp(REGEXPMATCHER, "gi"));
  if (!r) return;
  return utils.universalMap(r[0], "numberId");
}

const fuzzyMatch = (txt) => {
  let r = fuzz.extract(txt, FUZZYMATCHER, {limit: 4, cutoff: 50, scorer: fuzz.token_set_ratio});
  if (!r.length) return;
  return r[0][2]
}


const update = async (country, delta, platform, text, extra={})=>{
  // VALID INPUT
  if (!delta || !country || !platform || !text) return;
  let date = new Date()
  // ALREADY EXISTS?
  let id = extra.id || (date.toISOString().substr(0,16) +'|'+ platform + '|' +  country)
  let alreadyExists = await firebase.cohesion.orderByKey().equalTo(id).once('value').then((r) => r ? r.val() : false);
  if (alreadyExists) return;
  await wwb.currentTurnData();
  let u = wwb.editCohesion(country, delta);
  if (!u) return;
  let c = extra;
  c.turn = u.turn;
  c.text = text;
  c.country = country;
  c.new = u.new;
  c.old = u.old;
  c.delta = u.delta;
  await firebase.cohesion.child(id).set(c);
  return c;
}

module.exports = {
  analyze,
  update
}
