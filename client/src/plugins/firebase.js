import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/app'
import 'firebase/database'
import {rtdbPlugin} from 'vuefire'
import {test} from '../store'

Vue.use(rtdbPlugin)
let config
if(test){
    console.log("TEST MODE")
    // config = {
    //     apiKey: "AIzaSyC7n-39bx5kEnxZELCgxB2BIBNkElfUPWw",
    //     authDomain: "tron-war-bot-test.firebaseapp.com",
    //     databaseURL: "https://tron-war-bot-test.firebaseio.com",
    //     projectId: "tron-war-bot-test",
    //     storageBucket: "",
    //     messagingSenderId: "621094589680",
    //     appId: "1:621094589680:web:288901fe2878cbc7"
    // };
    config = {
        apiKey: "AIzaSyDWtnQWw5Fu7m-77Q_ApXzAeWNkJ8ckE7k",
        authDomain: "twb-backup-de2e5.firebaseapp.com",
        databaseURL: "https://twb-backup-de2e5.firebaseio.com",
        projectId: "twb-backup-de2e5",
        storageBucket: "twb-backup-de2e5.appspot.com",
        messagingSenderId: "927233292346",
        appId: "1:927233292346:web:821ed4352a0d5d4e421d03",
        measurementId: "G-Z18G4NWNVD"
      };
} else {
    config = {
        apiKey: "AIzaSyBi8sg117ggZW_mYNMQBbaY0qyaWpvGqWg",
        authDomain: "tron-war-bot.firebaseapp.com",
        databaseURL: "https://tron-war-bot.firebaseio.com",
        projectId: "tron-war-bot",
        storageBucket: "tron-war-bot.appspot.com",
        messagingSenderId: "544798361307",
        appId: "1:544798361307:web:55edba6f788a0d39"
    };
}

firebase.initializeApp(config);

export const db = firebase.database();

