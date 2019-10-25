const wwb = require('../worldWarBot')
const config = require('../config')
const updates = require('./updates')
const russianRoulette = require('./russianRoulette')
const shares = require('./shares')
const ambassador = require('./ambassador')
const telegram = require('../utils/telegram')

module.exports.runUpdate = async (cmap, td) => {
  if (wwb.winner()) return updates.endWar();
  if (!(td.turn % config.social.updates.statsFreq)) updates.stats(td);
  if (!(td.turn % config.social.updates.quotesFreq)) updates.quotes(td);
  if (!(td.turn % config.social.updates.rouletteFreq)) russianRoulette.next(cmap, td);
  updates.battleUpdate(cmap, td);
}

// const callbackResponseHandler = (err, ctx, next) => {
//   return telegram.answerCbQuery(ctx.update.callback_query.id, "You already voted this" ,false)
// }

module.exports.init = async () =>{
  // LOAD STATUS
  await russianRoulette.init();
}

module.exports.shares = shares;
module.exports.ambassador = ambassador;
