const Extra = require('telegraf/extra')
const config = require('../config')
const utils = require('../utils')
const cohesion = require('../cohesion')
const firebase = require('../firebase')
const telegram = require('../utils/telegram')


const userCache = {}
var current;
// var current = {
//   rId:0,
//   country:0,
//   votes:[],
//   users:{}
//   messageId:'id',
// }

const isValidVote = (v) => {
  return (v == '🌟') || (v == '😡') || (v == '👍🏻') || (v == '👎🏻')
}
const isSuperVote = (v) => {
  return (v == '🌟') || (v == '😡')
}
const multiplier = (v) => {
  if (v=='👍🏻') return config.social.roulette.vote
  if (v=='👎🏻') return -config.social.roulette.vote
  if (v=='🌟') return config.social.roulette.superVote
  if (v=='😡') return -config.social.roulette.superVote
}

const pickCountry = (cmap, td) => {
  let total = cmap.reduce((acc, v)=>acc+v.cohesion,0)
  let acc = 0;
  let cpdf = cmap.map(e=>acc+=(e.cohesion/total))
  let random = utils.random();
  for (var i=0; i < cpdf.length; i++) {
    if (random > cpdf[i]) continue;
    return i;
  }
  return cpdf.length - 1;
}

const closePreviousRoulette = async (cmap, td) => {
  // - EDIT AND CLOSE MESSAGE
  let votes = Object.values(current.votes).reduce((acc, e) => acc + e, 0);
  let total = 0
  let msg = "<b>⏱ ROULETTE TIME ⏱</b>"
  let text = "Roulette: "
  msg += "\nSupport time for <b>" + utils.universalMap(current.country, "full") + "</b> is over!\n\n"
  // - COUNT VOTES
  if (votes){
    msg += "<b>Results:</b>\n"
    Object.keys(current.votes).forEach(e=>{
      if (!current.votes[e]) return
      msg += e + ': <b>' + current.votes[e] + '</b>\n'
      text += current.votes[e] + e + ' ';
      total += (current.votes[e] * multiplier(e))
    })
    msg += "\nFinal count: <b>"+ total +"%</b> ➡️ "
    if (!total) msg += '<b>FULL TIE!</b>'
    if (total>0) msg += '<b>Bonus: +'+config.social.roulette.bonus+'%</b>'
    if (total<0) msg += '<b>Bonus: -'+config.social.roulette.bonus+'%</b>'
    total += (3*Math.sign(total))
  } else { msg += 'No votes at this round... 😢\n'}
  msg += "\n\nTotal Cohesion Boost: <b>" + total.toFixed(1) + "%</b>\n";
  text += ' => Boost: '+ total.toFixed(1) + "%";
  // - EDIT COHESION
  let extra = {
    link: 'https://t.me/Tron_WarBot/'+current.messageId,
    update_type: 'ROULETTE'
  }
  let n = await cohesion.update(current.country, total, 'TG', text, extra)
  if (n) msg += "New cohesion: <b>" + utils.toPercent(n.new) + "</b>\n"
  await telegram.editMessageText(current.messageId, undefined, msg,  {parse_mode: "HTML", reply_markup: { 'inline_keyboard': [[]]}});
}

module.exports.init = async () => { //LOAD STATUS FROM DB
  current = await firebase.data.once("value").then(r=>r.val()['roulette']);
  if (!current) return;
  if (!current.users) current.users = {};
  if (!current.votes) current.votes = {};
}

module.exports.next = async (cmap, td)=>{
  if (current) await closePreviousRoulette(cmap,td);
  // PICK A COUNTRY
  let c = pickCountry(cmap,td);
  current = {
    country:c,
    votes:{
      '🌟':0,
      '👍🏻':0,
      '👎🏻':0,
      '😡':0
    },
    users:{},
  }
  let msg = "<b>⏱ ROULETTE TIME ⏱</b>"
  msg += "\nIt's time to show your support for:\n\n<b>" + utils.universalMap(current.country, "full") + "</b> \n\n"
  msg += "<i>You have got 6 hours to like (or dislike).\n"
  msg += "Likes (👍🏻/👎🏻) gives ±"+config.social.roulette.vote+"% cohesion point\n"
  msg += "Superlikes (🌟/😡) gives ±"+config.social.roulette.superVote+"% (can only use once per day)</i>\n"
  msg += "A ±"+config.social.roulette.bonus+"% cohesion bonus will be given on top"
  // PICK A COUNTRY
  // CREATE TEXT AND KEYBOARD
  let m = { 'inline_keyboard': [Object.keys(current.votes).map(e=> {return {'text':e, 'callback_data': e}})]};
  let r = await telegram.sendMessage(msg, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true})
  current.messageId = r.message_id;
  firebase.data.update({roulette: current})
}



module.exports.onUpdate = async (ctx, next)=>{
  let o = ctx.update.callback_query.data;
  let user = ctx.from.id;
  if (!isValidVote(o) || !user) return telegram.answerCbQuery(ctx.update.callback_query.id, "");
  if (!current || ctx.update.callback_query.message.message_id != current.messageId) return telegram.answerCbQuery(ctx.update.callback_query.id, "");
  // CHECK IF VOTE IS VALID
  if (current.users[user] && current.users[user]==o) return telegram.answerCbQuery(ctx.update.callback_query.id, "You already voted this!");
  if (current.users[user] && isSuperVote(current.users[user])) delete userCache[user];
  let s = isSuperVote(o)
  let today = (new Date()).setHours(0,0,0,0);
  if (s && userCache[user] && userCache[user] == today) return telegram.answerCbQuery(ctx.update.callback_query.id, "You already used a supervote today!");
  if (s) userCache[user]= today;
  if (current.users[user]) current.votes[current.users[user]]--;
  current.users[user]=o
  current.votes[o] = (current.votes[o] || 0) + 1;
  // SAVE IT
  firebase.data.update({roulette: current})
  // EDIT MESSAGE KEYBOARD
  let m = { 'inline_keyboard': [Object.keys(current.votes).map(e=> {return {'text': (e + " " + (current.votes[e] || '')), 'callback_data': e}})]};
  await telegram.editMessageReplyMarkup(current.messageId, undefined, m);
  return telegram.answerCbQuery(ctx.update.callback_query.id, "Excellent!");
}
