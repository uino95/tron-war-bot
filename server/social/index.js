const Telegraf = require('telegraf')
const config = require('../config')
const updates = require('./updates')
const russianRoulette = require('./russianRoulette')
const shares = require('./shares')
const telegram = require('../utils/telegram')

module.exports.runUpdate = async (cmap, td) => {
  if (!(td.turn % config.social.updates.statsFreq)) updates.stats(td);
  else if (!(td.turn % config.social.updates.quotesFreq)) updates.quotes(td);
  if (!(td.turn % config.social.updates.rouletteFreq)) russianRoulette.next(cmap, td);
  updates.battleUpdate(cmap, td);
}

// const callbackResponseHandler = (err, ctx, next) => {
//   return telegram.answerCbQuery(ctx.update.callback_query.id, "You already voted this" ,false)
// }

module.exports.init = async () =>{
  // LOAD STATUS
  await russianRoulette.init();
  // CONFIGURE TELEGRAM BOT
  const bot = new Telegraf(config.telegram.token)
  bot.use(telegram.auth)
  bot.on('callback_query', russianRoulette.onUpdate)
  bot.catch(console.error)
  bot.launch()
}

module.exports.shares = shares;
