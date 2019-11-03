const config = require('../config')
const utils = require('../utils')
const telegram = require('../utils/telegram').telegram
const rp = require('request-promise');
const wwb = require('../worldWarBot');
const twb = require('../tronWarBot');
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
  if (!twb.tronWeb.isAddress(req.body.address)) return next('Invalid address');
  let user = {
    id:fb_user.id,
    name:fb_user.name,
    link: fb_user.link,
    country: country,
    address:req.body.address
  }
  if (!wwb.isValidAmbassador(user))
    return next('You are already an ambassador')
  let id = cache.push(user)-1;
  let msg = "<b>🆕 Ambassador request</b>\n\n"
  msg += "<b>"+user.name+"</b> would like to be the ambassador of <b>" + utils.universalMap(user.country) + "</b>\n\n"
  msg += "Tron address: <a href='https://tronscan.org/#/address/"+user.address+"'>"+user.address+"</a>\n"
  msg += "Facebook profile: <a href='"+user.link+"'>"+user.name+"</a>\n"
  msg += "Shall we let him in?"
  let m = { 'inline_keyboard': [getCbData(id)]};
  let r = await telegram.sendMessage(config.telegram.adminGroup, msg, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true})
  return res.json({})
}


module.exports.approve = async (ctx,next) => {
  let m = ctx.update.callback_query.message;
  let msg = m.text;
  if (ctx.body.approve) {
    let user = cache[ctx.body.id]
    wwb.addAmbassador(user)
    let msg = "<b> 🎖 Hooray for a 🆕 Ambassador 🎖</b>\n\n"
    msg += "Please welcome <b><a href='"+user.link+"'>"+user.name+"</a></b> as the new ambassador of <b>" + utils.universalMap(user.country) + "</b>\n\n"
    let q = quotesSample(utils.universalMap(user.country))
    msg += q[utils.randomInt(q.length)];
    let r = await telegram.sendMessage(config.telegram.group, msg, {parse_mode: "HTML", disable_web_page_preview: true})
  }
  cache[ctx.body.id] = undefined
  msg += '\n\n' + (ctx.body.approve ? '✅ <b>APPROVED</b>':'❌ <b>REJECTED</b>');
  await telegram.editMessageText(m.chat.id, m.message_id, undefined, msg,  {parse_mode: "HTML", reply_markup: { 'inline_keyboard': [[]]}});
  if (!ctx.body.approve) return;
}

const quotesSample =  (c) =>[
  "<i>🙌🙌 Now raise your hands for " + c + " and make some noise! 🙌🙌</i>\n",
  "<i>🔥🔥 Come on, unleash hell for " + c +" 🔥🔥</i>\n",
  "<i>⚔️ Well then I guess there's only one thing left to do. Win the Tron World War in the name of " + c + " ⚔️</i>\n",
  "<i>🍀 We will not go quietly into the night! We will not vanish without a fight! We're going to live on! Today we celebrate " + c + "'s Day! 🍀</i>\n",
  "<i>🌟 Soldiers! Don't fight for slavery, fight for liberty! You the people have the power to make this life free and wonderful! Then in the name of " + c + " let us use that power! Let us all unite! 🌟</i>\n"
]
