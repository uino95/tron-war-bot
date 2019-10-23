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
module.exports.getMe = async (...d) => {let r = await telegram.getMe(...d); return console.log("[TELEGRAM]: Hi! I am: " + r.username + "   id: " + r.id)};

module.exports.telegram = telegram;
