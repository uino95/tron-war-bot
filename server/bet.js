const config = require('./config')
const wwb = require('./worldWarBot')
const tronWeb = require('tronweb')
const firebase = require('./firebase')
const db = firebase.db

var countriesMapRef = db.ref('countriesMap');

var turn, cMap;

const validateFullRunWinner = async (b) => {
  // @TODO: Add bet price formula
  if (!b || !b.amount) return false;
  if (!cMap ||turn!=wwb.currentTurn()) cMap = await countriesMapRef.once('value').then(r=>r.val());
  turn = wwb.currentTurn();
  var fixedAmount = config.test ? "1" : cMap[parseInt(b.userChoice)].finalQuote;
  return b.amount.toString() == tronWeb.toSun(fixedAmount);
}

const validateNextConquerer = async (b) => {
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
