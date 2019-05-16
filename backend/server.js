const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const mongoose = require('mongoose');

let Bet = require('./tron.model');

var http = require('http').Server(app);
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

mongoose.connect('mongodb://127.0.0.1:27017/tron', {
  useNewUrlParser: true
});

const connection = mongoose.connection;

connection.once('open', function() {
  console.log("MongoDB database connection established successfully");
})

http.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT);
});
