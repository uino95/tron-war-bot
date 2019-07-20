const config = require('./config');
const cron = require("node-cron");
const TronWeb = require('tronweb');
const wwb = require("./worldWarBotApi");

if (!process.env.FAKE_BOTS) return;
const pks = process.env.FAKE_BOTS.split(",");
console.log("[BOT]: Using " + pks.length + " fake bots!")

module.exports.bots = []

async function init(){
  if (module.exports.bots.length) return;
  for (var i in pks){
    let pk = pks[i];
    const tronWeb = new TronWeb({
      fullHost: config.tron.fullHost,
      privateKey: pk
    });
    var address = await tronWeb.trx.getAccount().then(r=>r.address);
    if (!address) {
      console.error("Invalid configuration for bot " + i + ". Skipping...");
      continue;
    }
    if(config.test){
      const twb = await tronWeb.contract().at(config.tronTest.tronWarBotAddress)
    } else {
      const twb = await tronWeb.contract().at(config.tron.tronWarBotAddress)
    }
    module.exports.bots.push({tronWeb, twb});
  }
}


module.exports.scheduleFakeBots = async function() {
  if (!module.exports.bots.length) await init();
  console.info("[BOT]: Scheduling bots bets...")
  var countryOptions = await wwb.countriesStillAlive();
  if (!countryOptions.length) return;
  for (var i in module.exports.bots){
    var b = module.exports.bots[i];
    var balance = await b.tronWeb.trx.getBalance().then(r=>b.tronWeb.toBigNumber(r));
    var address = b.tronWeb.defaultAddress.base58;
    var minimumBet = await b.twb.gameParams(0).call().then(r=>b.tronWeb.toBigNumber(r.minimumBet));
    if (!balance || balance.times("0.98").lt(minimumBet)) {
      console.info("[BOT]: Insufficient balance for bot with address " + address + " . Skipping...");
      continue;
    }
    // var startIn = 1500;
    var startIn = Math.random() * 2400000; //Random in 40 minutes time
    console.info("[BOT]: Bot " + address +  " betting in " + Math.floor(startIn/60000) + " minutes");
    setTimeout(module.exports.generateFakeBotBet(b, countryOptions, minimumBet) , startIn);
  }
}

module.exports.generateFakeBotBet = (b, countryOptions, minimumBet)=>{
  return async function(){
    //Bot logic
    var address = b.tronWeb.defaultAddress.base58;
    if (!address) return console.error("Bot is not configured properly! Skipping...");
    let startAt = await b.twb.roundStartedAt(0).call();
    if(startAt.eq("0")) return;
    let rand = Math.random() * countryOptions.length;
    let userChoice = countryOptions[Math.floor(rand)];
    b.twb.bet(0,userChoice).send({callValue: minimumBet});
    console.info("[BOT]: Bot " + address + " betting on " + userChoice)
  }
}


cron.schedule("1 20 * * * *", module.exports.scheduleFakeBots)
