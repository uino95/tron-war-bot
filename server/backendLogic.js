const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const theFakeWwb = require('./worldWarBotApi')
const wwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const db = firebase.db

// const options = {
//     method: "DELETE",
//     uri: 'https://api.heroku.com/apps/tronwarbot/dynos/web',
//     headers: {
//         'content-type': 'application/json',
//         'accept': 'application/vnd.heroku+json; version=3',
//         'Authorization': 'Bearer ' + config.heroku.apiKey
//     }
// };

//////////////////////////////////// DB USAGE //////////////////////////////////////////

var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var dataRef = db.ref('data')
var betFinalRef = db.ref('betFinalData')


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//fetch current snapshot from db
// async function fetchLatestTurnOnDb() {
//     return new Promise(async function(resolve, reject) {
//         historyRef.orderByChild('turn').limitToLast(1).once('value', function(snapshot) {
//             let key = Object.keys(snapshot.val())
//             resolve(snapshot.child(key).val().turn)
//         })
//     })
// }

async function checkBetOnDb(txId) {
    return new Promise(async function(resolve, reject) {
        betsRef.once('value', function(snapshot) {
            return resolve(snapshot.child(txId).exists())
        })
    })
}

async function stopGame(){
  await twb.endGame(0);
  await twb.endGame(1);
}

async function gameOver(){
  dataRef.update({ serverStatus: 500 });
  var cr = await twb.getCurrentRound(0);
  var winner = wwb.winner();
  console.log("[LOGIC]: Sleeping one minute before automatic jackpot payout...");
  await sleep(60000);

  // @TODO GET WINNING BETS
  var _bets = []

  await twb.jackpotPayout(0, cr.round, winner, _bets);
  console.log("[GAME OVER]: The game is f***ing over... cit. Six Riddles");
}

module.exports.launchNextTurn = async function() {
  if (wwb.winner()) return;
  console.log("[SCHEDULER]: Launching next turn!")

  //STOP BET BUTTON
  dataRef.update({ serverStatus: 300 })
  // AWAIT FOR DATA PROPAGATION AND BET HALT
  await sleep(29000);
  var go = !(await nextTurn());

  // STOP GAME BETS
  if (go) await stopGame();

  // UPDATE HISTORY
  var data = wwb.currentTurnData();
  dataRef.update({ turn: data.turn })
  dataRef.update({ turnTime: (new Date()).valueOf() })
  historyRef.push().set({
                  conquest: [data.o, data.dt],
                  prev: data.d,
                  turn: data.turn,
                  civilWar: data.civilWar
                });

  // PAYOUT IN PROGESS
  dataRef.update({ serverStatus: 400 });

  // PAYOUT AGAINST DEALER
  var cr = await twb.getCurrentRound(1);

  // @TODO GET BET RATE FOR GIVEN WINNER
  var _winRate = 0

  // @TODO UPDATE BET RATES AND PDF  => IN WWB

  // @TODO GET WINNING BETS
  var _bets = []

  await twb.housePayout(1, cr.round, data.o, _winRate, _bets);

  // PAYOUT FINAL
  if (go) await gameOver();

  console.log("[SCHEDULER]: Next turn complete!");
}


// var latestTurn = -1
// var currentTurn = -1


///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Start Working ///////////////////////////////////

// async function pollForNewTurn() {
//     try {
//         var turn = await theFakeWwb.getTurnFromAPI('last')
//         console.log(turn);
//         console.log(turn.turn)
//         if (turn.turn > currentTurn + 1) {
//             console.log("lost some turns... resyncing")
//             syncServer(true)
//         } else if (turn.turn < currentTurn) throw "E' un cazzo di casino moh...";
//         else if (turn.turn == currentTurn + 1) {
//             let conqueredId = turn.conquest[1];
//             let conquerId = turn.conquest[0]
//             let prevOwnerId = await theFakeWwb.computeCountryFromId(conqueredId, turn.turn - 1);
//             let realConquerId = await theFakeWwb.computeCountryFromId(conquerId, turn.turn - 1);
//             // in case of resurrection
//             if (realConquerId === prevOwnerId) {
//                 realConquerId = conquerId
//             }
//             historyRef.push().set({
//                 conquest: [realConquerId, conqueredId],
//                 prev: prevOwnerId,
//                 turn: turn.turn
//             })
//             countriesRef.orderByKey().equalTo(conqueredId.toString()).once('value', function(snapshot) {
//                 let key = Object.keys(snapshot.val())[0]
//                 countriesRef.child(key).update({
//                     controlledBy: realConquerId
//                 })
//             })
//
//             var r = await twb.startGame(0);
//             console.log("game started")
//
//             currentTurn++
//             utils.consoleLog("new Turn - " + currentTurn)
//
//             let d1 = new Date()
//             let nextTurnTime = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), 13, 0, 0).getTime();
//             let nextTurn = turn.turn + 1
//
//             dataRef.update({ nextTurnTime })
//             dataRef.update({ nextTurn })
//
//
//             console.log("WINNER: ", utils.universalMap(realConquerId))
//             return realConquerId
//         } else {
//             console.log("turn not changed")
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// let count = 0
//start polling the api server at every :13 of each hour (edit second star with 13)
// module.exports.watchNewTurn = function() {
//     cron.schedule("1 13 * * * *", async function() {
//         count++
//         utils.consoleLog("start polling WWB server for new turn")
//         dataRef.update({ serverStatus: 300 })
//         latestTurn = await fetchLatestTurnOnDb()
//         currentTurn = currentTurn === -1 ? latestTurn : currentTurn //TODO fetch from db
//
//         var r = await twb.endGame(0);
//         //start polling every 15 seconds. The function then quits as the turn changes
//         while (currentTurn === latestTurn) {
//             await utils.sleep(30000);
//             var winner = await pollForNewTurn();
//         }
//         dataRef.update({ serverStatus: 400 })
//         let winningBets = await twb.payout(0, r, winner);
//
//         let currentRound = await twb.getCurrentRound(0)
//         console.log(currentRound)
//         let jackpot = currentRound.availableJackpot
//         jackpot = twb.tronWeb.fromSun(jackpot.toString())
//         dataRef.update({ jackpot })
//
//         console.log("winningBets ", winningBets)
//
//         betsRef.orderByKey().once('value', function(snapshot) {
//             let betKeys = Object.keys(snapshot.val())
//             for (var i = betKeys.length - 1; i >= 0; i--) {
//                 let skip = false
//                 currentBetKey = betKeys[i]
//                 if (winningBets.length > 0) {
//                     for (var j = winningBets.length - 1; j >= 0; j--) {
//                         let winningBet = winningBets[j]
//                         if (currentBetKey === winningBet.transaction) {
//                             skip = true
//                             console.log("updated Winner bet ", currentBetKey)
//                             let result = parseFloat(twb.tronWeb.fromSun(winningBet.win.toString())).toFixed(3)
//                             betsRef.child(winningBet.transaction).update({
//                                 result: result
//                             })
//                         }
//                     }
//                     if (!skip && snapshot.child(currentBetKey).val().result < 0) {
//                         console.log("updated loser bet ", currentBetKey)
//                         betsRef.child(currentBetKey).update({
//                             result: 0
//                         })
//                     }
//                 } else if (snapshot.child(currentBetKey).val().result < 0) {
//                     console.log("updated loser bet ", currentBetKey)
//                     betsRef.child(currentBetKey).update({
//                         result: 0
//                     })
//                 }
//             }
//         })
//         //in order to prevent heroku cycling at wrong time
//         if (count >= 23) {
//             var res = await rp(options)
//             count = 0
//         }
//
//         dataRef.update({ serverStatus: 200 })
//
//
//         console.log("turn updated ... waiting an hour now for new turn")
//     });
// }

// watch for new bets
module.exports.watchBet = function() {
  console.log("[LOGIC]: Watching user bets...")
  return twb.watchEvents('Bet', async function(r) {
      let bet = r.result
      if (!betValidator.validate(bet))
        return console.error("[INVALID_BET]: Received an invalid bet for gameType: " + bet.gameType.toString()
                            + "\n\tof amount: " + twb.tronWeb.fromSun(bet.amount.toString())
                            + "\n\tby: " + bet.from.toString()
                            + "\n\twith user choice: " + bet.userChoice.toString()
                            + "\n\tbetReference: " + bet.betReference.toString() );
      let isBetAlreadyOnDb = await checkBetOnDb(r.transaction);
      if (!!isBetAlreadyOnDb) return console.error("[GENERIC]: Bet " + r.transaction + " is already on DB");
      let turn = wwb.currentTurn();
      let betTime = new Date().getTime()
      let betObj = {
          from: twb.tronWeb.address.fromHex(bet.from),
          amount: bet.amount,
          userChoice: bet.userChoice,
          round: bet.round,
          betReference : bet.betReference,
          result: -1,
          time: betTime,
          gameType: bet.gameType,
          turn: turn
      }
      betsRef.child(r.transaction).set(betObj)
      referral.updateReferral(betObj)
      let jackpot = await twb.availableJackpot(0, bet.round);
      jackpot = twb.tronWeb.fromSun(jackpot.availableJackpot.toString())
      betFinalRef.update({jackpot})
      console.info("Successfully registered bet in tx " + r.transaction + " at " + betTime )
      console.info("Jackpot is: ", jackpot)
  })
}
