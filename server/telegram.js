// WE DO NOT NEED PROMISE CANCELLATION
process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require('node-telegram-bot-api');

const config = require('./config')
const utils = require('./utils')
const firebase = require('./firebase')
const wwb = require('./worldWarBot')

const bot = new TelegramBot(config.telegram.token);
const chatId = config.telegram.group;

var _tMessage, _text = "";

async function battleUpdate(d) {
  if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured.");

  let s = "<b> " + d.turn + "</b> ⚔️\t"
  if (!d.civilWar) {
    s += "<b> " + utils.universalMap(d.o) + " " + utils.toPercent(d.cohesion.o) + "</b> => <b>" + utils.universalMap(d.dt) + " " + utils.toPercent(d.cohesion.dt) + "</b>\n";
    s += "\t\t\t  <i>Previously: " + utils.universalMap(d.d) + " " + utils.toPercent(d.cohesion.d) + "</i>"
  } else {
    s += "✨🍀<b>" + utils.universalMap(d.o) + " (" + utils.toPercent(d.cohesion.o) + ")</b> rebelled on  <b>" + utils.universalMap(d.d) + " (" + utils.toPercent(d.cohesion.d) + ")</b>\n"
    s += "\t\t\t  <i>Long live " + utils.universalMap(d.o) + "!</i>"
  }
  if (_tMessage) {
    _text = _text + "\n" + s
    return await bot.editMessageText(_text, {chat_id:chatId, message_id:_tMessage.message_id, parse_mode: "HTML", disable_web_page_preview: true})
  }
  _text = s
  _tMessage = await bot.sendMessage(chatId, _text, {parse_mode: "HTML", disable_web_page_preview: true, disable_notification:true}).catch(console.error);
}

async function runUpdate(){
  _tMessage = undefined;
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let leaderboard = wwb.leaderboard();
  let countriesStillAlive = wwb.countriesStillAlive();
  let s = "⏱♟ <b>TURN: " + wwb.currentTurn() +"</b> RUN UPDATE ♟⏱\n"
  s += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries alive!\n\n"
  s +="🎖🎖 <b>TOP 5 ARMIES</b> 🎖🎖\n"
  s += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  s += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  s += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  s += "<i>4th</i> <b>" + leaderboard[3].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[3].idx) + "</b>\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  s += "<i>5th</i> <b>" + leaderboard[4].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[4].idx) + "</b>\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  s += "\nJackpot: <b>" + j + " TRX</b>\n\n";
  s += "Who will conquer the world?? <b>Do not miss out!</b>\n";
  s += "🎖👇👇👇👇👇👇👇🎖";

  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  await bot.sendMessage(chatId, s, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

}



module.exports.notifyTelegramBot = battleUpdate;
module.exports.runUpdate = runUpdate;
