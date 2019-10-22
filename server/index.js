//require('./utils/fakeBots');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const xhub = require('express-x-hub');

const config = require('./config');
const twb = require('./tronWarBot');
const referral = require('./referral');
const backendLogic = require('./backendLogic')
const scheduler = require('./scheduler')
const facebook = require('./utils/facebook');
const telegram = require('./utils/telegram');
const chatbot = require('./chatbot');
const social = require('./social');


app.use(cors());
app.use(xhub({ algorithm: 'sha1', secret: config.facebook.appSecret }));
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Endpoints //////////////////////////////////////


// Post for the referral
app.post('/referral', referral.registerReferral);
app.get('/webhooks', facebook.webhooksVerification);
app.post('/webhooks', facebook.webhooks);

// just for keeping it alive
app.get('/', (req, res) => {
    return res.status(200).send({ success: 'true', message: 'pinged'});
});


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// STARTUP ////////////////////////////////////////
const init = async () => {
  try {
    await twb.init();
    backendLogic.watchBet();
    await twb.launchGame(0, false);
    await twb.launchGame(1, true);
    await twb.launchGame(2, true);
    await backendLogic.init();
    if (!config.test) await facebook.me();
    await telegram.getMe();
    await social.init();
    await chatbot.init();

  } catch (e) {
    console.error(e)
    return process.exit(1)
  }
  backendLogic.start();
}

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log("[SERVER]: Server is running on Port: " + PORT);
});

init();
