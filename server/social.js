const config = require('./config')
const utils = require('./utils')
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const telegram = require('./telegram')
const facebook = require('./facebook')
//
// const rp = require("request-promise")
// const sharp = require('sharp');
// const fs = require("fs");
// const img = await rp.get('https://api.browshot.com/api/v1/screenshot/html?url=http://tronwarbot.com/&instance_id=26&delay=10&width=1000&height=500&cache=0&size=screen&key=Sv38zA15tm7zGScDnZg3fqqZ')

async function runUpdate(){
  _tMessage = undefined;

  let history = await firebase.history.orderByChild('turn').limitToLast(72).once("value").then(r=>r.val());
  let u = {}
  let civilWar = []
  Object.values(history).forEach(r=>{
    if (!r.data) return;
    r = r.data;
    if (r.civilWar) civilWar.push(utils.universalMap(r.o));
    u[r.d] = u[r.d] || { id: r.d }
    u[r.d].dc = (u[r.d].dc || 0) + r.cohesion.delta_d
    u[r.d].fc = r.cohesion.d
    u[r.d].wt = (u[r.d].wt || 0) - 1
    u[r.o] = u[r.o] || { id: r.o }
    u[r.o].dc = (u[r.o].dc || 0) + r.cohesion.delta_o
    u[r.o].fc = r.cohesion.o
    u[r.o].wt = (u[r.o].wt || 0) + 1
  })
  let top3 = Object.values(u).sort(function(a, b){return b.wt - a.wt});
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let leaderboard = wwb.leaderboard();
  let countriesStillAlive = wwb.countriesStillAlive();

  // FACEBOOK
  let f = "♟ Tron World War ⚔️ " + wwb.currentTurn() +" ♟\n\n"
  // TELEGRAM
  let t = "⏱♟ <b>TURN " + wwb.currentTurn() +"</b> UPDATE ♟⏱\n\n"

  t +="🎖🎖 <b>TOP 5 ARMIES</b> 🎖🎖\n"
  f +="🎖🎖 TOP 5 ARMIES 🎖🎖\n"

  t += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  f += "🥇 " + leaderboard[0].territories + " territories -\t" + utils.universalMap(leaderboard[0].idx) + "\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  t += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  f += "🥈 " + leaderboard[1].territories + " territories -\t" + utils.universalMap(leaderboard[1].idx) + "\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  t += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  f += "🥉 " + leaderboard[2].territories + " territories -\t" + utils.universalMap(leaderboard[2].idx) + "\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  t += "<i>4th</i> <b>" + leaderboard[3].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[3].idx) + "</b>\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  f += "4th " + leaderboard[3].territories + " territories -\t" + utils.universalMap(leaderboard[3].idx) + "\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  t += "<i>5th</i> <b>" + leaderboard[4].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[4].idx) + "</b>\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  f += "5th " + leaderboard[4].territories + " territories -\t" + utils.universalMap(leaderboard[4].idx) + "\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";

  t += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries in the game!\n"
  f += "\n🌎 " + countriesStillAlive.length + " countries in the game!\n\n"

  t += "\nJackpot: <b>" + j + " TRX</b>\n";
  // t += "\n🕛 <b>12 HOURS BREAK:</b> 🕛\n"
  f += "\n🕛 12 HOURS BREAK: 🕛\n"
  // t += "\n👍 <b> BEST 3 </b> 👍\n"
  f += "\n👍 BEST 3 👍\n"
  // t +=  "<b>+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  f +=  "+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  // t +=  "<b>+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  f +=  "+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  // t +=  "<b>+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  f +=  "+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  top3.reverse();
  // t += "\n🔻<b> WORST 3 </b> 🔻\n"
  f += "\n🔻 WORST 3 🔻\n"
  // t +=  "<b>" + top3[0].wt + " " + utils.universalMap(top3[0].id) +  "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  f +=  top3[0].wt + " " + utils.universalMap(top3[0].id) +  "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  // t +=  "<b>" + top3[1].wt + " " + utils.universalMap(top3[1].id) +  "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  f +=  top3[1].wt + " " + utils.universalMap(top3[1].id) +  "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  // t +=  "<b>" + top3[2].wt + " " + utils.universalMap(top3[2].id) +  "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  f +=  top3[2].wt + " " + utils.universalMap(top3[2].id) +  "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"

  // t += "\nInsurrections: <b>" + civilWar.length + "</b> <i>(" + civilWar + ")</i>\n"
  f += "\nInsurrections: " + civilWar.length + " (" + civilWar + ")\n"

  f += "\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"

  t += "\nWho will conquer the world? <b>Don't miss it!</b>\n";
  t += "🎖👇👇👇👇👇👇👇🎖";

  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

  await facebook.post(f).catch(console.error);

}


module.exports.runUpdate = runUpdate;
