var admin = require('firebase-admin');
var config = require('./config');

admin.initializeApp({
    credential: admin.credential.cert(config.firebase),
    databaseURL: 'https://tron-war-bot.firebaseio.com'
});

module.exports = {
	db: admin.database()
}

