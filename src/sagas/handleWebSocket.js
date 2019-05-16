import { all, call, put, spawn, takeEvery, select } from "redux-saga/effects";
import socketIOClient from "socket.io-client";
import {NEW_BET} from '../redux/actions'
let socket 

function emitBetEvent(action){

 	socket.emit("newBet", action.bet)
}

 function handleEvent(data){
 	console.log(data)
 }

function registerListeners(){
	socket.on("sendSocketid", data => handleEvent(data));
	socket.on("sendSocketIdResp", data => handleEvent(data));
}

function* handleWebSocket() {
	
	const endpoint = "http://localhost:4000";
	socket = yield call(socketIOClient, endpoint);

	registerListeners();

  yield all([
    takeEvery(NEW_BET, emitBetEvent)
  ]);
}

export default handleWebSocket;
