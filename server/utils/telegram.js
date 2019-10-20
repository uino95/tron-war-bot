// WE DO NOT NEED PROMISE CANCELLATION
const Telegram = require('telegraf/telegram')

const config = require('../config')
const utils = require('../utils')
const firebase = require('../firebase')

if (!config.telegram.token) throw "[TELEGRAM]: Bot token not configured.";

const telegram = new Telegram(config.telegram.token)
const chatId = config.telegram.group;

const mxCache = {};

const sendMessage = async (...d) => {return await telegram.sendMessage(chatId, ...d).catch(console.error);};

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
module.exports.chatId = chatId;
module.exports.sendOrUpdate = sendOrUpdate;
module.exports.sendMessage = sendMessage;
module.exports.editMessageReplyMarkup = async (...d) => {return await telegram.editMessageReplyMarkup(chatId, ...d).catch(console.error);};
module.exports.editMessageText = async (...d) => {return await telegram.editMessageText(chatId, ...d).catch(console.error);};
module.exports.answerCbQuery = async (...d) => {return await telegram.answerCbQuery(...d).catch(console.error);};


module.exports.auth = (ctx, next)=>{
  if (ctx.chat.id !=chatId) return console.error("[TELEGRAF]: Someone is sending messages.");//ONLY AVAILABLE IN OFFICIAL TWB GROUP
  return next();
}