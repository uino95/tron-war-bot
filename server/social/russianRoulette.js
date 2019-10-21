const Extra = require('telegraf/extra')
const config = require('../config')
const utils = require('../utils')
const cohesion = require('../cohesion')
const firebase = require('../firebase')
const telegram = require('../utils/telegram')

const ROULETTE = config.social.roulette

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
  if (v=='👍🏻') return ROULETTE.vote
  if (v=='👎🏻') return -ROULETTE.vote
  if (v=='🌟') return ROULETTE.superVote
  if (v=='😡') return -ROULETTE.superVote
}
const getCbData = (e)=>{
  return JSON.stringify({action:'RR_VOTE', vote:e});
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
      msg += e + ': <b>' + current.votes[e] + '</b>   =>  '+ utils.formatNumber(current.votes[e] * multiplier(e)) +'\n'
      text += current.votes[e] + e + ' ';
      total += (current.votes[e] * multiplier(e))
    })
    msg += "\nFinal count: <b>"+ utils.formatNumber(total) +"%</b> ➡️ "
    if (!total) msg += '<b>FULL TIE!</b>'
    if (total>0) msg += '<b>Bonus: +'+ROULETTE.bonus+'%</b>'
    if (total<0) msg += '<b>Bonus: -'+ROULETTE.bonus+'%</b>'
    total += (ROULETTE.bonus*Math.sign(total))
  } else { msg += 'No votes at this round... 😢\n'}
  msg += "\n\nTotal Cohesion Boost: <b>" + utils.formatNumber(total) + "%</b>\n";
  text += ' => Boost: '+ utils.formatNumber(total) + "%";
  // - EDIT COHESION
  let extra = {
    link: 'https://t.me/Tron_WarBot/'+current.messageId,
    update_type: 'ROULETTE'
  }
  let n = await cohesion.update(current.country, total, 'TG', text, extra)
  if (n) msg += "New cohesion: <b>" + utils.toPercent(n.new) + "</b>\n"
  await telegram.editMessageText(current.messageId, undefined, msg,  {parse_mode: "HTML", reply_markup: { 'inline_keyboard': [[]]}});
  return utils.universalMap(current.country, "full") + " received a <b>" + utils.formatNumber(total) + "% </b> cohesion boost!\n"
}

module.exports.init = async () => { //LOAD STATUS FROM DB
  if (current) return;
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
  msg += "\nIt's time to show your support for:\n\n"
  msg += "<b>" + utils.universalMap(current.country, "full") + "</b>\n"
  msg += "Territories: <b>" + cmap[current.country].territories + "</b>\n"
  msg += "Cohesion: <b>" + utils.toPercent(cmap[current.country].cohesion)+"</b>\n\n"
  msg += "<i>You have got 6 hours to like (or dislike).\n"
  msg += "Likes (👍🏻/👎🏻) gives ±"+ROULETTE.vote+"% cohesion point\n"
  msg += "Superlikes (🌟/😡) gives ±"+ROULETTE.superVote+"% (can only use once per day)</i>\n"
  msg += "A ±"+ROULETTE.bonus+"% cohesion bonus will be given on top"
  // PICK A COUNTRY
  // CREATE TEXT AND KEYBOARD
  let m = { 'inline_keyboard': [Object.keys(current.votes).map(e=> {return {'text':e, 'callback_data': getCbData(e)}})]};
  let r = await telegram.sendMessage(msg, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true})
  current.messageId = r.message_id;
  firebase.data.update({roulette: current})
}



module.exports.onUpdate = async (ctx, next)=>{
  let o = ctx.body.vote;
  let user = ctx.body.user;
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
  let m = { 'inline_keyboard': [Object.keys(current.votes).map(e=> {return {'text': (e + " " + (current.votes[e] || '')), 'callback_data': getCbData(e)}})]};
  await telegram.editMessageReplyMarkup(current.messageId, undefined, m);
  return telegram.answerCbQuery(ctx.update.callback_query.id, "Excellent!");
}
