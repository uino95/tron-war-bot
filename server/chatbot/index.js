const Telegraf = require('telegraf')
const config = require('../config')

const auth = require('./auth')
const actions = require('./actions')


// const callbackResponseHandler = (err, ctx, next) => {
//   return telegram.answerCbQuery(ctx.update.callback_query.id, "You already voted this" ,false)
// }

module.exports.init = async () =>{
  // CONFIGURE TELEGRAM BOT
  const bot = new Telegraf(config.telegram.token)
  bot.use(auth.getMode)
  bot.on('callback_query', auth.getCbQueryAction)
  bot.on('callback_query', auth.checkCbQueryPermissions)
  bot.on('callback_query', actions.handleCbQuery)
  bot.start(auth.checkStartPermissions);
  bot.start(actions.start);
  bot.hears('hi', (ctx) => ctx.reply('Hey there Uino')) // answer every time u use hi
  bot.command('hi', (ctx) => ctx.reply('Hello from the dark')) // answer every time u use /hi
  bot.catch(console.error);
  bot.launch()
}
