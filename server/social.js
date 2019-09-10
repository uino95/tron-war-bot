const config = require('./config')
const utils = require('./utils')
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const telegram = require('./telegram')


async function runUpdate(){
  _tMessage = undefined;

  let history = await firebase.history.orderByChild('turn').once("value");
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let leaderboard = wwb.leaderboard();
  let countriesStillAlive = wwb.countriesStillAlive();



  // TELEGRAM
  let t = "⏱♟ <b>TURN " + wwb.currentTurn() +"</b> UPDATE ♟⏱\n"
  t += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries alive!\n\n"
  t +="🎖🎖 <b>TOP 5 ARMIES</b> 🎖🎖\n"
  t += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  t += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  t += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  t += "<i>4th</i> <b>" + leaderboard[3].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[3].idx) + "</b>\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  t += "<i>5th</i> <b>" + leaderboard[4].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[4].idx) + "</b>\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  t += "\nJackpot: <b>" + j + " TRX</b>\n\n";
  t += "Who will conquer the world?? <b>Do not miss out!</b>\n";
  t += "🎖👇👇👇👇👇👇👇🎖";
  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

}


module.exports.runUpdate = runUpdate;
