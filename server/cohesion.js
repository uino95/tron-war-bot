const config = require("./config");
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const utils = require('./utils')
const vader = require('vader-sentiment');
const fuzz = require('fuzzball');


const REGEXPMATCHER = utils.map.sort((a,b)=>{return b.name.split(/ |-/g).length - a.name.split(/ |-/g).length}).map(e=>e.name.toLowerCase().replace(/ |-/g,"")).toString().replace(/,/g,"|")
const FUZZYMATCHER = utils.map.sort((a,b)=>{return a.name.split(/ |-/g).length - b.name.split(/ |-/g).length}).map(e=>e.name.toLowerCase().replace(/ |-/g,""))
// console.log(MATCHER)

const analyze = (txt) => {
  if (typeof txt != "string") return 0;
  let intensity = vader.SentimentIntensityAnalyzer.polarity_scores(txt);
  return intensity.compound;
}

const regexMatch = (txt) => {
  let s = new Date()
  let r = txt.toLowerCase().replace(/ |-|#|@/,"").match(new RegExp(REGEXPMATCHER, "gi"));
  let e = new Date()
  console.log("REGEX: "+ (r ? (r[0] + " => " + utils.universalMap(r[0], "numberId")) : "-") + "  | Process time: " + (e.valueOf() - s.valueOf()) + "ms")
  return r ? r[0] : undefined
}

const fuzzyMatch = (txt) => {
  let s = new Date()
  let r = fuzz.extract(txt.toLowerCase().replace(/ |-|#|@/,""), FUZZYMATCHER, {limit: 10, cutoff: 30});
  let e = new Date()
  console.log("FUZZ: "+ (r.length ?( r[0][0] + " => " + r[0][2])  : "-") + " | Process time: " +( e.valueOf() - s.valueOf()) + "ms")
  console.log(r)
}

const test = (txt) =>{
  regexMatch(txt);
  fuzzyMatch(txt);
}
const updateCohesion = ()=>{}
// const input = 'VADER is very smart, handsome, and funny';



module.exports = {
  analyze,
  test,
  updateCohesion
}
