const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Bet = new Schema({
  address: {
    type: String
  },
  amount: {
    type: Number
  },
  country: {
    type: String
  }
});

var RunTurn = new Schema({
  conqueror: {
    type: String
  },
  conquered: {
    type: String
  },
  id: {
    type: Number
  }
});

var Run = new Schema({
  id: Number,
  initialCountries: [String],
  currentState: {
    remainingCountries: [{
      name: String,
      territoriesOwned: Number,
      totalBetsPlaced: Number
    }]
  },
  turnsHistory: [RunTurn]
});

var TurnBettingGame = new Schema({

});

module.exports.Bet = mongoose.model('Bet', Bet);
module.exports.RunTurn = mongoose.model('RunTurn', RunTurn);
module.exports.Run = mongoose.model('Run', Run);
// module.exports = mongoose.model('Bet', Bet);
