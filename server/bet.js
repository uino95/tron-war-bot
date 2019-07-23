const wwb = require('./worldWarBot')
const tronWeb = require('tronweb')


const validateFullRunWinner = (b) => {
  // @TODO: Add bet price formula
  return tronWeb.fromSun(b.amount.toString()) == '50';
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
