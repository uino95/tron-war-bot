
const TronWeb = require('tronweb');
const TronGrid = require('trongrid');
const config = require('./config');
const telegram = require('./utils/telegram')
const utils = require('./utils');
const BLOCK_CONFIRMATION = config.timing.blockConfirmation;

const tronWeb = new TronWeb({
  fullHost: config.tron.fullHost,
  privateKey: config.tron.privateKey
})

var twb, war;
var ready = false;
const block = {number:0, hash:'', timestamp: 0};
const blockQueue = {};
const cacheRounds = {};

module.exports.tronWeb = tronWeb;

const isReady = async ()=>{
  if (ready) return;
  while (!ready) {console.log("[TWB]: Not ready yet..."); await utils.sleep(1000);}
  return;
}

const startup = async  () => {
  let cycle = async ()=>{
    try {
      let cb = await tronWeb.trx.getCurrentBlock();
      let currentBlock = cb.block_header.raw_data.number - BLOCK_CONFIRMATION;
      block.number = block.number || currentBlock;
      if (currentBlock < (block.number + 1)) return; //Skip this interval
      if (currentBlock > (block.number + 1)) currentBlock = block.number + 1;
      let b = await tronWeb.trx.getBlock(currentBlock)
      block.number = b.block_header.raw_data.number;
      block.hash = b.blockID;
      block.timestamp = b.block_header.raw_data.timestamp;
    } catch (err) { return }
    let awakeFn = blockQueue[block.number.toString()] || [];
    awakeFn = awakeFn.concat(blockQueue["0"] || []);
    awakeFn.forEach((fn)=>{
      try { if(fn) fn(JSON.parse(JSON.stringify(block))); }
      catch (e) {console.error(e)}
    });
    delete blockQueue[block.number.toString()];
  }
  await cycle();
  setInterval(cycle, 2500);
}

const onBlock = (bn, fn)=>{
  if (!bn) throw "Missing callback or block number";
  if (!fn && typeof bn != "function") throw "Missing callback or block number";
  if (fn && !parseInt(bn)) throw "Invalid parameter";
  if (fn && typeof fn != "function") throw "Missing callback";
  if (typeof bn == "function") {fn = bn; bn = 0;}
  bn = parseInt(bn);
  if (bn!=0 && bn < block.number) return;
  if (bn!=0 && bn == block.number) {
    try { return fn(JSON.parse(JSON.stringify(block))); }
    catch (e) {console.error(e)};
  }
  blockQueue[bn.toString()] = blockQueue[bn.toString()] || [];
  let idx = blockQueue[bn.toString()].push(fn);
  return {
    stop:()=>{ blockQueue[bn.toString()][idx] = undefined; }
  };
}
module.exports.onBlock = onBlock;

const createEventsFilter = function(c){
  const retrieveEvents = async function (opts = {}, retry=0){
    opts.filters = opts.filters || {};
    for (var f of Object.keys(opts.filters)) opts.filters[f]=opts.filters[f].toString();
    try {
      var r = await tronWeb.event.getEventsByContractAddress(c.address, opts);
      return r.map(r=>{return {...r, ...r.result}});
    } catch (e) {
      if (retry>3) throw e;
      return retrieveEvents(opts, (retry+1))
    }
  }
  return retrieveEvents;
}

const createWatchEvents = function(c){
  return  (opts={}, fn)=>{
    if(typeof opts == "string") opts = { eventName : opts};
    if(!fn || (typeof fn != "function")) throw "Invalid callback function";
    return onBlock(async (b)=>{
      var events;
      opts.onlyConfirmed=false;
      opts.orderBy="timestamp,desc";
      opts.blockNumber=b.number;
      opts.limit=200;
      try {
        events = await twb.getEvents(opts);
      } catch (err) {
        return console.error(err);
      }
      for (var e of events) await fn(e);
    })
  }
}

module.exports.init = async () => {
  if (twb && war) return;
  if (config.test) console.log("[TWB]: Using Test contracts");
  console.log("[TWB]: Using WarCoin Contract at: " + config.tron.warCoinAddress);
  console.log("[TWB]: Using TronWarBot Contract at: " + config.tron.tronWarBotAddress);
  twb = await tronWeb.contract().at(config.tron.tronWarBotAddress);
  war = await tronWeb.contract().at(config.tron.warCoinAddress);
  twb.getEvents = createEventsFilter(twb);
  twb.watchEvents = createWatchEvents(twb);
  war.getEvents = createEventsFilter(war);
  war.watchEvents = createWatchEvents(war);
  module.exports.twb = twb;
  module.exports.war = war;
  await startup();
  ready = true;
}

module.exports.getBlock = async (bn) => {
  if (!twb || !war) await isReady();
  if (!bn || !parseInt(bn)) return JSON.parse(JSON.stringify(block));
  let b = await tronWeb.trx.getBlock(bn);
  return {
    number : b.block_header.raw_data.number,
    hash : b.blockID,
    timestamp : b.block_header.raw_data.timestamp
  }
}


module.exports.getCurrentRound = async function (gameType) {
  try {
    if (!twb || !war) await isReady();
    var stoppedAt, startedAt, startGame, endGame = {};
    var round = await twb.currentRound(gameType).call();
    var jackpot = await twb.jackpot(gameType).call();
    var houseReserves = await twb.houseReserves().call();
    var roundFunds = await twb.roundFunds(gameType,round).call();
    var startedAt = await twb.roundStartedAt(gameType).call();
    var stopped = startedAt.eq("0");
    var startGame = await twb.getEvents({
      onlyConfirmed:false,
      eventName: "StartGame",
      orderBy:"timestamp,desc",
      limit:200,
      filters:{
        gameType,
        round
      }
    }).then(r=>r.length ? r[0] : {});
    if (stopped) endGame = await twb.getEvents({
      onlyConfirmed:false,
      eventName: "EndGame",
      orderBy:"timestamp,desc",
      limit:200,
      filters:{
        gameType,
        round
      }
    }).then(r=>r.length ? r[0] : {});
    var availableJackpot = stopped ? roundFunds.finalJackpot : jackpot;
    var availableFunds = roundFunds.playAgainstDealer ? houseReserves : roundFunds.availableFunds;
    var houseEdge = roundFunds.houseEdge;
    return {
      round,
      playAgainstDealer: roundFunds.playAgainstDealer,
      finalJackpot: roundFunds.finalJackpot,
      availableJackpot,
      availableFunds,
      houseEdge,
      houseReserves,
      stoppedAt: stopped ? (endGame.block || true) : false,
      startedAt,
    }
  } catch (e) { return this.getCurrentRound(gameType)}
}

module.exports.startGame = async function (gameType, playAgainstDealer) {
  if (!twb || !war) await isReady();
  var round = await this.getCurrentRound(gameType);
  if (!round.stoppedAt) throw "Game must be stopped before a new round can be started";
  let txId = await this.twb.startGame(gameType, !!playAgainstDealer).send().catch(console.error);
  await utils.sleep(10000);
  let tx = await this.tronWeb.trx.getTransaction(txId).catch(console.error)
  if (!tx || tx.ret[0].contractRet!="SUCCESS") throw tx;
  return round.round;
}

module.exports.endGame = async function (gameType) {
  if (!twb || !war) await isReady();
  var round = await this.getCurrentRound(gameType);
  if (!!round.stoppedAt) throw "Game must be started before it can be stopped";
  let txId = await this.twb.endGame(gameType,tronWeb.toSun(config.game.preservedJackpotRateForNextTurn)).send().catch(console.error);
  await utils.sleep(10000);
  let tx = await this.tronWeb.trx.getTransaction(txId).catch(console.error)
  if (!tx || tx.ret[0].contractRet!="SUCCESS") throw tx;
  return round.round;
}

module.exports.watchEvents = async function (opts, fn=false) {
  if (!twb || !war) await isReady();
  return this.twb.watchEvents(opts,fn);
}

module.exports.availableJackpot = async function (gameType, gameRound) {
  if (!twb || !war) await isReady();
  let current = await this.getCurrentRound(gameType);
  if (!current.round || !current.round.toNumber()) throw "Inexisting game type";
  if (parseInt(gameRound) > current.round.toNumber()) throw "Inexisting round for given game type";
  try {
    if (parseInt(gameRound) == current.round.toNumber()) return current;
    let roundFunds = await this.twb.roundFunds(gameType, gameRound).call()
    let houseReserves = await this.twb.houseReserves().call();
    roundFunds.houseReserves = houseReserves;
    return roundFunds;
  } catch (e) {return this.availableJackpot(gameType, gameRound)}
}

module.exports.jackpot = async ()=> {
  let j = await this.getCurrentRound(0);
  return tronWeb.fromSun((j.availableJackpot || 0).toString());
}

//1. GET ALL BETS
//2. COMPUTE WINNING AMOUNT
//3. GET AVAILABLE JACKPOT
//4. FOR EACH WINNING BET DIVIDE THE BET AMOUNT FOR THE WINNING AMOUNT
//5. MULTIPLIES FOR THE AVAILABLE JACKPOT
//6. PAYOUT LOOP
module.exports.jackpotPayout = async function (gameType, gameRound, winningChoice, _bets=[]) {
  if (!twb || !war) await isReady();
  let bets = _bets;
  // let bets = await twb.getEvents({
  //   onlyConfirmed:true,
  //   eventName: "Bet",
  //   orderBy:"timestamp,desc",
  //   limit:200,
  //   filters:{
  //     gameType: gameType,
  //     round: gameRound
  //   }
  // });
  // if (true) return bets;
  let winningBets = [];
  let winningAmount = tronWeb.toBigNumber(0);
  let winners = 0;
  for (var b of bets) {
    if (b.userChoice.toString() == winningChoice.toString()) {
      winningAmount = winningAmount.plus(b.amount);
      winners = winners + 1;
      winningBets.push(b);
    }
  }
  // if (true) {console.log(winningAmount.toString());return winningBets;}
  let a = await this.availableJackpot(gameType, gameRound);
  if (a.playAgainstDealer) throw "This is not a jackpot payout type of game! Use house payout instead.";
  if (!a.finalJackpot.eq(a.availableFunds)) throw "Payout has already been paid";
  if (!winningBets.length) {
    let txId = await this.twb.payout(gameType, gameRound, this.twb.address, a.finalJackpot.toString()).send().catch(console.error);
    await utils.sleep(10000);
    let tx = await this.tronWeb.trx.getTransaction(txId).catch(console.error);
    if (!txId || !tx || tx.ret[0].contractRet!="SUCCESS") {
      console.error("[PAYOUT ERROR]" +
        "\n\tNo winners at this turn. Funds did NOT return to the jackpot." +
        "\n\tPayout txId => " + txId )
      return winningBets;
    }
    console.info("[PAYOUT EMPTY]" +
      "\n\tNo winners at this turn. Funds were returned to the jackpot." +
      "\n\tFunds returned => " +   tronWeb.fromSun(a.finalJackpot.toString()) + " TRX" +
      "\n\tPayout txId => " + txId  );
    return winningBets;
  }
  for (var b of winningBets) {
    let txId, tx;
    let skip = false;
    let j = a.finalJackpot;
    // let win = tronWeb.toBigNumber(b.amount).div(winningAmount).times(j).integerValue(1); // IF bet is weighted based on the bet amount
    let win = tronWeb.toBigNumber(1).div(winners).times(j).integerValue(1);         // If 1 bet weights 1 regardless of bet amount
    b.win = win;
    let ca = await this.availableJackpot(gameType, gameRound);
    if (win.gt(ca.availableFunds)) {
      console.error("Funds are no longer available!");
      skip = true;
    }
    if (!skip && win.gt("0")) txId = await this.twb.payout(gameType, gameRound, b.from, win.toString()).send().catch(console.error);
    if (txId){
      await utils.sleep(10000);
      tx = await this.tronWeb.trx.getTransaction(txId).catch(console.error)
    }
    if (tx && tx.ret[0].contractRet=="SUCCESS"){
        console.info("[PAYOUT SUCCESSFUL]" +
            "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
            "\n\tWinning Choice => " +  winningChoice.toString() +
            "\n\tBet txId => " + b.txId +
            "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + tronWeb.fromSun(b.amount.toString()) + " TRX" +
            "\n\tWin => " + tronWeb.fromSun(win.toString()) + " TRX" +
            "\n\tPayout txId => " + txId)
        continue;
    }
    let errMsg = "[PAYOUT ERROR] - PAYMENT TO USER POSSIBLY GONE THROUGH!" +
      "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
      "\n\tWinning Choice => " +  winningChoice.toString() +
      "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + tronWeb.fromSun(b.amount.toString()) + " TRX" +
      "\n\tExpectedWin => " + tronWeb.fromSun(win.toString()) + " TRX" +
      "\n\tTxId => " + b.txId +
      "\n\tPayout attempt Tx => " + txId;
    console.error(errMsg);
    telegram.sendMessage(config.telegram.adminGroup, errMsg, {parse_mode: "HTML"});
  }
  return winningBets;

}

module.exports.dealerPayout = async function (gameType, gameRound, winningChoice, winRate, _bets = []) {
  if (!twb || !war) await isReady();
  let bets = _bets;
  // let bets = await twb.getEvents({
  //   onlyConfirmed:true,
  //   eventName: "Bet",
  //   orderBy:"timestamp,desc",
  //   limit:200,
  //   filters:{
  //     gameType: gameType,
  //     round: gameRound
  //   }
  // });
  let a = await this.availableJackpot(gameType, gameRound);
  if (!a.playAgainstDealer) throw "This is not a dealer payout type of game! Use a jackpot payout instead.";
  // if (true) return bets;
  let winningBets = [];
  let winningAmount = tronWeb.toBigNumber(0);
  let winners = 0;
  for (var b of bets) {
    if (b.userChoice.toString() == winningChoice.toString()) {
      winningAmount = winningAmount.plus(b.amount);
      winners = winners + 1;
      winningBets.push(b);
    }
  }
  // if (true) {console.log(winningAmount.toString());return winningBets;}

  if (!winningBets.length) {
    console.info("[PAYOUT EMPTY]" +
      "\n\tNo winners at this turn." +
      "\n\tTotal collected funds for this turn => " + tronWeb.fromSun(a.finalJackpot.toString()) + " TRX" +
      "\n\tCurrent house reserves => " +    tronWeb.fromSun(a.houseReserves.toString()) + " TRX" );
    return winningBets;
  }
  for (var b of winningBets) {
    let txId, tx;
    let skip = false;
    let win = tronWeb.toBigNumber(b.amount).times(winRate).integerValue(1); // Bet against the dealer
    b.win = win;
    let ca = await this.availableJackpot(gameType, gameRound);
    if (win.gt(ca.houseReserves)) {
      console.error("Funds are no longer available!");
      skip = true;
    }
    if (!skip && win.gt("0")) txId = await this.twb.payout(gameType, gameRound, b.from, win.toString()).send().catch(console.error);
    if (txId) {
      await utils.sleep(10000);
      tx = await this.tronWeb.trx.getTransaction(txId).catch(console.error)
    }
    if (tx && tx.ret[0].contractRet=="SUCCESS"){
      console.info("[PAYOUT SUCCESSFUL]" +
      "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
      "\n\tWinning Choice => " +  winningChoice.toString() +
      "\n\tBet txId => " + b.txId +
      "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + tronWeb.fromSun(b.amount.toString()) + " TRX" +
      "\n\tWin => " + tronWeb.fromSun(win.toString()) + " TRX" +
      "\n\tPayout txId => " + txId)
      continue;
    }
    let errMsg = "[PAYOUT ERROR] - PAYMENT TO USER POSSIBLY GONE WRONG!" +
      "\n\tGame => " + gameType.toString() + " Round: " + gameRound.toString() +
      "\n\tWinning Choice => " +  winningChoice.toString() +
      "\n\tBet => user: " + b.from  + " userChoice: " + b.userChoice.toString() + " amount: " + tronWeb.fromSun(b.amount.toString()) + " TRX" +
      "\n\tExpectedWin => " + tronWeb.fromSun(win.toString()) + " TRX" +
      "\n\tBet TxId => " + b.txId +
      "\n\tPayout attempt Tx => " + txId;
    console.error(errMsg);
    telegram.sendMessage(config.telegram.adminGroup, errMsg, {parse_mode: "HTML"});
  }
  return winningBets;
}


module.exports.cachedCurrentRound = async (gameType) => {
  let g = gameType.toString();
  if (cacheRounds[g]) return cacheRounds[g]
  cacheRounds[g] = await this.getCurrentRound(gameType);
  return cacheRounds[g];
}

module.exports.launchGame = async (gameType, playAgainstDealer) => {
  if (!twb || !war) await isReady();
  var l = await this.getCurrentRound(gameType);
  if (!l.stoppedAt) return console.log("[TWB]: START-UP completed. Game already started!");
  console.log("[TWB]: Starting game: " + gameType + " with dealer mode: " + playAgainstDealer );
  var r = await this.startGame(gameType, playAgainstDealer);
  console.log("[TWB]: START-UP completed")
}
