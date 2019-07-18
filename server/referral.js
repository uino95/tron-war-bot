const firebase = require('./firebase')
const twb = require('./tronWarBot')
const db = firebase.db

const cron = require("node-cron");
const utils = require("./utils");

/////////////////////////////////////////////// DB SETTING ////////////////////////////////////////////

var referralRef = db.ref('referral')
var betsRef = db.ref('bets')

// ///////////////////////////////////////////// DB USAGE /////////////////////////////////////////////

async function isPremiumAddress(referrer_addr){
  return new Promise(async function(resolve, reject) {
    referralRef.child('premium_addrs').once('value', function(snapshot){
      resolve(snapshot.child(referrer_addr).exists())
    })
  })
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
      		var premiumAddress = await isPremiumAddress(referrer_addr)
      		let newAmount = premiumAddress ? amount * 0.2 : amount * 0.01
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
			let premiumAddress = await isPremiumAddress(currentRefferalSnap.val().referrer_addr)
			let newAmount = premiumAddress ? amount * 0.2 : amount * 0.01
			referralRef.child('map').child(user_addr).update({
				amount: currentRefferalSnap.val().amount + newAmount
      })
      console.log("updated Referral of user address: " + user_addr)
      console.log("new amount: " + (currentRefferalSnap.val().amount + newAmount))
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





