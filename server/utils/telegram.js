// WE DO NOT NEED PROMISE CANCELLATION
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const Extra = require('telegraf/extra')

const config = require('../config')
const utils = require('../utils')
const firebase = require('../firebase')

if (!config.telegram.token) throw "[TELEGRAM]: Bot token not configured.";

const telegram = new Telegram(config.telegram.token)
const chatId = config.telegram.group;

const mxCache = {};

const sendMessage = async (...d) => {
  return await telegram.sendMessage(chatId, ...d).catch(console.error);
};

const sendOrUpdate = async (...d) => {
  let idx = d.shift();
  if (!idx) return await sendMessage(...d);
  if (idx && mxCache[idx]) {
    let t = d[0];
    let o = d[1];
    let mId = mxCache[idx].message_id;
    return await telegram.editMessageText(chatId, mId, mId, t, o).catch(console.error);
  }
  return mxCache[idx] = await sendMessage(...d);
};





const russianRoulette = async ()=>{
  let text = "Support your country!"
  let m = { 'inline_keyboard': [[{'text': '🤩', 'callback_data': '2'},{'text': '👍🏻', 'callback_data': '1'},{'text': '👎🏻', 'callback_data': '-1'},{'text': '🤬', 'callback_data': '-2'}]]};
  await sendMessage(text, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true})
}
const onRussianRouletteUpdate = async (ctx, next)=>{
  let o = ctx.update.callback_query.data;
  let user = ctx.from.id;
  console.log("###### ",user," -> ",o)
}


const bot = new Telegraf(config.telegram.token)
bot.use((ctx, next)=>{
  if (ctx.chat.id !=chatId) return console.error("[TELEGRAF]: Someone is sending messages.");
  return next();
}) //ONLY AVAILABLE IN OFFICIAL TWB GROUP
bot.on('callback_query', onRussianRouletteUpdate)
bot.launch()
russianRoulette()

module.exports.sendOrUpdate = sendOrUpdate;
module.exports.sendMessage = sendMessage;
module.exports.russianRoulette = russianRoulette;
