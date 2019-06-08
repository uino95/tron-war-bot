
const TronWeb = require('tronweb');
const TronGrid = require('trongrid');
const config = require('./config');

const tronWeb = new TronWeb({
  fullHost: config.tron.fullHost,
  privateKey: config.tron.privateKey
})
const tronGrid = new TronGrid(tronWeb);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.tronGrid = tronGrid;
module.exports.tronWeb = tronWeb;

var twb, war;

const createEventsFilter = function(c){
  return async function (opts){
    var filters = opts.filters || {};
    opts.filters = undefined;
    var r = await tronWeb.event.getEventsByContractAddress(c.address, opts);
    // console.log(r);
    return r.filter((v,idx,a)=>{
      var ok = true;
      for (var f of Object.keys(filters)){
        ok = ok && (filters[f].toString() == v.result[f].toString())
      }
      return ok
    }).map(r=>{return {...r, ...r.result}})
  }
}

module.exports.init = async function(){
  if (twb && war) return;
  twb = await tronWeb.contract().at(config.tron.tronWarBotAddress)
  war = await tronWeb.contract().at(config.tron.warCoinAddress)
  twb.getEvents = createEventsFilter(twb);
  war.getEvents = createEventsFilter(war);
  module.exports.twb = twb;
  module.exports.war = war;
}



module.exports.getCurrentRound = async function (gameType) {
  if (!twb || !war) await this.init();
  var stoppedAt, startedAt, startGame, endGame;

  var round = await twb.currentRound(gameType).call();
  var jackpot = await twb.jackpot(gameType).call();
  var startedAt = await twb.roundStartedAt(gameType).call();
  var stopped = startedAt.eq("0");
  var startGame = await twb.getEvents({
    onlyConfirmed:false,
    eventName: "StartGame",
    orderBy:"timestamp,desc",
    limit:200,
    filters:{
      round
    }
  }).then(r=>r[0]);
  if (!startGame) return {};
  if (stopped) endGame = await twb.getEvents({
    onlyConfirmed:false,
    eventName: "EndGame",
    orderBy:"timestamp,desc",
    limit:200,
    filters:{
      round
    }
  }).then(r=>r[0]);
  if (stopped && !endGame) throw "Sorry there is something wrong... probably TRON is a scam... Retry later!";
  if (endGame && endGame.round != startGame.round) throw "Something wrong with game rounds";
  return {
    round,
    initialJackpot:startGame.initialJackpot,
    availableJackpot:jackpot,
    finalJackpot:endGame ? endGame.finalJackpot : jackpot,
    stoppedAt: !stopped ? "" : {
      bn: endGame.block,
      ts:endGame.timestamp
    },
    startedAt: {
      bn: startGame.block,
      ts:startGame.timestamp
    },
  }
}

module.exports.startGame = async function (gameType) {
  if (!twb || !war) await this.init();
  var round = await this.getCurrentRound(gameType);
  if (!round.stoppedAt) throw "Game must be stopped before a new round can be started";
  let txId = await this.twb.startGame(gameType).send();
  await sleep(20000);
  let tx = await this.tronWeb.trx.getTransaction(txId)
  if (tx.ret[0].contractRet!="SUCCESS") throw tx;
  return round.round;
}

module.exports.endGame = async function (gameType) {
  if (!twb || !war) await this.init();
  var round = await this.getCurrentRound(gameType);
  if (!!round.stoppedAt) throw "Game must be started before it can be stopped";
  let txId = await this.twb.endGame(gameType,tronWeb.toSun(config.game.preservedJackpotRateForNextTurn)).send();
  await sleep(20000);
  let tx = await this.tronWeb.trx.getTransaction(txId)
  if (tx.ret[0].contractRet!="SUCCESS") throw tx;
  return round.round;
}


module.exports.watchEvents = async function (eventType, fn) {
  if (!twb || !war) await this.init();
  await this.twb[eventType]().watch(async function(e, r){
    if (e) return console.error(e);
    await fn(r);
  })
}

module.exports.availableJackpot = async function (gameType, gameRound) {
  if (!twb || !war) await this.init();
  let current = await this.getCurrentRound(gameType);
  if (!current.round) throw "Inexisting game type";
  if (parseInt(gameRound) > current.round.toNumber()) throw "Inexisting round for given game type";
  if (parseInt(gameRound) == current.round.toNumber()) {
    current.availableFunds = tronWeb.toBigNumber(0);
    current.houseEdge = tronWeb.toBigNumber(0);
    return current;
  }
  let roundFunds = await this.twb.roundFunds(gameType, gameRound).call()
  return roundFunds;
}

//1. GET ALL BETS
//2. COMPUTE WINNING AMOUNT
//3. GET AVAILABLE JACKPOT
//4. FOR EACH WINNING BET DIVIDE THE BET AMOUNT FOR THE WINNING AMOUNT
//5. MULTIPLIES FOR THE AVAILABLE JACKPOT
//6. PAYOUT LOOP
module.exports.payout = async function (gameType, gameRound, winningChoice) {
  if (!twb || !war) await this.init();
  let bets = await twb.getEvents({
    onlyConfirmed:true,
    eventName: "Bet",
    orderBy:"timestamp,desc",
    limit:200,
    filters:{
      gameType: gameType,
      round: gameRound
    }
  });
  // if (true) return bets;
  let winningBets = [];
  let winningAmount = tronWeb.toBigNumber(0);
  for (var b of bets) {
    if (b.userChoice.toString() == winningChoice.toString()) {
      winningAmount = winningAmount.plus(b.amount);
      winningBets.push(b);
    }
  }
  // if (true) {console.log(winningAmount.toString());return winningBets;}
  let a = await this.availableJackpot(gameType, gameRound);
  if (!a.finalJackpot.eq(a.availableFunds)) throw "Payout has already been paid";
  if (!winningBets.length) {
    let txId = await this.twb.payout(gameType, gameRound, this.twb.address, a.finalJackpot.toString()).send();
    await sleep(10000);
    let tx = await this.tronWeb.trx.getTransaction(txId);
    if (tx.ret[0].contractRet!="SUCCESS") {
      console.error("[PAYOUT ERROR]" +
        "\n\tNo winners at this turn. Funds did NOT return to the jackpot." +
        "\n\tPayout txId => " + txId )
      return false;
    }
    console.info("[PAYOUT EMPTY]" +
      "\n\tNo winners at this turn. Funds were returned to the jackpot." +
      "\n\tFunds returned => " +   a.finalJackpot.toString() + " SUN" +
      "\n\tPayout txId => " + txId  );
    return true;
  }
  for (var b of winningBets) {
    let txId, tx;
    let skip = false;
    let win = tronWeb.toBigNumber(b.amount).div(winningAmount).times(a.finalJackpot);
    let ca = await this.availableJackpot(gameType, gameRound);
    if (win.gt(ca.availableFunds)) {
      console.error("Funds are no longer available!");
      skip = true;
    }
    if (!skip) {
      txId = await this.twb.payout(gameType, gameRound, b.from, win.toString()).send();
      await sleep(10000);
      tx = await this.tronWeb.trx.getTransaction(txId)
      console.info("[PAYOUT SUCCESSFUL]" +
        "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
        "\n\tWinning Choice => " +  winningChoice.toString() +
        "\n\tBet txId => " + b.txId +
        "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + b.amount.toString() + " SUN" +
        "\n\tWin => " + win.toString() + " SUN" +
        "\n\tPayout txId => " + txId)
    }
    if (skip || tx.ret[0].contractRet!="SUCCESS")
      console.error("[PAYOUT ERROR] - PAYMENT TO USER HAS NOT GONE THROUGH!" +
        "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
        "\n\tWinning Choice => " +  winningChoice.toString() +
        "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + b.amount.toString() + " SUN" +
        "\n\tExpectedWin => " + win.toString() + " SUN" +
        "\n\tTxId => " + b.txId);
  }
  return true;

}

module.exports.startUp = async function(gameType){
  var l = await this.getCurrentRound(gameType);
  if (!l.stoppedAt) return;
  var r = await this.startGame(gameType);
}
