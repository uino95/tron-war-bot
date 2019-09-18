//require('./fakeBots');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

var http = require('http').Server(app);

const twb = require('./tronWarBot');
const referral = require('./referral');
const backendLogic = require('./backendLogic')
const scheduler = require('./scheduler')
const facebook = require('./facebook');

app.use(cors());
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
  await twb.init();
  await twb.launchGame(0, false);
  await twb.launchGame(1, true);
  await twb.launchGame(2, true);
  // backendLogic.syncServer(false);
  backendLogic.watchBet();
  backendLogic.start();
}

var PORT = process.env.PORT || 3000;
http.listen(PORT, function() {
    console.log("[SERVER]: Server is running on Port: " + PORT);
});

init();
