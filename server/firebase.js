var admin = require('firebase-admin');
var config = require('./config');

if(config.test){
    admin.initializeApp({
        credential: admin.credential.cert(config.firebaseTest),
        databaseURL: 'https://tron-war-bot-test.firebaseio.com/'
    });
    console.log("TEST MODE")
} else {
    admin.initializeApp({
        credential: admin.credential.cert(config.firebase),
        databaseURL: 'https://tron-war-bot.firebaseio.com'
    }); 
}

module.exports = {
	db: admin.database()
}

