const config = require('./config')
const firebase = require('./firebase')
const twb = require('./tronWarBot')
const referral = require('./referral')

// let bet = {
//   from: address / Base58,
//   amount: number / sun,
//   userChoice: number / country,
//   round: number,
//   betReference: number / turn,
//   result: -1/ 1 unpaid,
//   time: betTime,
//   gameType: number ,
//   turn: turn,
//   alreadyUsed: false / referral,
// }

const getWeek = (n) => {
  let now = new Date(n)
  now.setHours(0,0,0,0)
  let day = now.getDay()
  let diff = now.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  now.setDate(diff)
  return now.toISOString().substr(0,10);
}


const updateSpender = async (bet) => {
  let weekIdx = "SPENDERS|" + getWeek(bet.time)
  let weekAmount = await firebase.getStatsRef(weekIdx).orderByKey().equalTo(bet.from).once('value').then(r=>(r.val() || {})[bet.from]);
  weekAmount = (parseInt(weekAmount) || 0) + parseInt(bet.amount);
  await firebase.getStatsRef(weekIdx).child(bet.from).set(weekAmount);

  let fullIdx = "SPENDERS|FULL"
  let fullAmount = await firebase.getStatsRef(fullIdx).orderByKey().equalTo(bet.from).once('value').then(r=>(r.val() || {})[bet.from]);
  fullAmount = (parseInt(fullAmount) || 0) + parseInt(bet.amount);
  await firebase.getStatsRef(fullIdx).child(bet.from).set(fullAmount);
}

const updateWinners = async (bets) => {
  for (let bet of bets) {
    let weekIdx = "WINNERS|" + getWeek(bet.time)
    let weekAmount = await firebase.getStatsRef(weekIdx).orderByKey().equalTo(bet.from).once('value').then(r=>(r.val() || {})[bet.from]);
    weekAmount = (parseInt(weekAmount) || 0) + parseInt(bet.win);
    await firebase.getStatsRef(weekIdx).child(bet.from).set(weekAmount);

    let fullIdx = "WINNERS|FULL"
    let fullAmount = await firebase.getStatsRef(fullIdx).orderByKey().equalTo(bet.from).once('value').then(r=>(r.val() || {})[bet.from]);
    fullAmount = (parseInt(fullAmount) || 0) + parseInt(bet.win);
    await firebase.getStatsRef(fullIdx).child(bet.from).set(fullAmount);
  }
}

module.exports = {
  updateSpender,
  updateWinners
}
