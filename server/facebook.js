const config = require("./config");
const FB = require('fb').default;

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
  let r = await FB.api('me/feed', 'post', { message: body });
  console.log("[FACEBOOK]: Post published successfully with id: " + r.id);
}

const analyze = async ()=>{
  // @TODO
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
  console.log("[FACEBOOK]: Received new notification with signature: " + req.headers["X-Hub-Signature"] + "  and payload:  " + JSON.stringify(req.body))
  return res.send("");
}


module.exports = {
  me,
  post,
  analyze,
  webhooksVerification,
  webhooks
};
