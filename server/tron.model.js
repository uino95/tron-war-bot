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
  },
  time: {
    type: Date,
    default: Date.now
  },
  forTurn: {
    type: Number
  },
  forRun: {
    type: Number
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
  },
  runID: {
    type: Number
  }
});

var Run = new Schema({
  id: Number,
  initialCountries: [String],
  currentState: {
    remainingCountries: [{
      name: String,
      territoriesOwned: Number
    }],
    latestTurn: Number
  },
  turnsHistory: [RunTurn]
});

module.exports.Bet = mongoose.model('Bet', Bet);
module.exports.RunTurn = mongoose.model('RunTurn', RunTurn);
module.exports.Run = mongoose.model('Run', Run);
