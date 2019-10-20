const config = require("../config");
const cohesion = require('../cohesion')
const utils = require('../utils')

const update = async (text, user_id, user_name, update_type, platform, link)=>{
  // VALID INPUT
  if (!text || !user_id || !update_type || !platform) return;
  if (!config.social.shares[update_type]) return;
  console.log("[SHARE]: Received new " + update_type +" by: " + user_name + " on " + platform + "  saying: '" + text +"'  " + platform + '|' + user_id +'|'+ update_type)
  let now = new Date()
  // VALID TEXT
  let r = cohesion.analyze(text);
  if (!r) return;
  let delta = utils.trimUp(config.social.shares[update_type] * r.score, 1);
  let extra = {
    id : now.toISOString().substr(0,10) + '|' +platform +'|'+ update_type + '|' + user_id,
    link,
    update_type,
    user_id,
    user_name,
    score: r.score
  }
  return await cohesion.update(r.country, delta, platform, text, extra);
}

const samples = (c, s) => {
  let i = {
    '0': c + " is amazing!!",
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
  let c = utils.randomInt(241);
  let cs = utils.universalMap(c);
  let r1 = utils.randomInt(4).toString()
  let r2 = utils.randomInt(5).toString()
  await update(samples(cs,r1), r2, users(r2), "share", "FB", "https://www.facebook.com/TronWarBot/posts/525547494939568");
}

module.exports = {
  test,
  update
}
