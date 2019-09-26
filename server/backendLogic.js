const rp = require('request-promise')
const firebase = require('./firebase')
const fairness = require('./fairness')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const referral = require('./referral')
const betValidator = require('./bet')
const social = require('./social')
const config = require('./config')
const utils = require('./utils')

console.log("[TIMING]: Stop bet duration is: " + (config.timing.txMargin) + "s");

const stopGame = async ()=>{
  await firebase.data.update({ serverStatus: 500 });
  await twb.endGame(0);
  await twb.endGame(1);
  await twb.endGame(2);
}

const gameOver = async () => {
  console.log("[SCHEDULER]: ********* Final payout! *********");
  var cr = await twb.cachedCurrentRound(0);
  var winner = wwb.winner();
  console.log("[LOGIC]: Sleeping one minute before automatic jackpot payout...");
  await utils.sleep(60000);
  // GET WINNING BETS
  let _bets = await firebase.bets.getCurrentRoundBets(0, cr.round);
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  await twb.jackpotPayout(0, cr.round, winner, _bets, j);
  console.log("[SCHEDULER]: ********* Final payout finished! *********");
  console.log("[GAME OVER]: The game is f***ing over... cit. Six Riddles");
}

const updateResultsOnDB = (_b, _wb) => {
  _wb = _wb.reduce((o,el)=>{o[el.txId]=el; return o;}, {})
  // Update the loser bets left
  _b.forEach(b =>{firebase.bets.child(b.txId).update({result: (_wb[b.txId] ? _wb[b.txId].win : 0)})})
}

const revealFairWinner = async (block) => {
  let turnData = await wwb.currentTurnData();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  if (turnData.turn != currentSecret.turn) return console.error("[LOGIC]: We have overlapping turns. Make sure to reveal winner prior to launch next turn!");
  let currentFairness = await firebase.fairness.once('value').then(r=>r.val());

  console.log("[LOGIC]: Next attacker is: " + turnData.next.o + " => " + utils.universalMap(turnData.next.o) + (turnData.battle ? (" and battle result is: " + (turnData.battle.result || "X") ): ""));
  let previous = currentFairness.next;
  previous.magic = currentSecret.magic;
  previous.blockHash = block.hash;
  // COMPUTE RESULT
  [battle, next] = fairness.computeFairResult(previous.mapState, previous.magic, previous.blockHash)
  if (battle) previous.battle = utils.universalMap(battle.o) + (battle.civilWar ? " rebelling on " : " vs " ) + utils.universalMap(battle.d) + " => " + (battle.result || "X")
  if (next) previous.next = utils.universalMap(next.o) + (next.civilWar ? " rebelling on " : " vs " ) + utils.universalMap(next.d)
  console.log("[FAIRNESS]: NEXT   -> "+  previous.next + "\n[FAIRNESS]: BATTLE -> " + previous.battle )
  await firebase.fairness.update({previous});
}



///////////////////////////////////////////////////////////////////////////////////////
const prepareNextTurn = async () =>{
  console.log("[SCHEDULER]: ********* Preparing next turn! *********");
  let cb = await twb.getBlock();
  // CALCULATE MAGIC NUMBER
  let turn = wwb.currentTurn();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  let magic = utils.randomHex();
  let nextTurnBlock = cb.number + Math.ceil(config.timing.turn/3);
  if (turn == currentSecret.turn) {
    magic = currentSecret.magic || magic;
    nextTurnBlock = currentSecret.block || nextTurnBlock;
  }
  // SAVE MAGIC NUMBER AND SEED
  else await firebase.secret.update({turn, magic, block: nextTurnBlock});
  // EVALUATE WINNER
  let magicHash = utils.sha256(magic);
  let mapState = await wwb.compressedState();
  let next = {mapState, magicHash, nextTurnBlock, turn}
  // SAVE SHA256
  await firebase.fairness.update({next});

  let stopBetsBlock = nextTurnBlock - Math.ceil(config.timing.txMargin/3);
  let ts = cb.timestamp + ((stopBetsBlock - cb.number) * 3000);
  let nextTurnTime = new Date(ts);
  cb = await twb.getBlock();
  console.log("[PREPARE]: Current block is: " + cb.number + "  nextTurn at: " + nextTurnBlock + " stopBets at: " + stopBetsBlock);
  if (cb.number < stopBetsBlock) {
    await firebase.data.update({ serverStatus: 200, turnTime: nextTurnTime.valueOf() });
    twb.onBlock(stopBetsBlock, stopBets);
    twb.onBlock(nextTurnBlock, launchNextTurn);
  }
  else if (cb.number < nextTurnBlock) {
    console.warn("[PREPARE]: BEYOND STOP BET BLOCK!");
    let b = await twb.getBlock(stopBetsBlock);
    await stopBets(b);
    twb.onBlock(nextTurnBlock, launchNextTurn);
  }
  else {
    console.warn("[PREPARE]: BEYOND NEXT TURN BLOCK! Launching right away...");
    let b = await twb.getBlock(nextTurnBlock);
    launchNextTurn(b);
  }
  console.log("[SCHEDULER]: ********* Preparing next turn finished! *********");
}

const stopBets = async (block) => {
  // STOP BET BUTTON
  console.log("[STOP BETS]: Stopping bets... Block: " + block.number )
  await firebase.data.update({serverStatus: 300})
}

const launchNextTurn = async (block) =>{
  console.log("[SCHEDULER]: ********* Next turn! Block: " + block.number + " *********");
  let turn = wwb.currentTurn();
  let currentSecret = await firebase.secret.once('value').then(r=>r.val());
  if (turn != currentSecret.turn) return console.error("[LOGIC] Need to prepare turn before updating. Wait for next one.");
  let magic = currentSecret.magic;
  wwb.preTurn();

  // GET CURRENT BET RATES AND MAP
  var cMap = await wwb.mapState();
  var go = await wwb.launchNextTurn(magic, block.hash);

  // GET WINNER AND UPDATES
  var td = await wwb.currentTurnData();

  // UPDATE HISTORY
  firebase.history.push().set(td);

  // REVEAL FAIRNESS
  await revealFairWinner(block);

  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //
  console.log("[SCHEDULER]: ********* Next turn finished! *********");

  console.log("[SCHEDULER]: ----- Payouts! ------");
  // STOP GAME BETS
  if (go) await stopGame();


  // GET TURN BETS
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
  console.log("[SCHEDULER]: ----- Payout finished! ------");
  if (go) return await gameOver();
  prepareNextTurn();
}


module.exports.start = async () =>{
  await wwb.init(config.wwb.restart);
  if (wwb.winner()) return;
  prepareNextTurn();
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
    console.info("[BET]: Successfully registered bet in tx " + r.transaction + " at " + betTime)
  });
}
