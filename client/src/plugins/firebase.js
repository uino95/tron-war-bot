import Vue from 'vue'
import Firebase from 'firebase'
import {rtdbPlugin} from 'vuefire'

Vue.use(rtdbPlugin)

let config = {
        apiKey: "AIzaSyBi8sg117ggZW_mYNMQBbaY0qyaWpvGqWg",
        authDomain: "tron-war-bot.firebaseapp.com",
        databaseURL: "https://tron-war-bot.firebaseio.com",
        projectId: "tron-war-bot",
        storageBucket: "tron-war-bot.appspot.com",
        messagingSenderId: "544798361307",
        appId: "1:544798361307:web:55edba6f788a0d39"
    };

const firebaseApp = Firebase.initializeApp(config);

export const db = firebaseApp.database();

