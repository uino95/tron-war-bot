const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const mongoose = require('mongoose');

let Bet = require('./tron.model');

const betRoutes = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use('/bets', betRoutes);

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

betRoutes.route('/add').post(function(req, res) {
    let bet = new Bet(req.body);
    bet.save()
        .then(bet => {
            res.status(200).json({'bet': 'bet added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new bet failed');
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

mongoose.connect('mongodb://127.0.0.1:27017/TronDb', { useNewUrlParser: true });

const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
