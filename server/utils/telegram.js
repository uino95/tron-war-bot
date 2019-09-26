// WE DO NOT NEED PROMISE CANCELLATION
process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require('node-telegram-bot-api');

const config = require('../config')
const utils = require('../utils')
// const firebase = require('./firebase')
// const wwb = require('./worldWarBot')

const bot = new TelegramBot(config.telegram.token);
const chatId = config.telegram.group;

var _tMessage = "";


const sendMessage = async (...d) => { if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured."); return await bot.sendMessage(chatId, ...d)};

const sendOrUpdate = async (...d) => {
    if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured.");
  _text = d[0];
  if (_tMessage) {
    d[1] = d[1] || {};
    d[1].message_id=_tMessage.message_id;
    d[1].chat_id = chatId;
    return await bot.editMessageText(...d);
  }
  return _tMessage = await sendMessage(...d).catch(console.error);
};

module.exports.sendOrUpdate = sendOrUpdate;
module.exports.sendMessage = sendMessage;
