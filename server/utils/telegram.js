// WE DO NOT NEED PROMISE CANCELLATION
const Telegram = require('telegraf/telegram')

const config = require('../config')
const utils = require('../utils')
const firebase = require('../firebase')
const fs = require('fs')


if (!config.telegram.token) throw "[TELEGRAM]: Bot token not configured.";

const telegram = new Telegram(config.telegram.token)
const chatId = config.telegram.group;

var mxCache;

const init = async ()=>{
  if (config.wwb.restart) return mxCache = {}
  mxCache = await firebase.data.once("value").then(r=>r.val()['tgMessageCache']);
  if (!mxCache) mxCache = {}
}

const sendMessage = async (...d) => {return await telegram.sendMessage(chatId, ...d).catch(console.error);};

const sendOrUpdate = async (...d) => {
  if (!mxCache) await init();
  let idx = d.shift();
  if (!idx) return await sendMessage(...d);
  if (idx && mxCache[idx]) {
    let t = d[0];
    let o = d[1];
    let mId = mxCache[idx];
    return await telegram.editMessageText(chatId, mId, mId, t, o).catch(console.error);
  }
  let m = await sendMessage(...d);
  mxCache[idx] = m.message_id;
  firebase.data.update({tgMessageCache: mxCache})
  return m;
};

const sendMessageWithPhoto = async (path, message, options={})=>{
  let img = path
  if (fs.existsSync(path)) img = {source: path}
  options.caption = options.caption || message;
  return await telegram.sendPhoto(chatId, img, options).catch(console.error);
}

module.exports.chatId = chatId;
module.exports.sendOrUpdate = sendOrUpdate;
module.exports.sendMessage = sendMessage;
module.exports.sendMessageWithPhoto = sendMessageWithPhoto;
module.exports.editMessageReplyMarkup = async (...d) => {return await telegram.editMessageReplyMarkup(chatId, ...d).catch(console.error);};
module.exports.editMessageText = async (...d) => {return await telegram.editMessageText(chatId, ...d).catch(console.error);};
module.exports.answerCbQuery = async (...d) => {return await telegram.answerCbQuery(...d).catch(console.error);};
module.exports.getMe = async (...d) => {let r = await telegram.getMe(...d); return console.log("[TELEGRAM]: Hi! I am: " + r.username + "   id: " + r.id)};

module.exports.telegram = telegram;
