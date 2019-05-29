const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const cron = require("node-cron");
const utils = require("./utils")


var http = require('http').Server(app);
const https = require('https');
var io = require('socket.io')(http);

const betRoutes = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use('/bets', betRoutes);

var currentConnections = {};

//Socket Events
io.on('connection', function(socket) {
  console.log('a user connected: ' + socket.id);
  currentConnections[socket.id] = {
    socket: socket
  };
  socket.emit('sendSocketid', {
    socketid: socket.id
  })

  socket.on('newBet', function(newBet) {
    let bet = new Bet(newBet);
    bet.save().then((bet) => {
        socket.emit('sendSocketIdResp', 'ok')
        console.log('Accepted New Bet: ' + bet)
      })
      .catch(err => {
        socket.emit('sendSocketIdResp', 'ko')
        console.log('Rejected New Bet: ' + bet)
      });
  })

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected...')
    delete currentConnections[socket.id];
  })
});

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

var latestTurn = 848

function pollForNewTurn() {
  https.get('https://worldwarbot.com/api/v0.1/?request=conquest&turn=last', (resp) => {
    let data = '';
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(`statusCode: ${resp.statusCode}`)
      let turn = JSON.parse(data)
      console.log(turn);
      if (turn.turn == latestTurn + 1) {
        //TODO insert into db
        latestTurn++
        utils.consoleLog("new Turn - " + latestTurn)
      }
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

//start polling the api server at every :13 of each hour
// cron.schedule("1 * * * * *", function() {
utils.consoleLog("start polling WWB server for new turn")
//fetch latest turn number
// let latestTurn = Run.findOne().sort({id: -1}).exec(function(err, post) {
//   console.log(post)
// });
let currentRun = 2
let currentTurn = 848 //TODO fetch from db

//start polling every 15 seconds. The function then quits as the turn changes
// while (currentTurn == latestTurn) {
//   setTimeout(function() {
//     console.log("ciao")
//     pollForNewTurn()
//   }, 2000);
// }
// });


betRoutes.route('/').get(function(req, res) {
  Bet.find(function(err, bets) {
    if (err) {
      console.log(err);
    } else {
      res.json(bets);
    }
  });
});

betRoutes.route('/:id').get(function(req, res) {
  let id = req.params.id;
  Bet.findById(id, function(err, bet) {
    res.json(bet);
  });
});

betRoutes.route('/update/:id').post(function(req, res) {
  Bet.findById(req.params.id, function(err, bet) {
    if (!bet)
      res.status(404).send("data is not found");
    else
      bet.address = req.body.address;
    bet.amount = req.body.amount;
    bet.state = req.body.state;
    bet.save().then(bet => {
        res.json('bet updated!');
      })
      .catch(err => {
        res.status(400).send("Update not possible");
      });
  });
});


///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// DB and Server StartUp /////////////////////////////

http.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});
