//require('./fakeBots');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

var http = require('http').Server(app);

const twb = require('./tronWarBot');
const referral = require('./referral');
const backendLogic = require('./backendLogic')

app.use(cors());
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Endpoints //////////////////////////////////////


// Post for the referral
app.post('/referral', async function(req, res){
  if(!req.body.user_addr){
    return res.status(400).send({
        success: 'false',
        message: 'user_addr is required'
    })
  } else if (!req.body.txId){
    return res.status(400).send({
        success: 'false',
        message: 'txId is required'
    })
  } else if (!req.body.referrer_addr){
    return res.status(400).send({
        success: 'false',
        message: 'referrer_addr is required'
    })
  }
  try{
    var txId = req.body.txId
    var user_addr = req.body.user_addr
    var referrer_addr = req.body.referrer_addr
    var betOnDb = await referral.checkBetOnDb(txId)
    if(betOnDb){
      console.log("Bet on DB updating referral ", betOnDb)
      referral.createReferral(user_addr, referrer_addr, betOnDb)
      return res.status(200).send({
          success: 'true',
          message: 'referral associated'
      })
    } else {
      return res.status(400).send({
          success: 'false',
          message: 'A bet is required in order to receive the referral, scammer'
      })
    }
  } catch(err) {
    console.log(err)
  }
});

// just for keeping it alive
app.get('/', (req, res) => {
    res.status(200).send({
        success: 'true',
        message: 'pinged',
    })
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// STARTUP ////////////////////////////////////////

twb.startUp(0, false);
twb.startUp(1, true);
//backendLogic.syncServer(false);
backendLogic.watchBet();
backendLogic.watchNewTurn();
referral.watchPayer();

var PORT = process.env.PORT || 3000;

http.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
