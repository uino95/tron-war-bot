const config = require('./config')
const wwb = require('./worldWarBot')
const tronWeb = require('tronweb')


const validateFullRunWinner = (b) => {
  // @TODO: Add bet price formula
<<<<<<< HEAD
  return tronWeb.fromSun(b.amount.toString()) == '1';
=======
  if (!b || !b.amount) return false;
  var fixedAmount = config.test ? "1" : "50";
  return b.amount.eq(tronWeb.toSun(fixedAmount));
>>>>>>> 9fedb12d8d40bb431267e922a86d946a0eb32e2f
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
