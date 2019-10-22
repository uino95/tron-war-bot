const russianRoulette = require('../social/russianRoulette')
const config = require('../config')

const reject = (ctx, e='Unknown operation') => {
  if (ctx.updateType =='callback_query') telegram.answerCbQuery(ctx.update.callback_query.id, e);
  throw new Error(e);
}


module.exports.handleCbQuery = (ctx,next) => {
  switch(ctx.body.action) {
    case 'RR_VOTE':
      return russianRoulette.onUpdate(ctx,next);
    case 'ADD_AMBASSADOR':
      return console.log("Adding ambassador...")
    default:
      return reject(ctx);
  }
}


module.exports.start = (ctx, next) => {
  let s = '<b>Welcome to TronWarBot 2.0!</b>\n\n'
  s += '<b>TronWarBot</b> <i>is a social game, which simulates a war '
  s += 'played with real value at stake over social media platforms.</i>\n\n'
  s += 'I appreciate your interest but at the moment this interface is not available yet but the war is already 🔛!\n'
  s += "You might want to check in our official telegram channel <a href=\"https://t.me/Tron_WarBot\">@TronWarBot</a> to get the latest updates or "
  s += 'place your bet on our website using the button below.\n'
  s += "\n<b>Who will conquer the world?</b>\n";
  s += "🎖👇👇👇👇👇👇👇🎖";
  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  return ctx.replyWithHTML(s, {reply_markup: m})
}
