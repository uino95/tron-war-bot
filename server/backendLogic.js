const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const db = firebase.db

const utils = require('./utils')

//////////////////////////////////// DB USAGE //////////////////////////////////////////

var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var dataRef = db.ref('data')
var betFinalRef = db.ref('betFinalData')
var countriesMapRef = db.ref('countriesMap')

var turnTime = 60000 

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toPercent(n){ return (n*100).toFixed(2) + "%"}

async function checkBetOnDb(txId) {
  return betsRef.once('value').then((r)=>r.child(txId).exists());
}

async function notifyTelegramBot(d, j) {
  if (config.test) return;
  if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured.");
  let s = "🌎♟ <b>BATTLE "+d.turn+"</b>♟🌎\n"
  if (!d.civilWar){
    s += "<b>⚔️💣 "+utils.universalMap(d.o) + " ("+ toPercent(d.cohesion.o) + ")</b> conquered <b>"+utils.universalMap(d.dt)+" ("+ toPercent(d.cohesion.dt) + ")</b> 💣⚔️\n";
    s += "<i>Previously owned by "+utils.universalMap(d.d)+" ("+ toPercent(d.cohesion.d) + ")</i>\n\n"
  } else s += "⚒<b>"+ utils.universalMap(d.o) +" ("+ toPercent(d.cohesion.d) + ")</b> rebelled on the oppressor <b>" + utils.universalMap(d.d) + " ("+ toPercent(d.cohesion.d) + ")</b>⚒"
  s += "Current jackpot on the full run: <b>" + j + " TRX</b>\n";
  let m = {'inline_keyboard' : [[{'text' : '🌎 Place a bet now', 'url' : 'https://tronwarbot.com'}]]};
  let uri = "https://api.telegram.org/bot" + config.telegram.token + "/";
  uri += "sendMessage?chat_id=" + config.telegram.group;
  uri += "&parse_mode=HTML&reply_markup=" + encodeURIComponent(JSON.stringify(m));
  uri += "&disable_web_page_preview=true&text=" + encodeURIComponent(s);

  return await rp.get(uri).catch(console.error);
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
  let time = (new Date()).valueOf() + turnTime 

  // GET CURRENT TURN
  var turn = wwb.currentTurn();
  // GET CURRENT BET RATES AND MAP
  var cMap = wwb.mapState();

  // STOP BET BUTTON
  dataRef.update({ serverStatus: 300 })
  betFinalRef.update({ serverStatus: 300 })
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(config.test ? 3000 : 29000);
  var go = !(await wwb.nextTurn());

  // STOP GAME BETS
  if (go) await stopGame();

  // GET WINNER AND UPDATES
  var data = wwb.currentTurnData();

  // UPDATE HISTORY
  dataRef.update({ turn: data.turn })
  dataRef.update({ turnTime: time})
  historyRef.push().set({
                  conquest: [data.o, data.dt],
                  prev: data.d,
                  turn: data.turn,
                  civilWar: data.civilWar
                });

  var j = await twb.twb.jackpot(0).call();
  // COMMUNICATE WINNER
  notifyTelegramBot(data, twb.tronWeb.fromSun(j.toString()));

  // PAYOUT IN PROGESS
  dataRef.update({ serverStatus: 400 });
  betFinalRef.update({ serverStatus: 400 })

  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //
  // GET CHAIN ROUND
  var cr = await twb.getCurrentRound(1);
  // GET WINNER AND RATE
  var _winner = cMap[data.o];
  // GET WINNING BETS
  var _bets = await betsRef.orderByChild("gameType").equalTo(1).once("value").then(r=>(r.val() || []).filter(e=>(e.round.toString()==cr.round.toString() && e.betReference.toString() == turn.toString())));
  // PAYOUT FINAL
  if (go) await gameOver();

  // CAN PLACE BETS
  dataRef.update({ serverStatus: 200 });
  betFinalRef.update({ serverStatus: 200 });

  // PAYOUT
  await twb.housePayout(1, cr.round, data.o, _winner.nextQuote, _bets);

  console.log("[SCHEDULER]: Next turn complete!");
}



///////////////////////////////////////////////////////////////////////////////////////

// Watch new bets
module.exports.watchBet = function() {
  console.log("[LOGIC]: Watching user bets...")
  return twb.watchEvents('Bet', async function(r) {
      let bet = r.result
      console.log(wwb.currentTurn())
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
      if(bet.gameType == 0){
        let jackpot = await twb.availableJackpot(0, bet.round);
        jackpot = twb.tronWeb.fromSun(jackpot.toString())
        betFinalRef.update({jackpot})
        console.info("Jackpot is: ", jackpot)
      }
      console.info("Successfully registered bet in tx " + r.transaction + " at " + betTime )
  });
}
