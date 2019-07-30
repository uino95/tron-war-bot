const config = require('./config')
const wwb = require('./worldWarBot')
const tronWeb = require('tronweb')
const firebase = require('./firebase')
const db = firebase.db

var countriesMapRef = db.ref('countriesMap');

var turn, cMap;

const validateFullRunWinner = async (b) => {
  if (!b || !b.amount) return false;
  cMap = wwb.mapState();
  turn = wwb.currentTurn();
  var fixedAmount = config.test ? "1" : cMap[parseInt(b.userChoice)].finalQuote;
  return b.amount.toString() == tronWeb.toSun(fixedAmount);
}

const validateNextConquerer = async (b) => {
  console.log(wwb.currentTurn().toString())
  console.log(b.betReference.toString())
  if (b.betReference.toString() != wwb.currentTurn().toString() ) return false;
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
