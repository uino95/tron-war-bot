const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Bet = new Schema({
  address: {
    type: String
  },
  amount: {
    type: Number
  },
  state: {
    type: [String]
  }
});

module.exports = mongoose.model('Bet', Bet);
