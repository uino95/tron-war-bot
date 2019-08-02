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

const toPercent = (n) =>(n * 100).toFixed(2) + "%"


async function notifyTelegramBot(d) {
  if (config.test) return;
  if (!config.telegram.token) return console.error("[TELEGRAM]: Bot token not configured.");

  var j = await twb.twb.jackpot(0).call();
  j = twb.tronWeb.fromSun(j.toString())

  let s = "🌎♟ <b>BATTLE " + d.turn + "</b>♟🌎\n"
  if (!d.civilWar) {
    s += "<b>⚔️💣 " + utils.universalMap(d.o) + " (" + toPercent(d.cohesion.o) + ")</b> conquered <b>" + utils.universalMap(d.dt) + " (" + toPercent(d.cohesion.dt) + ")</b> 💣⚔️\n";
    s += "<i>Previously owned by " + utils.universalMap(d.d) + " (" + toPercent(d.cohesion.d) + ")</i>\n\n"
  } else s += "⚒<b>" + utils.universalMap(d.o) + " (" + toPercent(d.cohesion.d) + ")</b> rebelled on the oppressor <b>" + utils.universalMap(d.d) + " (" + toPercent(d.cohesion.d) + ")</b>⚒"
  s += "Current jackpot on the full run: <b>" + j + " TRX</b>\n";
  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  let uri = "https://api.telegram.org/bot" + config.telegram.token + "/";
  uri += "sendMessage?chat_id=" + config.telegram.group;
  uri += "&parse_mode=HTML&reply_markup=" + encodeURIComponent(JSON.stringify(m));
  uri += "&disable_web_page_preview=true&text=" + encodeURIComponent(s);

  return await rp.get(uri).catch(console.error);
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
  var _bets = await firebase.bets.getCurrentRoundBets(0, cr.round);

  await twb.jackpotPayout(0, cr.round, winner, _bets);
  console.log("[GAME OVER]: The game is f***ing over... cit. Six Riddles");
}

const updateResultsOnDB = (_b, _wb) => {
  _wb = _wb.reduce((o,el)=>{o[el.txId]=el; return o;}, {})
  // Update the loser bets left
  _b.forEach(b =>{firebase.bets.child(b.txId).update({result: (_wb[b.txId] ? _wb[b.txId].win : 0)})})
}

const stopBets = async () => {
  if (wwb.winner()) return;
  // STOP BET BUTTON
  await firebase.data.update({serverStatus: 300})
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(config.test ? 5000 : 30000);
  //UPDATE TURN CURRENT WHICH PREVENTS BET SLIPPAGE
  wwb.updateTurn();
}

const simulateNextTurn = async () => {
  if (wwb.winner()) return;
  // CALCULATE MAGIC NUMBER AND SEED
  var magic = Math.random();
  var seed = utils.randomHex();
  // SAVE MAGIC NUMBER AND SEED
  await firebase.fairness.update({magic, seed});
  // SIMULATE TURN
  [ , turnData] = fairness.computeNextState(wwb.mapState(), magic, magic);
  // EVALUATE WINNER
  console.log("[SIMULATE]: Winner on next round is: " + turnData.o + " => " + utils.universalMap(turnData.o));
  // COMPUTE SHA256 (WINNER + SEED)
  console.log("Computing SHA256 of " + utils.universalMap(turnData.o) + seed);
  let magicHash = utils.sha256(utils.universalMap(turnData.o) + seed);
  // SAVE SHA256
  await firebase.data.update({magicHash});
}



///////////////////////////////////////////////////////////////////////////////////////

module.exports.launchNextTurn = async () =>{
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: Launching next turn!")

  await stopBets();

  // GET CURRENT BET RATES AND MAP
  var cMap = wwb.mapState();
  var go = await wwb.launchNextTurn();

  // STOP GAME BETS
  if (go) await stopGame();

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


  // **** PAYOUT FOR GAME 1 AGAINST DEALER **** //

  // GET CURRENT TURN BETS
  var _bets = await firebase.bets.getCurrentTurnBets(1, cr.round, data.turn);
  // COMMUNICATE WINNER
  notifyTelegramBot(data);

  // CAN PLACE BETS
  await firebase.data.update({ serverStatus: 200 });
  // PAYOUT
  const winningBets = await twb.housePayout(1, cr.round, data.o, _winner.nextQuote, _bets);
  // UPDATE RESULTS BET ON DB
  await updateResultsOnDB(_bets, winningBets);
  // PAYOUT FINAL
  if (go) gameOver();

  console.log("[SCHEDULER]: Next turn complete!");
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
      turn: turn
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
