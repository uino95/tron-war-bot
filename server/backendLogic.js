const rp = require('request-promise')
const cron = require("node-cron");

const firebase = require('./firebase')
const wwb = require('./worldWarBotApi')
const theRealWwb = require('./worldWarBot')
const twb = require('./tronWarBot')
const utils = require('./utils')
const referral = require('./referral')
const betValidator = require('./bet')
const config = require('./config')
const db = firebase.db

const options = {
    method: "DELETE",
    uri: 'https://api.heroku.com/apps/tronwarbot/dynos/web',
    headers: {
        'content-type': 'application/json',
        'accept': 'application/vnd.heroku+json; version=3',
        'Authorization': 'Bearer ' + config.heroku.apiKey
    }
};

//////////////////////////////////// DB USAGE //////////////////////////////////////////

var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var dataRef = db.ref('data')

//fetch current snapshot from db
async function fetchLatestTurnOnDb() {
    return new Promise(async function(resolve, reject) {
        historyRef.orderByChild('turn').limitToLast(1).once('value', function(snapshot) {
            let key = Object.keys(snapshot.val())
            resolve(snapshot.child(key).val().turn)
        })
    })
}

async function checkBetOnDb(txId) {
    return new Promise(async function(resolve, reject) {
        betsRef.once('value', function(snapshot) {
            resolve(snapshot.child(txId).exists())
        })
    })
}



var latestTurn = -1
var currentTurn = -1

//sync
module.exports.syncServer = async function(updateCurrentTurn) {
    let lastTurnOnDb = await fetchLatestTurnOnDb();
    let turn = await wwb.getTurnFromAPI('last');
    let lastTurnOnApi = turn.turn
    turn = turn.turn
    let conqueredId
    let prevOwnerId
    while (lastTurnOnDb != lastTurnOnApi) {
        lastTurnOnDb++
        turn = await wwb.getTurnFromAPI(lastTurnOnDb)
        console.log("TURN: ", turn)
        conqueredId = turn.conquest[1]
        realConquerId = await wwb.computeCountryFromId(turn.conquest[0], turn.turn - 1)
        prevOwnerId = await wwb.computeCountryFromId(turn.conquest[1], turn.turn - 1)
        historyRef.push().set({
            conquest: [realConquerId, conqueredId],
            prev: prevOwnerId,
            turn: turn.turn
        })
        countriesRef.orderByKey().equalTo(conqueredId.toString()).once('value', function(snapshot) {
            let key = Object.keys(snapshot.val())[0]
            countriesRef.child(key).update({
                controlledBy: realConquerId
            })
        })
        if (updateCurrentTurn) {
            currentTurn++
        }
    }

    let nextTurn = lastTurnOnDb
    let d1 = new Date()
    let nextTurnTime = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), 13, 0, 0).getTime();

    dataRef.update({ nextTurn })
    dataRef.update({ nextTurnTime })

    dataRef.update({ serverStatus: 200 })
    console.log("server synced with API server")
    // retrieve last bet on db
    // retriebve last bet on smart contract
    // check difference and retrieve lost bets
}


///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Start Working ///////////////////////////////////

async function pollForNewTurn() {
    try {
        var turn = await wwb.getTurnFromAPI('last')
        console.log(turn);
        console.log(turn.turn)
        if (turn.turn > currentTurn + 1) {
            console.log("lost some turns... resyncing")
            syncServer(true)
        } else if (turn.turn < currentTurn) throw "E' un cazzo di casino moh...";
        else if (turn.turn == currentTurn + 1) {
            let conqueredId = turn.conquest[1];
            let conquerId = turn.conquest[0]
            let prevOwnerId = await wwb.computeCountryFromId(conqueredId, turn.turn - 1);
            let realConquerId = await wwb.computeCountryFromId(conquerId, turn.turn - 1);
            // in case of resurrection
            if (realConquerId === prevOwnerId) {
                realConquerId = conquerId
            }
            historyRef.push().set({
                conquest: [realConquerId, conqueredId],
                prev: prevOwnerId,
                turn: turn.turn
            })
            countriesRef.orderByKey().equalTo(conqueredId.toString()).once('value', function(snapshot) {
                let key = Object.keys(snapshot.val())[0]
                countriesRef.child(key).update({
                    controlledBy: realConquerId
                })
            })

            var r = await twb.startGame(0);
            console.log("game started")

            currentTurn++
            utils.consoleLog("new Turn - " + currentTurn)

            let d1 = new Date()
            let nextTurnTime = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), 13, 0, 0).getTime();
            let nextTurn = turn.turn + 1

            dataRef.update({ nextTurnTime })
            dataRef.update({ nextTurn })


            console.log("WINNER: ", utils.universalMap(realConquerId))
            return realConquerId
        } else {
            console.log("turn not changed")
        }
    } catch (err) {
        console.log(err)
    }
}

let count = 0
//start polling the api server at every :13 of each hour (edit second star with 13)
module.exports.watchNewTurn = function() {
    cron.schedule("1 13 * * * *", async function() {
        count++
        utils.consoleLog("start polling WWB server for new turn")
        dataRef.update({ serverStatus: 300 })
        latestTurn = await fetchLatestTurnOnDb()
        currentTurn = currentTurn === -1 ? latestTurn : currentTurn //TODO fetch from db

        var r = await twb.endGame(0);
        //start polling every 15 seconds. The function then quits as the turn changes
        while (currentTurn === latestTurn) {
            await utils.sleep(30000);
            var winner = await pollForNewTurn();
        }
        dataRef.update({ serverStatus: 400 })
        let winningBets = await twb.payout(0, r, winner);

        let currentRound = await twb.getCurrentRound(0)
        console.log(currentRound)
        let jackpot = currentRound.availableJackpot
        jackpot = twb.tronWeb.fromSun(jackpot.toString())
        dataRef.update({ jackpot })

        console.log("winningBets ", winningBets)

        betsRef.orderByKey().once('value', function(snapshot) {
            let betKeys = Object.keys(snapshot.val())
            for (var i = betKeys.length - 1; i >= 0; i--) {
                let skip = false
                currentBetKey = betKeys[i]
                if (winningBets.length > 0) {
                    for (var j = winningBets.length - 1; j >= 0; j--) {
                        let winningBet = winningBets[j]
                        if (currentBetKey === winningBet.transaction) {
                            skip = true
                            console.log("updated Winner bet ", currentBetKey)
                            let result = parseFloat(twb.tronWeb.fromSun(winningBet.win.toString())).toFixed(3)
                            betsRef.child(winningBet.transaction).update({
                                result: result
                            })
                        }
                    }
                    if (!skip && snapshot.child(currentBetKey).val().result < 0) {
                        console.log("updated loser bet ", currentBetKey)
                        betsRef.child(currentBetKey).update({
                            result: 0
                        })
                    }
                } else if (snapshot.child(currentBetKey).val().result < 0) {
                    console.log("updated loser bet ", currentBetKey)
                    betsRef.child(currentBetKey).update({
                        result: 0
                    })
                }
            }
        })
        //in order to prevent heroku cycling at wrong time
        if (count >= 23) {
            var res = await rp(options)
            count = 0
        }

        dataRef.update({ serverStatus: 200 })


        console.log("turn updated ... waiting an hour now for new turn")
    });
}

// watch for new bets
module.exports.watchBet = function() {
  return twb.watchEvents('Bet', async function(r) {
      let bet = r.result
      if (!betValidator.validate(bet))
        return console.error("[INVALID_BET]: Received an invalid bet for gameType: " + bet.gameType.toString()
                            + "\n\tof amount: " + tronWeb.fromSun(bet.amount.toString())
                            + "\n\tby: " + bet.from.toString()
                            + "\n\twith user choice: " + bet.userChoice.toString()
                            + "\n\tbetReference: " + bet.betReference.toString() );
      let isBetAlreadyOnDb = await checkBetOnDb(r.transaction);
      if (!!isBetAlreadyOnDb) return console.error("[GENERIC]: Bet " + r.transaction + " is already on DB");
      let turn = theRealWwb.currentTurn();
      let betTime = new Date().getTime()
      let betObj = {
          address: twb.tronWeb.address.fromHex(bet.from),
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
      dataRef.update({ jackpot })
      console.info("Successfully registered bet in tx " + r.transaction + " at " + betTime )
      console.info("Jackpot is: ", jackpot)
  })
}
