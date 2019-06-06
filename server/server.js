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
var territories = require('./territories')
var countrieNameId = require('./countriesNameWithId')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.use(cors());
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Initialize DB //////////////////////////////////

admin.initializeApp({
  credential: admin.credential.cert(config.firebase),
  databaseURL: 'https://tron-war-bot.firebaseio.com'
});

var db = admin.database();

// Get reference to db
var historyRef = db.ref('history')
var betsRef = db.ref('bets')
var countriesRef = db.ref('countries')
var jackpotRef = db.ref('data/jackpot')
var nextTurnRef = db.ref('data/nextTurn')
var payoutRef = db.ref('payout')

// Append new data to an array
// historyRef.push().set(
//   {
//     conquest:["France","Portugal"],
//     prev: "Italy",
//     turn: 1080
//   }
// )

// payoutRef.push().set(
//   {
//     paid: 29293,
//     to: "TdaknGhsafko4nhfay"
//   }
// )

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

function computeCountryFromId(id, turn){
  return new Promise(function(resolve, reject) {
    https.get(`https://worldwarbot.com/api/v0.1/?request=conquest_countries&turn=${turn}`, (resp) => {
      let data = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        let res = JSON.parse(data)
        for (var i = res.countries.length - 1; i >= 0; i--) {
          for (var j = res.countries[i][1].length - 1; j >= 0; j--) {
            if(res.countries[i][1][j] === id){
              resolve(res.countries[i][0])
            }
          }
        }
        if(resp.statusCode != 200) reject("Something converting country ")
      })
    })
  })
}

// TODO fare una promise per leggere i dati

let alreadyCalled = false
async function syncServer(){
  //get the latest turn saved on DB from History
  let lastTurnOnDb
  historyRef.orderByChild('turn').limitToLast(1).on('child_added', function(snapshot){
    if(!alreadyCalled ){
      alreadyCalled = true
      lastTurnOnDb = snapshot.val().turn
      getTurnFromAPI('last').then((lastTurnOnAPIObj) => {
        let lastTurnOnAPI = lastTurnOnAPIObj.turn
        while(lastTurnOnDb != lastTurnOnAPI){
          lastTurnOnDb ++
          getTurnFromAPI(lastTurnOnDb).then((turn) => {
            computeCountryFromId(turn.conquest[0], turn.turn - 1).then((conquer) => {
              computeCountryFromId(turn.conquest[1], turn.turn - 1).then((prev) => {
                historyRef.push().set({
                  conquest: [ conquer, territories[turn.conquest[1]][1]],
                  prev:  prev,
                  turn: turn.turn
                })
                //TODO update countries controlled by
                //retrieve entry to be updated
                // let controlled = countrieNameId.nameToId['prev']
                // let newController = countrieNameId.nameToId['conquer']
                // console.log(controlled)
                // console.log(newController)
                // countriesRef.orderByChild('id').equalTo(controlled).on('value', function(snapshot){
                //   countriesRef.child(snapshot.val()).update({
                //     id: id,
                //     controlledBy: newController
                //   })
                // })
              })
            })
          })
        }
        console.log("server synced with API server")
      })
    }
  })



  // retrieve last bet on db
  // retriebve last bet on smart contract
  // check difference and retrieve lost bets
}



////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// New Turn ///////////////////////////////////////

function newTurn(turn) {
  let newTurn = RunTurn(turn)
  RunTurn.save().then((newTurn) => {
    io.emit('newTurn', newTurn)
  }).catch(err => {
    console.log(err)
  })
}

var latestTurn = -1
var currentTurn = -1

async function pollForNewTurn() {
  var turn = await rp.get('https://worldwarbot.com/api/v0.1/?request=conquest&turn=last').catch(console.error);
  console.log(turn);
  if (turn.turn > currentTurn + 1){
    // TODO syncserver
    return console.error("LOST A TURN")
  }
  if (turn.turn < currentTurn + 1) throw "E' un cazzo di casino moh...";
  var conquer = await computeCountryFromId(turn.conquest[0], turn.turn - 1);
  var prev = await computeCountryFromId(turn.conquest[1], turn.turn - 1);
  historyRef.push().set({
    conquest: [ conquer, territories[turn.conquest[1]][1]],
    prev:  prev,
    turn: turn.turn
  })
  var r = await twb.startGame(0);
    //TODO update countries controlled by
  currentTurn++
  utils.consoleLog("new Turn - " + latestTurn)
  //TODO return number of winning country
  return turn.conquest[1];
}


//start polling the api server at every :13 of each hour (edit second star with 13)
// cron.schedule("1 13 * * * *", async function() {
//   utils.consoleLog("start polling WWB server for new turn")
//   //fetch latest turn number
//   latestTurn = // fetch latest history entry.turn
//   currentTurn = currentTurn === -1 ? latestTurn : currentTurn //TODO fetch from db
//   var r = await twb.endGame(0);
//
//   //start polling every 15 seconds. The function then quits as the turn changes
//   while (currentTurn === latestTurn) {
//     await sleep(2000);
//     var winner = await pollForNewTurn();
//   }
//   await twb.payout(0,r.round, winner);
// });

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// DB and Server StartUp /////////////////////////////

// Sync server with WorldWarBot API
syncServer()


http.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});
