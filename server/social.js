const config = require('./config')
const utils = require('./utils')
const q = require('./utils/quotes')
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const telegram = require('./utils/telegram')
const facebook = require('./utils/facebook')

const runUpdate = async (td) => {
  if (!(td.turn % 100)) return stats(td);
  if (!(td.turn % 150)) return quotes(td);
}

const quotes = async (td) => {
  let i = (td.turn-150)/300;
  if (!q[i]) return;
  let f = "“"+q[i][0] + "”\ncit. " + q[i][1];
  f += "\n\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"
  await facebook.post(f).catch(console.error);
}

const stats = async (td) =>{
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


  let t = buildTgStats(leaderboard, countriesStillAlive, j, top3);
  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

  let f = buildFbStats(leaderboard, countriesStillAlive, j, top3);
  await facebook.post(f).catch(console.error);

}

const buildFbStats = (leaderboard, countriesStillAlive, j, top3) => {
  // FACEBOOK
  let f = "♟ Tron World War ⚔️ " + td.turn +" ♟\n\n"
  f +="🎖🎖 TOP 5 ARMIES 🎖🎖\n"
  f += "🥇 " + leaderboard[0].territories + " territories -\t" + utils.universalMap(leaderboard[0].idx) + "\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  f += "🥈 " + leaderboard[1].territories + " territories -\t" + utils.universalMap(leaderboard[1].idx) + "\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  f += "🥉 " + leaderboard[2].territories + " territories -\t" + utils.universalMap(leaderboard[2].idx) + "\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  f += "4th " + leaderboard[3].territories + " territories -\t" + utils.universalMap(leaderboard[3].idx) + "\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  f += "5th " + leaderboard[4].territories + " territories -\t" + utils.universalMap(leaderboard[4].idx) + "\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  f += "\n🌎 " + countriesStillAlive.length + " countries in the game!\n\n"
  f += "\n🕛 12 HOURS BREAK: 🕛\n"
  f += "\n👍 BEST 3 👍\n"
  f +=  "+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  f +=  "+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  f +=  "+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  top3.reverse();
  f += "\n🔻 WORST 3 🔻\n"
  f +=  top3[0].wt + " " + utils.universalMap(top3[0].id) +  "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  f +=  top3[1].wt + " " + utils.universalMap(top3[1].id) +  "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  f +=  top3[2].wt + " " + utils.universalMap(top3[2].id) +  "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  f += "\nInsurrections: " + civilWar.length + " (" + civilWar + ")\n"
  f += "\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"
  return f;
}

const buildTgStats = (leaderboard, countriesStillAlive, j, top3) => {
  // TELEGRAM
  let t = "⏱♟ <b>TURN " + td.turn +"</b> UPDATE ♟⏱\n\n"
  t +="🎖🎖 <b>TOP 5 ARMIES</b> 🎖🎖\n"
  t += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  t += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  t += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  t += "<i>4th</i> <b>" + leaderboard[3].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[3].idx) + "</b>\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  t += "<i>5th</i> <b>" + leaderboard[4].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[4].idx) + "</b>\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  t += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries in the game!\n"
  t += "\nJackpot: <b>" + j + " TRX</b>\n";
  // t += "\n🕛 <b>12 HOURS BREAK:</b> 🕛\n"
  // t += "\n👍 <b> BEST 3 </b> 👍\n"
  // t +=  "<b>+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  // t +=  "<b>+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  // t +=  "<b>+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  // t += "\n🔻<b> WORST 3 </b> 🔻\n"
  // t +=  "<b>" + top3[0].wt + " " + utils.universalMap(top3[0].id) +  "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].dc) +")\n"
  // t +=  "<b>" + top3[1].wt + " " + utils.universalMap(top3[1].id) +  "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].dc) +")\n"
  // t +=  "<b>" + top3[2].wt + " " + utils.universalMap(top3[2].id) +  "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].dc) +")\n"
  // t += "\nInsurrections: <b>" + civilWar.length + "</b> <i>(" + civilWar + ")</i>\n"
  t += "\nWho will conquer the world? <b>Don't miss it!</b>\n";
  t += "🎖👇👇👇👇👇👇👇🎖";
  return t
}

module.exports.runUpdate = runUpdate;
