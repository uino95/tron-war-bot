const firebase = require('./firebase')
const twb = require('./tronWarBot')
const utils = require("./utils");


const getReferralPercentage = async (referrer_addr) => {
  let snapshot = await firebase.referral.child('percentages').orderByKey().equalTo(referrer_addr).once('value')
  if (snapshot.val() !== null) {
    return snapshot.val()[referrer_addr]
  }
  snapshot = await firebase.referral.child('percentages').orderByKey().equalTo('default').once('value')
  return snapshot.val().default
}


const createReferral = async function (user_addr, referrer_addr, amount) {
  console.log(user_addr, referrer_addr, amount)
  if (user_addr === referrer_addr) {
    throw Error("cannot create a circular referral")
  }
  const snapshot = await firebase.referral.child('map').once('value')
  if (!snapshot.child(user_addr).exists()) {
    const percentage = await getReferralPercentage(referrer_addr)
    let newAmount = amount * percentage
    firebase.referral.child('map').child(user_addr).set({
      referrer_addr: referrer_addr,
      amount: newAmount
    })
    console.log("[REFERRAL]: Created new referral for referrer: " + referrer_addr)
    return {result:true, payload:"Created new referral for referrer: " + referrer_addr}
  } else if(snapshot.child(user_addr).val().referrer_addr != referrer_addr){
    console.log("[REFERRAL]: Cannot change referral association")
    return {result:false, payload:"Cannot change referral association"}
  } else {
    console.log("[REFERRAL]: Referral already created, it will be updated")
    return {result:true, payload: "Referral already created, it will be updated"}
  }
}


module.exports.registerReferral = async (req, res) => {
  try {
    if (!req.body) return res.status(400).send({ success: 'false', message: 'body is required'});
    if (!req.body.user_addr) return res.status(400).send({success: 'false', message: 'an user address is required'});
    if (!req.body.txId) return res.status(400).send({success: 'false',message: 'transaction ID is required'});
    if (!req.body.referrer_addr) return res.status(400).send({success: 'false',message: 'a referrer address is required'});
    var txId = req.body.txId
    var user_addr = req.body.user_addr
    var referrer_addr = req.body.referrer_addr
    var betOnDb = await firebase.bets.checkBetOnDb(txId)
    if (!betOnDb) return res.status(400).send({success: false, payload:"no bet found on db with the given txId"});
    if (betOnDb.from != user_addr) return res.status(400).send({success:false, payload:"user_addr different from the better"});
    if (betOnDb.alreadyUsed) return res.status(400).send({success:false, payload: "bet already used for referral"});
    await firebase.bets.child(txId).update({alreadyUsed:true});
    const r = await createReferral(user_addr, referrer_addr, twb.tronWeb.fromSun(betOnDb.amount));
    if (!r.result) return res.status(400).send({success: 'false',message: r.payload});
    return res.status(200).send({
      success: 'true',
      message: r.payload
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: 'false',
      message: 'Ouch! Something went wrong. ' + err
    });
  }
}

module.exports.updateReferral = async (bet) => {
  let user_addr = bet.from
  let amount = twb.tronWeb.fromSun(bet.amount)
  firebase.referral.child('map').once('value', async function (referralSnapshot) {
    let currentRefferalSnap = referralSnapshot.child(user_addr)
    if (currentRefferalSnap.exists()) {
      const percentage = await getReferralPercentage(currentRefferalSnap.val().referrer_addr)
      let newAmount = amount * percentage
      console.log(percentage)
      firebase.referral.child('map').child(user_addr).update({
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
  console.log("[SCHEDULER]: Starting paying referral job...");
  firebase.referral.child('map').once('value', async (snapshot) => {
    let keys = Object.keys(snapshot.val())
    let balance
    for (var i = keys.length - 1; i >= 0; i--) {
      if (snapshot.child(keys[i]).val().amount >= 50) {
        balance = await twb.tronWeb.trx.getBalance()
        if (balance <= 50)
          return console.error("[REFERRAL]: Insufficient funds in the master address");
        var txId = await twb.tronWeb.trx.sendTrx(snapshot.child(keys[i]).val().referrer_addr, twb.tronWeb.toSun(50))
        firebase.referral.child('map').child(keys[i]).update({
          amount: snapshot.child(keys[i]).val().amount - 50
        })
        console.log("[REFERRAL]: Paid ", snapshot.child(keys[i]).val().referrer_addr)
      }
    }
  })
  console.log("[SCHEDULER]: ...end of paying referral job!");
}
