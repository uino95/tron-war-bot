const config = require('../config')
const utils = require('../utils')
const firebase = require('../firebase')
const telegram = require('../utils/telegram')
const facebook = require('../utils/facebook')
const path = require('path')


module.exports.becomeAmbassador = async (cmap, td) => {
  let ambLeft = cmap.filter((e)=>!e.ambassador).length
  if (!ambLeft) return;

  let t = "<b> 🎖Ambassador Program 🎖</b>\n\n"
  t += "Be the leader of your favorite country and support it in winning the <b>⚔️ Tron World War ⚔️</b>!\n"
  t += "You can enjoy a reward of <b>10000 TRX</b> and <b>20 WAR</b>\n\n"
  t += "There are still <b>" + ambLeft + "</b> countries looking for an ambassador!\n"
  t += "<b>Answer the call!</b>"
  let f = "🎖 Become an Ambassador 🎖\n\n"
  f += "Be the leader of your favorite country and support it in winning the ⚔️ Tron World War ⚔️!\n\n"
  f += "There are still " + ambLeft + " countries looking for an ambassador!\n"
  f += "Answer the call!\n\n"
  f += "#tron #world #war #gaming #bot #simulation\n@tronwarbot"

  let m = { 'inline_keyboard': [[{'text': '🎖 Become an ambassador', 'url': 'https://tronwarbot.com/ambassador/'}]]};
  let img = utils.imgUrl('ambassador.jpg')
  await telegram.sendMessageWithPhoto(img, t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

  await facebook.postWithPhoto(img, f).catch(console.error);
}
