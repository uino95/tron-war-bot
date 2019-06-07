const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const twb = require('./tronWarBot');
const rp = require('request-promise');

const PORT = 4000;
const cron = require("node-cron");
const utils = require("./utils")

var http = require('http').Server(app);
const https = require('https');
var io = require('socket.io')(http);

var admin = require('firebase-admin');
var config = require('./config')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.use(cors());
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Startup ///////////////////////////////////////


//init db
admin.initializeApp({
  credential: admin.credential.cert(config.firebase),
  databaseURL: 'https://tron-war-bot.firebaseio.com'
});
var db = admin.database();
var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var jackpotRef = db.ref('data/jackpot')
var nextTurnRef = db.ref('data/nextTurn')
var payoutRef = db.ref('payout')

//sync
module.exports.startup = async function (){
  var l = await twb.getCurrentRound(0);
  if (!l.stoppedAt) return;
  var r = await twb.startGame(0);
}

//TODO farlo tutto con await e async
// let alreadyCalled = false
// async function syncServer(){
//   //get the latest turn saved on DB from History
//   let lastTurnOnDb
//   historyRef.orderByChild('turn').limitToLast(1).on('child_added', function(snapshot){
//     if(!alreadyCalled ){
//       alreadyCalled = true
//       lastTurnOnDb = snapshot.val().turn
//       getTurnFromAPI('last').then((lastTurnOnAPIObj) => {
//         let lastTurnOnAPI = lastTurnOnAPIObj.turn
//         while(lastTurnOnDb != lastTurnOnAPI){
//           lastTurnOnDb ++
//           getTurnFromAPI(lastTurnOnDb).then((turn) => {
//             console.log("TURN: ", turn)
//             computeCountryFromId(turn.conquest[0], turn.turn - 1).then((conquer) => {
//               computeCountryFromId(turn.conquest[1], turn.turn - 1).then((prev) => {
//                 historyRef.push().set({
//                   conquest: [ conquer, utils.universalMap(turn.conquest[1])],
//                   prev:  prev,
//                   turn: turn.turn
//                 })
//                 let controlled = utils.universalMap(turn.conquest[1])
//                 let newController = countrieNameId.nameToId[conquer]
//                 console.log("controlled", controlled)
//                 console.log("newController", newController)
//                 countriesRef.orderByChild('id').equalTo(controlled).once('value', function(snapshot){
//                   let key = Object.keys(snapshot.val())[0]
//                   console.log(snapshot.val())
//                   countriesRef.child(key).update({
//                     id: controlled,
//                     controlledBy: newController
//                   })
//                 })
//               })
//             })
//           })
//         }
//         console.log("server synced with API server")
//       })
//     }
//   })



  // retrieve last bet on db
  // retriebve last bet on smart contract
  // check difference and retrieve lost bets
//}


///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Start Working ///////////////////////////////////

// TODO watch for new bets
// TODO console.log(newBet)
// TODO console.log(newJackpot)

//watch for new turn

var getTurnFromAPI = function(turn) {
  return new Promise(function(resolve, reject) {
    https.get(`https://worldwarbot.com/api/v0.1/?request=conquest&turn=${turn}`, (resp) => {
      let data = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        let res = JSON.parse(data)
        if (resp.statusCode == 200){
          resolve(res)
        } else {
          reject("Something went wrong while fetching ", turn)
        }
      })
    })
  });
}

async function computeCountryFromId(id, turn){
  let found = false
  return new Promise(async function(resolve, reject) {
    var data = await rp.get('http://192.168.1.15:3000/conquest_countries').catch(console.error); 
    let res = JSON.parse(data)
    for (var i = res.countries.length - 1; i >= 0; i--) {
      for (var j = res.countries[i][1].length - 1; j >= 0; j--) {
        if(res.countries[i][1][j] === id){
          found = true
          resolve(res.countries[i][0])
        }
      }
    }
    if(!found){
      reject("somwthing went wrong while computing id for country ")
    }
  })
}

var latestTurn = -1
var currentTurn = -1
async function pollForNewTurn() {
  var data = await rp.get('http://192.168.1.15:3000/conquest').catch(console.error);
  let turn = JSON.parse(data)
  console.log(turn);
  console.log(turn.turn)
  if (turn.turn > currentTurn + 1){
    // TODO syncserver
    throw"LOST A TURN";
  }
  if (turn.turn < currentTurn + 1) throw "E' un cazzo di casino moh...";

  let conqueredId = turn.conquest[1];
  let conquerId = turn.conquest[0]
  let realConquerName = await computeCountryFromId(conquerId, turn.turn - 1);
  let prevOwnerName = await computeCountryFromId(conqueredId, turn.turn - 1);
  let realConquerId = utils.universalMap(realConquerName,'numberId')
  let prevOwnerId = utils.universalMap(prevOwnerName,'numberId')
  historyRef.push().set({
    conquest: [ realConquerId, conqueredId],
    prev:  prevOwnerId,
    turn: turn.turn
  })

  countriesRef.orderByKey().equalTo(conqueredId.toString()).once('value', function(snapshot){
    let key = Object.keys(snapshot.val())[0]
    countriesRef.child(key).update({
      controlledBy: conquerId
    })
  })

  // update next turn ond db
  var r = await twb.startGame(0);
  currentTurn++
  utils.consoleLog("new Turn - " + latestTurn)

  return conquerId
}

//start polling the api server at every :13 of each hour (edit second star with 13)
cron.schedule("1 * * * * *", async function() {
  utils.consoleLog("start polling WWB server for new turn")
  //fetch latest turn number
  latestTurn = 1
  currentTurn = currentTurn === -1 ? latestTurn : currentTurn //TODO fetch from db
  var r = await twb.endGame(0);

  //start polling every 15 seconds. The function then quits as the turn changes
  while (currentTurn === latestTurn) {
    await sleep(2000);
    var winner = await pollForNewTurn();
  }
  await twb.payout(0,r.round, winner);
});

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Start Listening on port /////////////////////////////

http.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});
