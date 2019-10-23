const config = require('../config')
const utils = require('../utils')
const telegram = require('../utils/telegram').telegram
const rp = require('request-promise');
const wwb = require('../worldWarBot')
const cache = [];

const getCbData = (id)=>{
  let out = [];
  let o = {action:'ADD_AMBASSADOR', id};
  o.approve= true;
  out.push({'text':'✅ Approve', 'callback_data':JSON.stringify(o)})
  o.approve = false
  out.push({'text':'❌ Reject', 'callback_data':JSON.stringify(o)})
  return out;
}

module.exports.register = async (req,res,next) => {
  // VALIDATE
  let country = parseInt(req.body.country);
  if (!req.body.access_token || isNaN(country) || !req.body.address)
    return next('Missing fields in body: either access_token, country or address');
  let cmap = await wwb.mapState();
  if (!cmap[country] || !!cmap[country].ambassador)
    return next('Invalid country or ambassador already defined for current country')
  // Get user data
  let fb_user = await rp.get("https://graph.facebook.com/v4.0/me?access_token="+req.body.access_token+"&fields=id,name,link").catch(console.error)
  fb_user = JSON.parse(fb_user || false)
  if (!fb_user) return next('Invalid user');
  let user = {
    id:fb_user.id,
    name:fb_user.name,
    link: fb_user.link,
    country: country,
    address:req.body.address
  }
  if (!wwb.isValidAmbassador(user))
    return next('New ambassador is not valid')
  let id = cache.push(user)-1;
  let msg = "<b>🆕 Ambassador request</b>\n\n"
  msg += "<b>"+user.name+"</b> would like to be the ambassador of <b>" + utils.universalMap(user.country) + "</b>\n\n"
  msg += "Tron address: <a href='https://tronscan.org/#/address/"+user.address+"'>"+user.address+"</a>\n"
  msg += "Facebook profile: <a href='"+user.link+"'>"+user.name+"</a>\n"
  msg += "Shall we let him in?"
  let m = { 'inline_keyboard': [getCbData(id)]};
  let r = await telegram.sendMessage(config.telegram.adminGroup, msg, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true})
}

module.exports.approve = async (ctx,next) => {
  let m = ctx.update.callback_query.message;
  let msg = m.text;
  if (ctx.body.approve) wwb.addAmbassador(cache[ctx.body.id])
  cache[ctx.body.id] = undefined
  msg += '\n\n' + (ctx.body.approve ? '✅ <b>APPROVED</b>':'❌ <b>REJECTED</b>');
  await telegram.editMessageText(m.chat.id, m.message_id, undefined, msg,  {parse_mode: "HTML", reply_markup: { 'inline_keyboard': [[]]}});
}
