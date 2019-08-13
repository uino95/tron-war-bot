const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const fairness = require('./fairness')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const telegram = require('./telegram')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const utils = require('./utils')

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toPercent = (n) =>(n * 100).toFixed(1) + "%"

const STOP_BET_MARGIN = config.test ? 5 : 15;
const STOP_BET_DURATION = ((config.timing.blockConfirmation * 3) + STOP_BET_MARGIN)  * 1000;

console.log("[TIMING]: Stop bet duration is: " + (STOP_BET_DURATION/1000) + "s");

const stopGame = async ()=>{
  await firebase.data.update({ serverStatus: 500 });
  await twb.endGame(0);
  await twb.endGame(1);
}

const gameOver = async () => {

  var cr = await twb.cachedCurrentRound(0);
  var winner = wwb.winner();
  console.log("[LOGIC]: Sleeping one minute before automatic jackpot payout...");
  await sleep(60000);

  // GET WINNING BETS
  let _bets = await firebase.bets.getCurrentRoundBets(0, cr.round);
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);

  await twb.jackpotPayout(0, cr.round, winner, _bets, j);
  console.log("[GAME OVER]: The game is f***ing over... cit. Six Riddles");
}

const updateResultsOnDB = (_b, _wb) => {
  _wb = _wb.reduce((o,el)=>{o[el.txId]=el; return o;}, {})
  // Update the loser bets left
  _b.forEach(b =>{firebase.bets.child(b.txId).update({result: (_wb[b.txId] ? _wb[b.txId].win : 0)})})
}

const stopBets = async (waitTime) => {
  if (wwb.winner()) return;
  // STOP BET BUTTON
  await firebase.data.update({serverStatus: 300})
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(waitTime || 0);
  //UPDATE TURN CURRENT WHICH PREVENTS BET SLIPPAGE
  wwb.updateTurn();
}

const simulate = async () => {
  if (wwb.winner()) return;
  // CALCULATE MAGIC NUMBER AND SEED
  let turn = wwb.currentTurn();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  var magic = utils.randomHex();
  var seed = utils.randomHex();
  if (turn == currentSecret.turn) {
    magic = currentSecret.magic;
    seed = currentSecret.seed;
  }
  // SAVE MAGIC NUMBER AND SEED
  else await firebase.secret.update({turn, magic, seed});
  // SIMULATE TURN
  var cMap = await wwb.mapState();
  [ cMap , turnData, computedRandom] = fairness.computeNextState(cMap, magic, seed);
  // EVALUATE WINNER
  var stringToHash = utils.universalMap(turnData.o) + "(" + turnData.o + "):"  + seed;
  // console.log("[SIMULATE]: Winner on turn " + turn + " is => " + utils.universalMap(turnData.o) + "("+ turnData.o +") with computed randoms: " + JSON.stringify(computedRandom));
  // COMPUTE SHA256 (WINNER + SEED)
  // console.log("Computing SHA256 of:     " + stringToHash);
  let nextMagicHash = utils.sha256(stringToHash);
  // console.log("SHA256 is " + nextMagicHash);
  // SAVE SHA256
  await firebase.fairness.update({nextMagicHash});
  return [magic, seed];
}

const revealFairWinner = async () => {
  let turnData = wwb.currentTurnData();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());

  if (turnData.turn != currentSecret.turn) return console.error("[LOGIC]: We have overlapping turns. Make sure to reveal winner prior to launch next turn!");

  let currentFairness = await firebase.fairness.once('value').then(r=>r.val());

  console.log("[LOGIC]: Winner on current turn is: " + turnData.o + " => " + utils.universalMap(turnData.o));
  let seed = currentSecret.seed;
  let magicHashRevealed = utils.universalMap(turnData.o) + "(" + turnData.o + "):"  + seed;
  console.log("Computing SHA256 of:    " + magicHashRevealed);
  let previousMagicHash = utils.sha256(magicHashRevealed);
  if (previousMagicHash != currentFairness.nextMagicHash) console.error("[FAIRNESS]: I don't think that is a really fair game... Hope noone notices that... Shh!!");
  console.log("SHA256 is " + previousMagicHash);
  await firebase.fairness.update({previousMagicHash, magicHashRevealed});
}



///////////////////////////////////////////////////////////////////////////////////////
module.exports.simulateNextTurn = async () =>{
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: ********* Simulating next turn! *********");

  let nextTurnTime = new Date()
  nextTurnTime.setSeconds(nextTurnTime.getSeconds() + config.timing.turn - config.timing.spread);
  await firebase.data.update({ serverStatus: 200, turnTime: nextTurnTime.valueOf() });
  [magic, seed] = await simulate();

  console.log("[SCHEDULER]: ********* Simulating next turn finished! *********");
}


module.exports.launchNextTurn = async () =>{
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: ********* Launch next turn! *********");

  // READY TO LAUNCH TURN
  let turn = wwb.currentTurn();

  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  if (turn != currentSecret.turn) return console.error("[LOGIC] Need to simulate turn before updating. Wait for next one.");

  console.log("!!!!!! Declaring winner in seconds! DO NOT STOP SERVER NOW (please) !!!!!!!")
  let magic = currentSecret.magic;
  let seed = currentSecret.seed;

  await stopBets(STOP_BET_DURATION);


  // GET CURRENT BET RATES AND MAP
  var cMap = await wwb.mapState();
  var go = await wwb.launchNextTurn(magic, seed);



  // GET WINNER AND UPDATES
  var data = wwb.currentTurnData();
  // GET WINNER AND RATE
  var _winner = cMap[data.o];
  // GET CHAIN ROUND
  var cr = await twb.cachedCurrentRound(1);

  // UPDATE HISTORY
  firebase.history.push().set({
    conquest: [data.o, data.dt],
    prev: data.d,
    turn: data.turn,
    civilWar: data.civilWar
  });

  // REVEAL FAIRNESS
  await revealFairWinner();

  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //
  console.log("[SCHEDULER]: ********* Critical turn operations completed! *********");

  // STOP GAME BETS
  if (go) await stopGame();

  // COMMUNICATE WINNER
  telegram.notifyTelegramBot(data);

  console.log("[SCHEDULER]: ----- Running payouts! ------");
  // GET CURRENT TURN BETS
  var _bets = await firebase.bets.getCurrentTurnBets(1, cr.round, data.turn);


  // PAYOUT
  const winningBets = await twb.housePayout(1, cr.round, data.o, _winner.nextQuote, _bets);
  // UPDATE RESULTS BET ON DB
  await updateResultsOnDB(_bets, winningBets);
  // PAYOUT FINAL
  if (go) gameOver();

  console.log("[SCHEDULER]: ----- Payout finished! ------");
}


///////////////////////////////////////////////////////////////////////////////////////

// Watch new bets
module.exports.watchBet = function () {
  console.log("[LOGIC]: Watching user bets...")
  return twb.watchEvents('Bet', async function (r) {
    let bet = r.result
    if (!(await betValidator.validate(bet)))
      return console.error("[INVALID_BET]: Received an invalid bet for gameType: " + bet.gameType.toString() +
        "\n\tof amount: " + twb.tronWeb.fromSun(bet.amount.toString()) +
        "\n\tby: " + bet.from.toString() +
        "\n\twith user choice: " + bet.userChoice.toString() +
        "\n\tbetReference: " + bet.betReference.toString());
    let isBetAlreadyOnDb = await firebase.bets.checkBetOnDb(r.transaction);
    if (!!isBetAlreadyOnDb) return console.error("[GENERIC]: Bet " + r.transaction + " is already on DB");
    let turn = wwb.currentTurn();
    let betTime = new Date().getTime()
    let betObj = {
      from: twb.tronWeb.address.fromHex(bet.from),
      amount: bet.amount,
      userChoice: bet.userChoice,
      round: bet.round,
      betReference: bet.betReference,
      result: -1,
      time: betTime,
      gameType: bet.gameType,
      turn: turn,
      alreadyUsed: false,
    }
    firebase.bets.child(r.transaction).set(betObj)
    referral.updateReferral(betObj)
    if (bet.gameType.toString() == "0") {
      let jackpot = await twb.availableJackpot(0, bet.round);
      jackpot = twb.tronWeb.fromSun(jackpot.availableJackpot.toString())
      firebase.data.update({ jackpot })
      console.info("Jackpot is: ", jackpot)
    }
    console.info("Successfully registered bet in tx " + r.transaction + " at " + betTime)
  });
}
