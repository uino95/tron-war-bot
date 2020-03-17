const Extra = require('telegraf/extra')
const config = require('../config')
const utils = require('../utils')
const cohesion = require('../cohesion')
const firebase = require('../firebase')
const telegram = require('../utils/telegram')
const facebook = require('../utils/facebook')

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
  return (v == '💦') || (v == '💩') || (v == '😷') || (v == '🤧') || (v == '🔥')
}
const isSuperVote = (v) => {
  return (v == '💦') || (v == '💩') || (v == '🔥')
}
const multiplier = (v) => {
  if (v=='😷') return ROULETTE.vote
  if (v=='🤧') return -ROULETTE.vote
  if (v=='💦') return ROULETTE.superVote
  if (v=='💩') return -ROULETTE.superVote
  if (v=='🔥') return 0;
}
const getCbData = (e)=>{
  return JSON.stringify({action:'RR_VOTE', vote:e});
}

const pickCountry = (cmap, td) => {
  const COUNTRIES = cmap.length;
  const getImpact = (e) => {
    if (e.population == 1) return 0
    return (1 + (e.deaths/e.population)/3) * e.cohesion
  }
  let total = cmap.reduce((acc, v)=>acc+getImpact(v),0)
  let acc = 0;
  let cpdf = cmap.map(e=>acc+=(getImpact(e)/total))
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
  let msg = "⏱ TIME IS OVER ⏱\n"
  msg += `<b>${utils.universalMap(current.country, "full")}</b>\n\n`
  let cohesionText = "Roulette: "
  // - COUNT VOTES
  if (votes){
    msg += "<b>Results:</b>\n"
    Object.keys(current.votes).forEach(e=>{
      if (!current.votes[e]) return
      msg += e + ': <b>' + current.votes[e] + '</b>\n'
      cohesionText += current.votes[e] + e + ' ';
      total += (current.votes[e] * multiplier(e))
    })
    msg += "\n"
    if (!total)     msg += '<b>Dammit! That was a tie! No fun at this round... </b>'
    if (total > 0)  msg += `Seems like ${utils.universalMap(current.country)} received a proper cleaning...`
    if (total < 0)  msg += `Hell yeah! Seems like in <b>${utils.universalMap(current.country)}</b> they really want to extinguish themselves!`
    total += (ROULETTE.bonus*Math.sign(total))
  } else { msg += 'No votes at this round... 😢\n'}
  cohesionText += ' => Boost: '+ utils.formatNumber(total) + "%";
  // - EDIT COHESION
  let extra = {
    link: 'https://t.me/Tron_WarBot/'+current.messageId,
    update_type: 'ROULETTE'
  }

  let deaths = utils.randomInt(current.votes['🔥']**2) + current.votes['🔥']
  let recovered = utils.randomInt(current.votes['💦']**2) + current.votes['💦']
  let infected = utils.randomInt(current.votes['💩']**2) + current.votes['💩']
  let res = await cohesion.editPopulation(current.country, {deaths, recovered, infected});
  if (res.infected) {
    msg += `\n\n<b>+${res.infected}</b> infected after tasting feces.`
  }
  if (res.recovered) {
    msg += `\n\n<b>${res.recovered}</b> temporarily recovered.`
  }
  if (res.deaths) {
    msg += `\n\nOps! Someone played a bit too much with matches... ${res.deaths} plague-riddens were burnt alive!`
    let f = `
      A hard sentence was given to ${res.deaths} sick men in ${utils.universalMap(current.country)} stuck in an absolutely unintentional fire inside a hospital. 🔥🔥

      Check it at https://t.me/Tron_WarBot/${current.messageId}`
    await facebook.post(f);
  }

  let n = await cohesion.update(current.country, total, 'TG', cohesionText, extra)
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
      '😷':0,
      '🤧':0,
      '💦':0,
      '💩':0,
      '🔥':0
    },
    users:{},
  }
  let msg = `<b>⏱ ROULETTE TIME ⏱</b>
<i>It's time to clean some cockroaches... or set them on 🔥!</i>

<b> ${utils.universalMap(current.country, "full")}</b>
Deaths toll: <b>${cmap[current.country].deaths} </b> (${utils.toPercent(cmap[current.country].deaths/cmap[current.country].population)})
Infected: <b>${cmap[current.country].infected}</b>

You have got 6 hours to express your useless opinion...
Should we quarantine them (😷) or wildly sneeze on them (🤧)?

You can also squirt them with dubious sanitizing fluid (💦) or perform public excrements spreading (💩) for a better performance.
Or you might simply set them on 🔥 for a true deep cleaning!

<i>Supervotes (💦/💩/🔥) can only be used once per day</i>
  `

  // PICK A COUNTRY
  // CREATE TEXT AND KEYBOARD
  let m = { 'inline_keyboard': [Object.keys(current.votes).map(e=> {return {'text':e, 'callback_data': getCbData(e)}})]};
  let r = await telegram.sendMessage(msg, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true, reply_to_message_id: current.messageId})
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
