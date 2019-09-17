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
  await twb.endGame(2);
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
  // STOP BET BUTTON
  await firebase.data.update({serverStatus: 300})
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(waitTime || 0);
  //UPDATE TURN CURRENT WHICH PREVENTS BET SLIPPAGE
  wwb.preTurn();
}

const simulate = async () => {
  // CALCULATE MAGIC NUMBER AND SEED
  let turn = wwb.currentTurn();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  var magic = utils.randomHex();
  if (turn == currentSecret.turn) magic = currentSecret.magic;
  // SAVE MAGIC NUMBER AND SEED
  else await firebase.secret.update({turn, magic});
  // EVALUATE WINNER
  let magicHash = utils.sha256(magic);
  let blockNumber = 50;
  let mapState = await wwb.compressedState();
  let next = {mapState, magicHash, blockNumber, turn: turn+1}
  // SAVE SHA256
  await firebase.fairness.update({next});
  return magic;
}

const revealFairWinner = async () => {
  let turnData = await wwb.currentTurnData();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  if (turnData.turn != currentSecret.turn) return console.error("[LOGIC]: We have overlapping turns. Make sure to reveal winner prior to launch next turn!");

  let currentFairness = await firebase.fairness.once('value').then(r=>r.val());

  console.log("[LOGIC]: Next conquerer on current turn is: " + turnData.next.o + " => " + utils.universalMap(turnData.next.o) + (turnData.battle ? (" and battle result is: " + turnData.battle.result ): ""));
  let previous = currentFairness.next;
  previous.magic = currentSecret.magic;
  previous.blockHash = currentSecret.magic;
  // COMPUTE RESULT
  [battle, next] = fairness.computeFairResult(previous.mapState, previous.magic, previous.blockHash)
  previous.battle = utils.universalMap(battle.o) + (battle.civilWar ? " rebelling on " : " vs " ) + utils.universalMap(battle.d) + " => " + (battle.result || "X")
  previous.next = utils.universalMap(next.o) + (next.civilWar ? " rebelling on " : " vs " ) + utils.universalMap(next.d)
  console.log("####################")
  console.log(previous.battle)
  console.log(previous.next)
  await firebase.fairness.update({previous});
}



///////////////////////////////////////////////////////////////////////////////////////
module.exports.simulateNextTurn = async () =>{
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: ********* Simulating next turn! *********");

  let nextTurnTime = new Date()
  nextTurnTime.setSeconds(nextTurnTime.getSeconds() + config.timing.turn - config.timing.spread);
  await firebase.data.update({ serverStatus: 200, turnTime: nextTurnTime.valueOf() });
  magic = await simulate();

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
  // let seed = currentSecret.seed;

  await stopBets(STOP_BET_DURATION);


  // GET CURRENT BET RATES AND MAP
  var cMap = await wwb.mapState();
  var go = await wwb.launchNextTurn(magic, magic);



  // GET WINNER AND UPDATES
  var td = await wwb.currentTurnData();

  // UPDATE HISTORY
  firebase.history.push().set(td);

  // REVEAL FAIRNESS
  await revealFairWinner();

  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //
  console.log("[SCHEDULER]: ********* Critical turn operations completed! *********");

  // STOP GAME BETS
  if (go) await stopGame();

  // COMMUNICATE WINNER
  telegram.notifyTelegramBot(cMap, td);

  console.log("[SCHEDULER]: ----- Running payouts! ------");
  // GET CURRENT TURN BETS

  // GET CHAIN ROUND
  var cr1 = await twb.cachedCurrentRound(1);
  var _betsNext = await firebase.bets.getCurrentTurnBets(1, cr1.round, td.turn);
  var cr2 = await twb.cachedCurrentRound(2);
  var _betsBattle = await firebase.bets.getCurrentTurnBets(2, cr2.round, td.turn);


  // PAYOUT
  let _winningBetsNext = td.next ? (await twb.dealerPayout(1, cr1.round, td.next.o, cMap[td.next.o].nextQuote, _betsNext)) : [];
  let _winningBetsBattle = td.battle ? (await twb.dealerPayout(2, cr2.round, td.battle.result, td.battle.quotes[td.battle.result], _betsBattle)) : [];
  // UPDATE RESULTS BET ON DB
  await updateResultsOnDB(_betsNext.concat(_betsBattle), _winningBetsNext.concat(_winningBetsBattle));
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
