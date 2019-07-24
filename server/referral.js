const firebase = require('./firebase')
const twb = require('./tronWarBot')
const db = firebase.db


const utils = require("./utils");

/////////////////////////////////////////////// DB SETTING ////////////////////////////////////////////

var referralRef = db.ref('referral')
var betsRef = db.ref('bets')

// ///////////////////////////////////////////// DB USAGE /////////////////////////////////////////////

// async function isPremiumAddress(referrer_addr){
//   return new Promise(async function(resolve, reject) {
//     referralRef.child('premium_addrs').once('value', function(snapshot){
//       resolve(snapshot.child(referrer_addr).exists())
//     })
//   })
// }

const getReferralPercentage = async (referrer_addr) => {
  let snapshot = await referralRef.child('percentages').orderByKey().equalTo(referrer_addr).once('value')
  if(snapshot.val() !== null){
    return snapshot.val()[referrer_addr]
  }
  snapshot = await referralRef.child('percentages').orderByKey().equalTo('default').once('value')
  return snapshot.val().default
}

const checkBetOnDb = async (txId) => {
  console.log("[REFERRAL]: Checking tx with id: " + txId);
  return new Promise(async function(resolve, reject) {
    betsRef.once('value', function(snapshot){
      if(!snapshot.child(txId).exists()) return resolve(false);
      return resolve(snapshot.child(txId).val().bet);
    })
  })
}

const createReferral = async function(user_addr, referrer_addr, amount){
  return new Promise(async function(resolve, reject) {
    if(user_addr === referrer_addr){
      reject("cannot create a circular referral")
    }
    referralRef.child('map').once('value', async function(snapshot){
      	if(!snapshot.child(user_addr).exists()){
          const percentage = await getReferralPercentage(referrer_addr)
          let newAmount = amount * percentage
          console.log(percentage)
      		referralRef.child('map').child(user_addr).set({
      			referrer_addr: referrer_addr,
      			amount: newAmount
      		})
      	} else {console.log("Referral already created")}
    	resolve()
    })
  })
}


module.exports.registerReferral = async (req, res) => {
  if (!req.body) return res.status(400).send({ success: 'false', message: 'body is required'});
  if (!req.body.user_addr) return res.status(400).send({ success: 'false', message: 'user_addr is required'});
  if (!req.body.txId) return res.status(400).send({success: 'false', message: 'txId is required' });
  if (!req.body.referrer_addr) return res.status(400).send({success: 'false', message: 'referrer_addr is required'});
  try{
    var txId = req.body.txId
    var user_addr = req.body.user_addr
    var referrer_addr = req.body.referrer_addr
    var betOnDb = await checkBetOnDb(txId)
    if (!betOnDb) return res.status(400).send({ success: 'false', message: 'A bet is required in order to receive the referral, scammer' });
    console.log("Bet on DB updating referral ", betOnDb)
    await createReferral(user_addr, referrer_addr, betOnDb);
    return res.status(200).send({
        success: 'true',
        message: 'referral associated'
    })
  } catch(err) {
    console.log(err);
    return res.status(500).send({ success: 'false', message: 'Ouch! Something went wrong.' });
  }
}

module.exports.updateReferral = async (bet) => {
	let user_addr = bet.from
  let amount = bet.amount
	referralRef.child('map').once('value', async function(referralSnapshot){
    let currentRefferalSnap = referralSnapshot.child(user_addr)
		if(currentRefferalSnap.exists()){
			const percentage = await getReferralPercentage(currentRefferalSnap.val().referrer_addr)
      let newAmount = amount * percentage
      console.log(percentage)
			referralRef.child('map').child(user_addr).update({
				amount: currentRefferalSnap.val().amount + newAmount
      })
      console.log("[REFERRAL]: Updated Referral of user address: " + user_addr)
      console.log("[REFERRAL]: New amount: " + (currentRefferalSnap.val().amount + newAmount))
		} else {
      console.log("[REFERRAL]: Referral not created")
    }
	})
}




module.exports.payReferrals = async () => {
  console.log("Paying referral");
  referralRef.child('map').once('value', async (snapshot) => {
    let keys = Object.keys(snapshot.val())
    let balance
    for (var i = keys.length - 1; i >= 0; i--) {
      if(snapshot.child(keys[i]).val().amount >= 50){
        balance = await twb.tronWeb.trx.getBalance()
        if(balance > 50){
          var txId = await twb.tronWeb.trx.sendTrx(snapshot.child(keys[i]).val().referrer_addr, twb.tronWeb.toSun(50))
            referralRef.child('map').child(keys[i]).update({
              amount: snapshot.child(keys[i]).val().amount - 50
            })
            console.log("paid ", snapshot.child(keys[i]).val().referrer_addr)
        }
        else{
          console.error("[REFERRAL]: Insufficient funds in the master address");
        }
      }
    }
  })
  console.log("Paid referral")
}
