const config = require('../config')
const utils = require('../utils')
const q = require('../utils/quotes')
const firebase = require('../firebase')
const wwb = require('../worldWarBot')
const twb = require('../tronWarBot')
const telegram = require('../utils/telegram')
const facebook = require('../utils/facebook')

const SPLIT_UPDATE = 12
const SPLIT_HALF = Math.ceil(SPLIT_UPDATE/2)


var history=[];
var epic = [];
var insurrections = [];
var partials = {};

module.exports.quotes = async (td) => {
  let i = (td.turn-config.social.updates.quotesFreq)/(config.social.updates.quotesFreq*2);
  if (!q[i]) return;
  let f = "“"+q[i][0] + "”\ncit. " + q[i][1];
  f += "\n\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"
  await facebook.post(f).catch(console.error);
}

const buildFbStats = (td, leaderboard) => {
  // FACEBOOK
  let f = `👑🦠 Covid Olympics 👑🦠
  The road to extinction...
  Mutation: ${td.turn}

  🎖🎖 TOP 5 COUNTRIES 🎖🎖
  🥇${utils.universalMap(leaderboard[0].idx, "full")}: ${leaderboard[0].deaths} (${utils.toPercent(leaderboard[0].deaths/leaderboard[0].population)} of pop.)
  🥈${utils.universalMap(leaderboard[1].idx, "full")}: ${leaderboard[1].deaths} (${utils.toPercent(leaderboard[1].deaths/leaderboard[1].population)} of pop.)
  🥉${utils.universalMap(leaderboard[2].idx, "full")}: ${leaderboard[2].deaths} (${utils.toPercent(leaderboard[2].deaths/leaderboard[2].population)} of pop.)
  4th ${utils.universalMap(leaderboard[3].idx, "full")}: ${leaderboard[3].deaths} (${utils.toPercent(leaderboard[3].deaths/leaderboard[3].population)} of pop.)
  5th ${utils.universalMap(leaderboard[4].idx, "full")}: ${leaderboard[4].deaths} (${utils.toPercent(leaderboard[4].deaths/leaderboard[4].population)} of pop.)

  Stay up to date at https://covidolympics.com
  #covid #coronavirus #outbreak #gaming #simulation #bot`
  return f;
}

const buildTgStats = (td, leaderboard) => {
  // TELEGRAM
  let t = `👑🦠 Covid Olympics 👑🦠
  <i>The road to extinction...</i>
  Mutation: ${td.turn}

  🎖🎖 <b>TOP 5 COUNTRIES<b>🎖🎖
  🥇<b>${utils.universalMap(leaderboard[0].idx, "full")}</b>: ${leaderboard[0].deaths} (${utils.toPercent(leaderboard[0].deaths/leaderboard[0].population)} of pop.)
  🥈<b>${utils.universalMap(leaderboard[1].idx, "full")}</b>: ${leaderboard[1].deaths} (${utils.toPercent(leaderboard[1].deaths/leaderboard[1].population)} of pop.)
  🥉<b>${utils.universalMap(leaderboard[2].idx, "full")}</b>: ${leaderboard[2].deaths} (${utils.toPercent(leaderboard[2].deaths/leaderboard[2].population)} of pop.)
  <i>4th</i> <b>${utils.universalMap(leaderboard[3].idx, "full")}</b>: ${leaderboard[3].deaths} (${utils.toPercent(leaderboard[3].deaths/leaderboard[3].population)} of pop.)
  <i>5th</i> <b>${utils.universalMap(leaderboard[4].idx, "full")}</b>: ${leaderboard[4].deaths} (${utils.toPercent(leaderboard[4].deaths/leaderboard[4].population)} of pop.)

  Stay up to date at https://covidolympics.com
  Who will get extinct?
  🎖👇👇👇👇👇👇👇🎖`;
  return t
}

module.exports.stats = async (td) =>{
  // history = await firebase.history.orderByChild('turn').limitToLast(config.social.updates.statsFreq).once("value").then(r=>r.val());
  // let u = {}
  // let civilWar = []
  // let cmap = await wwb.mapState();
  // Object.values(history).forEach(r=>{
  //   if (!r.battle) return;
  //   r = r.battle;
  //   if (r.civilWar) civilWar.push(utils.universalMap(r.o));
  //   u[r.d] = u[r.d] || { id: r.d }
  //   u[r.d].ic = u[r.d].ic || r.cohesion.d;
  //   u[r.d].fc = cmap[r.d].cohesion
  //   u[r.d].wt = (u[r.d].wt || 0) - (r.result%2) + (Math.floor(r.result/2))
  //   u[r.o] = u[r.o] || { id: r.o }
  //   u[r.o].ic = u[r.o].ic || r.cohesion.o;
  //   u[r.o].fc = cmap[r.o].cohesion
  //   u[r.o].wt = (u[r.o].wt || 0) + (r.result%2) - (Math.floor(r.result/2))
  // })

  let leaderboard = wwb.leaderboard();

  let t = buildTgStats(td, leaderboard);
  let m = { 'inline_keyboard': [[{'text': '🌎 Check it out', 'url': 'https://covidolympics.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

  let f = buildFbStats(td, leaderboard);
  let img = utils.imgUrl('map.jpg')
  await facebook.postWithPhoto(img, f).catch(console.error);
}

// module.exports.init = async () => {
//   let td = await wwb.currentTurnData();
//   if (!(td.turn%config.social.updates.battleFreq)) return;
//   let history = await firebase.history.orderByChild('turn').limitToLast(td.turn%config.social.updates.battleFreq).once("value").then(r=>r.val());
//   for (let td of Object.values(history)) {
//     if (td.battle && td.battle.result) {
//       let w,l;
//       switch (td.battle.result){
//         case 1:
//         if (td.battle.civilWar) insurrections.push(td.battle);
//         w=td.battle.o;
//         l=td.battle.d;
//         break;
//         case 2:
//         w=td.battle.d;
//         l=td.battle.o;
//         break;
//       }
//       partials[w] = (partials[w] || 0) + 1
//       partials[l] = (partials[l] || 0) - 1
//     }
//     if (td.battle && td.battle.probabilities[td.battle.result]<0.05) epic.push(td.battle);
//   }
// }

module.exports.battleUpdate = async (cmap, td) => {
  if (!td.next || !td.next.description) return;

  if (utils.randomInt(30) == 0){
    //POST ON FACEBOOK
    return await facebook.post(td.next.description).catch(console.error);
  }
  if (utils.randomInt(20) == 0){
    // POST ON TELEGRAM
    let m = "<i>" + td.next.description + "</i>";
    await telegram.sendMessage(m, {parse_mode: "HTML", disable_web_page_preview: true, disable_notification:true}).catch(console.error);
  }
}

module.exports.startWar = async (td)=>{
  let t="🎉 <b>Welcome to TronWarBot 2.0</b> 🎉\n\n<i>It's the year 2140 and after a century of forced peace treaties among nations, resources are slowly exhausting. "
  t += "Fear is in the air and the only hope for a brighter future lies in the neighbor country.</i>\n\n"
  t += "This is when <b>" + utils.universalMap(td.next.o) + "</b> decided to invade <b>" + utils.universalMap(td.next.dt) + "</b>.\n"
  t += "This is the begin of a long lasting world conflict.\n\n"
  t += "⚔️ This is the <b>Tron World War</b> ⚔️";
  let f = "🎉 Welcome to TronWarBot 2.0 🎉\n\nIt's the year 2140 and after a century of forced peace treaties among nations, resources are slowly exhausting. "
  f += "Fear is in the air and the only hope for a brighter future lies in the neighbor country.\n\n"
  f += "This is when " + utils.universalMap(td.next.o) + " decided to invade " + utils.universalMap(td.next.dt) + ".\n"
  f += "This is the begin of a long lasting world conflict.\n\n"
  f += "⚔️ This is the Tron World War ⚔️";
  let img = utils.imgUrl('start.jpg');
  await facebook.postWithPhoto(img, f).catch(console.error);
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
}

module.exports.endWar = async ()=>{
  let winner = wwb.winner();
  let t="🎉 <b>"+utils.universalMap(winner, "full")+" conquered the world!</b> 🎉\n\n<b>Years of dictatorship ahead!!!\n🍀 Good luck!</b>\n\n<i>The game is f***ing over...</i>";
  let f="🎉 "+utils.universalMap(winner, "full").toUpperCase() +" CONQUERED THE WORLD! 🎉\n\nYears of dictatorship ahead!!!\n🍀 Good luck!\n\nThe game is f***ing over...";
  await facebook.post(f).catch(console.error);
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
  await utils.sleep(config.test ? 1000 : 60000);
  t = "...or maybe...\n🤔🤔🤔"
  f = "...or maybe...\n🤔🤔🤔"
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
  await facebook.post(f).catch(console.error);
  await utils.sleep(config.test ? 1000 : 60000);
  // THANKS FOR WATCHING
  t = '...the next <b>rebellion</b> might be just around the corner!\n\nAfter all...\n<a href="https://www.youtube.com/watch?v=NHWjlCaIrQo">...the only winning move is not to play!</a>'
  f = "...the next rebellion might be just around the corner!\n\nAfter all...\n...the only winning move is not to play!\n\nhttps://www.youtube.com/watch?v=NHWjlCaIrQo"
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
  await facebook.post(f).catch(console.error);
  await utils.sleep(config.test ? 1000 : 60000);
  t = '<b>🎉 Thanks for watching! 🎉</b>'
  f = "🎉 Thanks for watching! 🎉\n⚔️Tron World War⚔️\n\nStay tuned!\n———————-\n\nhttps://tronwarbot.com\n\nTelegram: t.me/Tron_WarBot\nTwitter: twitter.com/TronWarBot_\nFacebook: facebook.com/TronWarBot/\nInstagram: instagram.com/tronwarbot/\n\n#tron #world #war #gaming #simulation #bot"
  let m = { 'inline_keyboard': [[{'text': '🌎 Stay tuned', 'url': 'https://tronwarbot.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);
  await facebook.post(f).catch(console.error);
}
