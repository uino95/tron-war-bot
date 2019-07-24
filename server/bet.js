const config = require('./config')
const wwb = require('./worldWarBot')
const tronWeb = require('tronweb')


const validateFullRunWinner = (b) => {
  // @TODO: Add bet price formula
  if (!b || !b.amount) return false;
  var fixedAmount = config.test ? "1" : "50";
  return b.amount.toString() == tronWeb.toSun(fixedAmount);
}

const validateNextConquerer = (b) => {
  if (b.betReference.toString() != wwb.currentTurn.toString() ) return false;
  return true
}





const validate = (b) => {
  if (!b || !b.gameType) return false;
  if (b.gameType.toString() == "0") return validateFullRunWinner(b);
  if (b.gameType.toString() == "1") return validateNextConquerer(b);
  return false;
};

module.exports = {
  validate
}
