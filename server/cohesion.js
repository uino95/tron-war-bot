const config = require("./config");
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const utils = require('./utils')
const vader = require('vader-sentiment');
const fuzz = require('fuzzball');

const REGEXPMATCHER = utils.map.sort((a,b)=>{return b.name.split(/ |-/g).length - a.name.split(/ |-/g).length}).map(e=>e.name.toLowerCase().replace(/ |-/g,"")).toString().replace(/,/g,"|")
const FUZZYMATCHER = utils.map.map(e=>e.name).map(e=>e.toLowerCase()).map(e=>e.replace(/-/g," "))

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
  // let s = new Date()
  txt = txt.replace(/ /g,"")
  let r = txt.match(new RegExp(REGEXPMATCHER, "gi"));
  // let e = new Date()
  // console.log("REGEX: "+ (r ? (r[0] + " => " + utils.universalMap(r[0], "numberId")) : "-") + "  | Process time: " + (e.valueOf() - s.valueOf()) + "ms")
  if (!r) return;
  return utils.universalMap(r[0], "numberId");
}

const fuzzyMatch = (txt) => {
  // let s = new Date()
  let r = fuzz.extract(txt, FUZZYMATCHER, {limit: 4, cutoff: 50, scorer: fuzz.token_set_ratio});
  // let e = new Date()
  // console.log("FUZZ: "+ (r.length ?( r[0][0] + " => " + r[0][2])  : "-") + " | Process time: " +( e.valueOf() - s.valueOf()) + "ms")
  if (!r.length) return;
  return r[0][2]
}


const update = async (text, user_id, user_name, post_id, update_type, platform, link)=>{
  console.log("[COHESION]: Received new " + update_type +" by: " + user_name + " on " + platform + "  saying: '" + text +"'  " + platform + '|' + user_id +'|'+ post_id +'|'+ update_type)
  // VALID INPUT
  if (!text || !user_id || !post_id || !update_type || !platform) return;
  let id = platform + '|' + user_id +'|'+ post_id +'|'+ update_type;
  // ALREADY EXISTS?
  let alreadyExists = await firebase.cohesion.once('value').then((r) => r.child(id).exists())
  if (alreadyExists) return;
  // VALID TEXT?
  let r = analyze(text);
  if (!r) return;
  let multiplier = 0;
  let delta = 0;
  switch (update_type) {
    case "SHARE" :
      delta = config.cohesion.share * Math.sign(r.score)*Math.ceil(Math.abs(r.score)*10)/10
      break;
    case "COMMENT" :
      delta = config.cohesion.comment * Math.sign(r.score)
      break;
    default:
      return;
  }
  let date = (new Date()).valueOf()
  let u = wwb.updateCohesion(r.country, delta);
  let c = {
    date,
    user_id,
    post_id,
    user_name,
    update_type,
    text,
    link,
    country: r.country,
    score: r.score,
    new: u.new,
    old: u.old,
    delta: u.delta,
  }
  return await firebase.cohesion.child(id).set(c);
}

const samples = (c, s) => {
  c = "Samoa"
  let i = {
    '0': c + " is great",
    '1': c +" is awesome",
    '2': c +" really sucks",
    '3':"Long live in hell " + c
  }
  return i[s.toString()];
}

const users = (c) => {
  let u = {
    '0':"Mario Rossi",
    '1':"Giuseppe Verdi",
    '2':"Calogero Porceddu",
    '3':"Matusalemme Zigarolo",
    '4':"Brambilla Busatti",
  }
  return u[c.toString()];
}

const test = async () =>{
  let r = utils.randomInt(241).toString();
  let s = samples(utils.universalMap(r),utils.randomInt(4));
  let u = utils.randomInt(5).toString();
  let p = utils.randomHex();
  await update(s, u, users(u), p, (utils.randomInt(1) ? "SHARE" : "COMMENT"), "FB", "https://google.com");
}

module.exports = {
  analyze,
  test,
  update
}
