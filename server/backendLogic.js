const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const fairness = require('./fairness')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const utils = require('./utils')

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toPercent = (n) =>(n * 100).toFixed(1) + "%"

const PROCESSING_TIME = config.test ? 5 : 10;
const STOP_BET_MARGIN = config.test ? 5 : 15;
const NET_TURN_DURATION = (config.timing.turn - (config.timing.blockConfirmation * 3) - PROCESSING_TIME - STOP_BET_MARGIN) * 1000;
const STOP_BET_DURATION = ((config.timing.blockConfirmation * 3) + STOP_BET_MARGIN)  * 1000;

console.log("[TIMING]: Net turn duration is: " + (NET_TURN_DURATION/1000) + "s");
console.log("[TIMING]: Stop bet duration is: " + (STOP_BET_DURATION/1000) + "s");

async function notifyTelegramBot(d) {
  if (config.test) return;
  if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured.");

  let s = "⚔️ <b>BATTLE " + d.turn + "</b>⚔️\n"
  let m = {}
  if (!d.civilWar) {
    s += "<b>🌎 " + utils.universalMap(d.o) + " (" + toPercent(d.cohesion.o) + ")</b> => <b>" + utils.universalMap(d.dt) + " (" + toPercent(d.cohesion.dt) + ")</b> 🌎\n";
    s += "<i>Previously: " + utils.universalMap(d.d) + " (" + toPercent(d.cohesion.d) + ")</i>"
  } else {
    s += "✨<b>" + utils.universalMap(d.o) + " (" + toPercent(d.cohesion.d) + ")</b> rebelled on  <b>" + utils.universalMap(d.d) + " (" + toPercent(d.cohesion.d) + ")</b>✨\n"
    s += "🍀 <b>Long live " + utils.universalMap(d.o) + "!! </b> 🍀"
  }
  let uri = "https://api.telegram.org/bot" + config.telegram.token + "/" + "sendMessage?chat_id=" + config.telegram.group + "&parse_mode=HTML&reply_markup=" + encodeURIComponent(JSON.stringify(m)) + "&disable_web_page_preview=true&text=" + encodeURIComponent(s);

  await rp.get(uri).catch(console.error);
  if (d.turn%10) return;

  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let leaderboard = wwb.leaderboard();
  let countriesStillAlive = wwb.countriesStillAlive();
  s = "⏱♟ <b>RUN UPDATE </b>♟⏱\n"
  s += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries alive!\n\n"
  s +="🎖🎖 <b>TOP 3 ARMIES</b> 🎖🎖\n"
  s += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+toPercent(leaderboard[0].cohesion)+"\n";
  s += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+toPercent(leaderboard[1].cohesion)+"\n";
  s += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+toPercent(leaderboard[2].cohesion)+"\n";
  s += "\nJackpot: <b>" + j + " TRX</b>\n\n";
  s += "Who will conquer the world?? <b>Do not miss out!</b>\n";
  s += "🎖👇👇👇👇👇👇👇🎖";

  m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};


  await sleep(20000);
  uri = "https://api.telegram.org/bot" + config.telegram.token + "/" + "sendMessage?chat_id=" + config.telegram.group + "&parse_mode=HTML&reply_markup=" + encodeURIComponent(JSON.stringify(m)) + "&disable_web_page_preview=true&text=" + encodeURIComponent(s);
  await rp.get(uri).catch(console.error);
}

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

const simulateNextTurn = async () => {
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

module.exports.launchNextTurn = async () =>{
  if (wwb.winner()) return;
  console.log("\n[SCHEDULER]: ********* Launching next turn! *********");

  // CAN PLACE BETS
  let nextTurnTime = (new Date()).valueOf() + NET_TURN_DURATION;
  await firebase.data.update({ serverStatus: 200, turnTime: nextTurnTime });

  [magic, seed] = await simulateNextTurn();

  await sleep(NET_TURN_DURATION);

  console.log("!!!!!! Declaring winner in seconds! DO NOT STOP SERVER NOW (please) !!!!!!!")
  // READY TO LAUNCH TURN
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
  console.log("[SCHEDULER]: ********* Critical turn operations completed! *********\n");

  // STOP GAME BETS
  if (go) await stopGame();

  // COMMUNICATE WINNER
  notifyTelegramBot(data);

  console.log("\n[SCHEDULER]: ----- Running payouts! ------");
  // GET CURRENT TURN BETS
  var _bets = await firebase.bets.getCurrentTurnBets(1, cr.round, data.turn);


  // PAYOUT
  const winningBets = await twb.housePayout(1, cr.round, data.o, _winner.nextQuote, _bets);
  // UPDATE RESULTS BET ON DB
  await updateResultsOnDB(_bets, winningBets);
  // PAYOUT FINAL
  if (go) gameOver();

  console.log("[SCHEDULER]: ----- Payout finished! ------\n");
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

module.exports.notifyTelegramBot = notifyTelegramBot;
