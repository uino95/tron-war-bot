const config = require("../config");
const shares = require("../social/shares")
const FB = require('fb').default;
const fs = require('fs');

if (!config.facebook.token) throw "[FACEBOOK]: Access token is not set in environment variables!"

FB.options({version: 'v4.0'});
FB.setAccessToken(config.facebook.token);

// GET PAGE ACCESS TOKEN FROM USER ACCESS TOKEN
// FB.api(config.facebook.pageId, {fields:"access_token"}).then((r)=>{
//   console.log("[FACEBOOK]: New Page Access Token is:" + r.access_token)
//   FB.setAccessToken(r.access_token);
// })


const me = async (body)=>{
  let r = await FB.api('me', { fields: 'id,name' });
  console.log("[FACEBOOK]: Hi! I am: " + r.name + "   id: " + r.id);
}

const post = async (body)=>{
  if (config.test) return console.log("[FACEBOOK]: Not posting in test mode. Preview:\n\n" + body);
  let r = await FB.api('me/feed', 'post', { message: body });
  console.log("[FACEBOOK]: Post published successfully with id: " + r.id);
}

const postWithPhoto = async (path, body)=>{
  if (config.test) return console.log("[FACEBOOK]: Not posting in test mode. Preview:\n\n" + body);
  if (fs.existsSync(path)) return console.error('[FB]: Image upload unsupported at the moment. Use url instead')
  let r = await FB.api('me/photos', 'post', { caption: body, url: path });
  console.log("[FACEBOOK]: Post published successfully with id: " + r.post_id);
}


const webhooksVerification = async (req, res, next) => {
  console.log("[FACEBOOK]: Received new webhooks verification attempt with: " + JSON.stringify(req.query));
  if (!req.query || !req.query["hub.challenge"] || req.query["hub.mode"]!="subscribe" || req.query["hub.verify_token"] != process.env.FB_WEBHOOKS_TOKEN) {
    console.error("Invalid webhooks call or verification token")
    return res.status(500).send({})
  }
  console.log("[FACEBOOK]: New webhooks challenge: " + req.query["hub.challenge"])
  return res.send(req.query["hub.challenge"])
}

const webhooks = async (req, res, next) => {
  if (!req.isXHubValid() && !config.test) return console.error("[WEBHOOKS]: Received an http call not originated from Facebook!")
  console.log("[FACEBOOK]: Received new notification with payload:  " + JSON.stringify(req.body))
  let bd = req.body;
  if (bd.object != "page" || !bd.entry || !bd.entry[0] || !bd.entry[0].changes) return res.send("");
  // IF MULTIPLE ENTRIES
  for (var el of bd.entry[0].changes) {
    let u = getUpdateData(el);
    if (!u) continue;
    // let update_type = getUpdateType(el);
    // let text = getText(el);
    // let user_id = getUserId(el);
    // let user_name = el.user_name;
    // let link = el.link;
    await shares.update(u.text, u.user_id, u.user_name, u.update_type, "FB", u.link)
  }
  return res.send("");
}

const getUpdateData = (update)=>{
  switch (update.field){
    case "rating":
      if (update.value.verb!="add") return;
      return {
        update_type: "review",
        text: update.value.review_text,
        user_id : update.value.reviewer_id,
        user_name : update.value.reviewer_name,
        link: "https://facebook.com/" + update.value.comment_id
      }
    case "feed":
      if (update.value.verb!="add") return;
      //POST
      return {
        update_type: "post",
        text: update.value.message,
        user_id : update.value.from.id,
        user_name : update.value.from.name,
        link: "https://facebook.com/" + update.value.post_id
      }
    default:
      return
  }
}


module.exports = {
  me,
  post,
  postWithPhoto,
  webhooksVerification,
  webhooks
};
