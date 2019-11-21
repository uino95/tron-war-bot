const config = require('./config')
const wwb = require('./worldWarBot')
const firebase = require('./firebase')
const twb = require('./tronWarBot')
const referral = require('./referral')
const stats = require('./stats')

var turn, cMap;

const validateFullRunWinner = async (b) => {
  if (!b || !b.amount) return false;
  cMap = await wwb.mapState();
  turn = wwb.currentTurn();
  var fixedAmount = config.test ? "1" : cMap[parseInt(b.userChoice)].finalQuote;
  return b.amount.toString() == twb.tronWeb.toSun(fixedAmount);
}

const validateNextConquerer = async (b) => {
  if (b.betReference.toString() != wwb.currentTurn().toString() ) return false;
  return true
}

const validateBetBattle = async (b) => {
  if (b.betReference.toString() != wwb.currentTurn().toString() ) return false;
  return true
}

const validate = (b) => {
  if (!b || !b.gameType) return false;
  if (b.gameType.toString() == "0") return validateFullRunWinner(b);
  if (b.gameType.toString() == "1") return validateNextConquerer(b);
  if (b.gameType.toString() == "2") return validateBetBattle(b);
  return false;
};


// Watch new bets
const watchBets =  () => {
  console.log("[BET]: Watching user bets...")
  return twb.watchEvents('Bet', async function (r) {
    let bet = r.result
    if (!(await validate(bet)))
      return console.error("[INVALID_BET]: Received an invalid bet for gameType: " + bet.gameType.toString() +
        "\n\tof amount: " + twb.tronWeb.fromSun(bet.amount.toString()) +
        "\n\tby: " + bet.from.toString() +
        "\n\twith user choice: " + bet.userChoice.toString() +
        "\n\tbetReference: " + bet.betReference.toString());
    let isBetAlreadyOnDb = await firebase.bets.checkBetOnDb(r.transaction);
    if (!!isBetAlreadyOnDb) return console.error("[BET]: Bet " + r.transaction + " is already on DB");
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
    await firebase.bets.child(r.transaction).set(betObj);
    referral.updateReferral(betObj);
    stats.updateSpender(betObj);
    // if (bet.gameType.toString() == "0") {
    //   let jackpot = await twb.availableJackpot(0, bet.round);
    //   jackpot = twb.tronWeb.fromSun(jackpot.availableJackpot.toString())
    //   firebase.data.update({ jackpot })
    //   console.info("Jackpot is: ", jackpot)
    // }
    console.info("[BET]: Successfully registered bet in tx " + r.transaction + " at " + betTime)
  });
}

module.exports = {
  validate,
  watchBets
}
