const config = require('../config')
const utils = require('../utils')
const q = require('../utils/quotes')
const firebase = require('../firebase')
const wwb = require('../worldWarBot')
const twb = require('../tronWarBot')
const telegram = require('../utils/telegram')
const facebook = require('../utils/facebook')
const numeral = require('numeral');

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

🎖🎖 TOP 5 DEATHS TOLL 🎖🎖
🥇${utils.universalMap(leaderboard[0].idx, "full")}: ${numeral(leaderboard[0].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[0].deaths/leaderboard[0].population)} of pop.)
🥈${utils.universalMap(leaderboard[1].idx, "full")}: ${numeral(leaderboard[1].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[1].deaths/leaderboard[1].population)} of pop.)
🥉${utils.universalMap(leaderboard[2].idx, "full")}: ${numeral(leaderboard[2].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[2].deaths/leaderboard[2].population)} of pop.)
4th ${utils.universalMap(leaderboard[3].idx, "full")}: ${numeral(leaderboard[3].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[3].deaths/leaderboard[3].population)} of pop.)
5th ${utils.universalMap(leaderboard[4].idx, "full")}: ${numeral(leaderboard[4].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[4].deaths/leaderboard[4].population)} of pop.)

Stay up to date at https://covidolympics2020.com
#covid #olympics #coronavirus #gaming #simulation #bot`
  return f;
}

const buildTgStats = (td, leaderboard) => {
  // TELEGRAM
  let t = `👑🦠 Covid Olympics 👑🦠
<i>The road to extinction...</i>
Mutation: ${td.turn}

🎖🎖 <b>TOP 5 DEATHS TOLL</b> 🎖🎖
🥇<b>${utils.universalMap(leaderboard[0].idx, "full")}</b>: ${numeral(leaderboard[0].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[0].deaths/leaderboard[0].population)} of pop.)
🥈<b>${utils.universalMap(leaderboard[1].idx, "full")}</b>: ${numeral(leaderboard[1].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[1].deaths/leaderboard[1].population)} of pop.)
🥉<b>${utils.universalMap(leaderboard[2].idx, "full")}</b>: ${numeral(leaderboard[2].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[2].deaths/leaderboard[2].population)} of pop.)
<i>4th</i> <b>${utils.universalMap(leaderboard[3].idx, "full")}</b>: ${numeral(leaderboard[3].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[3].deaths/leaderboard[3].population)} of pop.)
<i>5th</i> <b>${utils.universalMap(leaderboard[4].idx, "full")}</b>: ${numeral(leaderboard[4].deaths).format('0[.]0a')} (${utils.toPercent(leaderboard[4].deaths/leaderboard[4].population)} of pop.)

Stay up to date at https://covidolympics2020.com
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
  let m = { 'inline_keyboard': [[{'text': '🌎 Check it out', 'url': 'https://covidolympics2020.com'}]]};
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

  // if (utils.randomInt(30) == 0){
    //POST ON FACEBOOK
  let f = td.next.description + "\n\ncovidolympics2020.com\n#covid #olympics #coronavirus #gaming #simulation #bot";
  await facebook.post(td.next.description).catch(console.error);
  // }
  // if (utils.randomInt(20) == 0){
    // POST ON TELEGRAM
  let m = "<i>" + td.next.description + "</i>";
  if (!config.test) await telegram.sendMessage(m, {parse_mode: "HTML", disable_web_page_preview: true, disable_notification:true}).catch(console.error);
  // }
}

module.exports.startWar = async (td)=>{
  let t= `🎉 <b>Welcome to Covid Olympics 2020</b> 🎉
<i>It's 2020 when, in a Wuhan laboratory, scientists working on a chemical weapon aimed to eliminate the entire western world, accidentaly break a specimen full of powefull viruses 🦠.
The situation rapidly get out of control. It's chaos. It's pandemic!
Countries around the world soon realize that, once in, there is no way out of the game.
So they decided to unite in one last worldwide competition. The goal is the extinction.</i>

Enjoy <b>Covid Olympics</b>! Enjoy the extinction!`;

  let f = `🎉 Welcome to Covid Olympics 2020 🎉
It's 2020 when, in a Wuhan laboratory, scientists working on a chemical weapon aimed to eliminate the entire western world, accidentaly break a specimen full of powefull viruses 🦠.
The situation rapidly get out of control. It's chaos. It's pandemic!
Countries around the world soon realize that, once in, there is no way out of the game.
So they decided to unite in one last worldwide competition. The goal is the extinction.

Enjoy Covid Olympics! Enjoy the extinction!

#covid #olympics #coronavirus #simulation #pandemic`;
  let img = utils.imgUrl('start.jpg');
  await facebook.postWithPhoto(img, f).catch(console.error);
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
}

module.exports.endWar = async ()=>{
  let winner = wwb.winner();

  let t=`🎉Happy days!🎉
Seems like <b>${utils.universalMap(winner, "full")}</b> got extinct!

<i>🎉Let's toast that their sacrifice is not in vain! 🎉</i>`

let f=`🎉Happy days!🎉
Seems like ${utils.universalMap(winner, "full")} got extinct!

🎉Let's toast that their sacrifice is not in vain! 🎉`

  await facebook.post(f).catch(console.error);
  await telegram.sendMessage(t, {parse_mode: "HTML", disable_web_page_preview: true}).catch(console.error);
}
