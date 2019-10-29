var admin = require('firebase-admin');
var config = require('./config');

if(config.test){
    admin.initializeApp({
        credential: admin.credential.cert(config.firebaseTest),
        databaseURL: 'https://tron-war-bot-test.firebaseio.com/'
    });
    console.log("TEST MODE")
} else {
    admin.initializeApp({
        credential: admin.credential.cert(config.firebase),
        databaseURL: 'https://tron-war-bot.firebaseio.com'
    });
}
const db = admin.database();

const out = {
	db: db,
  secret: db.ref('secret'),
  history : db.ref('public/history'),
  bets : db.ref('public/bets'),
  data : db.ref('public/data'),
  fairness : db.ref('public/fairness'),
  cohesion : db.ref('public/cohesion'),
  referral: db.ref('public/referral'),
  countriesMap : db.ref('public/countriesMap'),
  timelapseMap : db.ref('public/timelapseMap')
}


out.bets.checkBetOnDb = async (txId) => out.bets.once('value').then((r) => r.child(txId).exists());

out.bets.getCurrentTurnBets = async (gameType, round, turn) => {
  var snapshot, bets = []
  await out.bets.orderByChild("gameType").equalTo(gameType.toString()).once("value")
    .then(r => {
      snapshot = r.val();
      if (!snapshot) return [];
      r = Object.keys(snapshot);
      return r.forEach(key => {
        if (round && snapshot[key].round.toString() != round.toString()) return;
        if (turn && snapshot[key].betReference.toString() != turn.toString()) return;
        snapshot[key].txId = key
        bets.push(snapshot[key])
      })
    })
  return bets;
}

out.bets.getCurrentRoundBets = async (gameType, round) => {
  var snapshot, bets = []
  await out.bets.orderByChild("gameType").equalTo(gameType.toString()).once("value")
    .then(r => {
      snapshot = r.val()
      r = Object.keys(snapshot);
      return r.forEach(key => {
        if (round && snapshot[key].round.toString() != round.toString()) return;
        snapshot[key].txId = key
        bets.push(snapshot[key])
      })
    })
  console.log(bets)
  return bets;
}

out.reset = async () => {
  await out.data.set({})
  await out.secret.set({})
  await out.fairness.set({})
  await out.countriesMap.set({})
  await out.cohesion.set({})
  await out.history.set([])
}

module.exports = out;
