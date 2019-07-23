const firebase = require('./firebase')
const twb = require('./tronWarBot')
const db = firebase.db

const cron = require("node-cron");
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

async function getReferralPercentage (referrer_addr){
  let snapshot = await referralRef.child('percentages').orderByKey().equalTo(referrer_addr).once('value')
  if(snapshot.val() !== null){
    return snapshot.val()[referrer_addr]
  }
  snapshot = await referralRef.child('percentages').orderByKey().equalTo('default').once('value')
  return snapshot.val().default
}

module.exports.checkBetOnDb = async function(txId){
  console.log(txId)
  return new Promise(async function(resolve, reject) {
    betsRef.once('value', function(snapshot){
      if(snapshot.child(txId).exists()){
        resolve(snapshot.child(txId).val().bet)
      } else {
        resolve(false)
      }
    })
  })
}

module.exports.createReferral = async function(user_addr, referrer_addr, amount){
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

module.exports.updateReferral = async function(bet){  
	let user_addr = bet.address
  let amount = bet.bet
	referralRef.child('map').once('value', async function(referralSnapshot){
    let currentRefferalSnap = referralSnapshot.child(user_addr)
		if(currentRefferalSnap.exists()){
			const percentage = await getReferralPercentage(currentRefferalSnap.val().referrer_addr)
      let newAmount = amount * percentage
      console.log(percentage)
			referralRef.child('map').child(user_addr).update({
				amount: currentRefferalSnap.val().amount + newAmount
      })
      console.log("updated Referral of user address: " + user_addr)
      console.log("new amount: " + (currentRefferalSnap.val().amount + newAmount))
		} else {
      console.log("referral not created")
    }
	})
}


/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

module.exports.watchPayer = function(){
  cron.schedule("1 1 1 * * *", async function() {
    utils.consoleLog("paying referral")
    referralRef.child('map').once('value', async function(snapshot){
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
            console.log("not enough money in the master address")
          }
        }
      }
    })
    utils.consoleLog("paid referral")
  })
}





