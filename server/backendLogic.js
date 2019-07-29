const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const db = firebase.db

// const options = {
//     method: "DELETE",
//     uri: 'https://api.heroku.com/apps/tronwarbot/dynos/web',
//     headers: {
//         'content-type': 'application/json',
//         'accept': 'application/vnd.heroku+json; version=3',
//         'Authorization': 'Bearer ' + config.heroku.apiKey
//     }
// };

//////////////////////////////////// DB USAGE //////////////////////////////////////////

var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var dataRef = db.ref('data')
var betFinalRef = db.ref('betFinalData')
var countriesMapRef = db.ref('countriesMap')


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function checkBetOnDb(txId) {
  return betsRef.once('value').then((r)=>r.child(txId).exists());
}

async function notifyTelegramBot(d) {
  if (config.test) return;
  return await rp({
    method: "POST",
    uri: "https://masfik.net/TronWarBot/webhook.php",
    headers: { 'content-type': 'application/json'},
    body: {
      "auth_token": "QbdPS%I%62Bv2Sizf4*!$4iB%zz@!9",
      "turn": d.turn,
      "conquered": d.dt,
      "conqueror": d.o,
      "prev_owner": d.d
    }
  }).catch(console.error);
}

async function stopGame(){
  await twb.endGame(0);
  await twb.endGame(1);
}

async function gameOver(){
  dataRef.update({ serverStatus: 500 });
  var cr = await twb.getCurrentRound(0);
  var winner = wwb.winner();
  console.log("[LOGIC]: Sleeping one minute before automatic jackpot payout...");
  await sleep(60000);

  // GET WINNING BETS
  var _bets = await betsRef.orderByChild("gameType").equalTo(0).once("value").then(r=>(r.val() || []).filter(e=>(e.round==cr.round && e.betReference.toString() == turn.toString())));

  await twb.jackpotPayout(0, cr.round, winner, _bets);
  console.log("[GAME OVER]: The game is f***ing over... cit. Six Riddles");
}

module.exports.launchNextTurn = async function() {
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: Launching next turn!")

  // GET CURRENT TURN
  var turn = wwb.currentTurn();
  // GET CURRENT BET RATES AND MAP
  var cMap = await countriesMapRef.once('value').then(r=>r.val());

  // STOP BET BUTTON
  dataRef.update({ serverStatus: 300 })
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(config.test ? 3000 : 29000);
  var go = !(await wwb.nextTurn());

  // STOP GAME BETS
  if (go) await stopGame();

  // GET WINNER AND UPDATES
  var data = wwb.currentTurnData();

  // UPDATE HISTORY
  dataRef.update({ turn: data.turn })
  dataRef.update({ turnTime: (new Date()).valueOf() })
  historyRef.push().set({
                  conquest: [data.o, data.dt],
                  prev: data.d,
                  turn: data.turn,
                  civilWar: data.civilWar
                });

  // COMMUNICATE WINNER
  notifyTelegramBot(data);
  // PAYOUT IN PROGESS
  dataRef.update({ serverStatus: 400 });

  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //
  // GET CHAIN ROUND
  var cr = await twb.getCurrentRound(1);
  // GET WINNER AND RATE
  var _winner = cMap[data.o];
  // GET WINNING BETS
  var _bets = await betsRef.orderByChild("gameType").equalTo(1).once("value").then(r=>(r.val() || []).filter(e=>(e.round.toString()==cr.round.toString() && e.betReference.toString() == turn.toString())));
  // PAYOUT
  await twb.housePayout(1, cr.round, data.o, _winner.nextQuote, _bets);

  // PAYOUT FINAL
  if (go) await gameOver();

  console.log("[SCHEDULER]: Next turn complete!");
}



///////////////////////////////////////////////////////////////////////////////////////

// Watch new bets
module.exports.watchBet = function() {
  console.log("[LOGIC]: Watching user bets...")
  return twb.watchEvents('Bet', async function(r) {
      let bet = r.result
      if (!(await betValidator.validate(bet)))
        return console.error("[INVALID_BET]: Received an invalid bet for gameType: " + bet.gameType.toString()
                            + "\n\tof amount: " + twb.tronWeb.fromSun(bet.amount.toString())
                            + "\n\tby: " + bet.from.toString()
                            + "\n\twith user choice: " + bet.userChoice.toString()
                            + "\n\tbetReference: " + bet.betReference.toString() );
      let isBetAlreadyOnDb = await checkBetOnDb(r.transaction);
      if (!!isBetAlreadyOnDb) return console.error("[GENERIC]: Bet " + r.transaction + " is already on DB");
      let turn = wwb.currentTurn();
      let betTime = new Date().getTime()
      let betObj = {
          from: twb.tronWeb.address.fromHex(bet.from),
          amount: bet.amount,
          userChoice: bet.userChoice,
          round: bet.round,
          betReference : bet.betReference,
          result: -1,
          time: betTime,
          gameType: bet.gameType,
          turn: turn
      }
      betsRef.child(r.transaction).set(betObj)
      referral.updateReferral(betObj)
      let jackpot = await twb.availableJackpot(0, bet.round);
      jackpot = twb.tronWeb.fromSun(jackpot.availableJackpot.toString())
      betFinalRef.update({jackpot})
      console.info("Successfully registered bet in tx " + r.transaction + " at " + betTime )
      console.info("Jackpot is: ", jackpot)
  });
}
