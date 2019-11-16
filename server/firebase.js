var admin = require('firebase-admin');
var config = require('./config');

if(config.test){
    admin.initializeApp({
        credential: admin.credential.cert(config.firebaseTest),
        databaseURL: 'https://twb-backup-de2e5.firebaseio.com/'
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


out.bets.checkBetOnDb = async (txId) => out.bets.orderByKey().equalTo(txId).once('value').then((r) => r ? r.val() : false);

out.bets.getCurrentTurnBets = async (gameType, round, turn) => {
  var snapshot, bets = [];
  var order = {by:"gameType", value:gameType};
  if (round) order = {by:"round", value:round};
  if (turn) order = {by:"betReference", value:turn};
  await out.bets.orderByChild(order.by).equalTo(order.value.toString()).once("value")
    .then(r => {
      snapshot = r.val();
      if (!snapshot) return [];
      r = Object.keys(snapshot);
      return r.forEach(key => {
        if (gameType && snapshot[key].gameType.toString() != gameType.toString()) return;
        if (round && snapshot[key].round.toString() != round.toString()) return;
        if (turn && snapshot[key].betReference.toString() != turn.toString()) return;
        snapshot[key].txId = key
        bets.push(snapshot[key])
      })
    })
  return bets;
}


out.reset = async () => {
  await out.data.set({})
  await out.secret.set({})
  await out.fairness.set({})
  await out.referral.set({map:{},percentages:{}})
  await out.countriesMap.set({})
  await out.cohesion.set({})
  await out.history.set([])
}

module.exports = out;
