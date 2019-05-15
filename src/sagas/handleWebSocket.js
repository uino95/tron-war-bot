import { all, call, put, spawn, takeEvery, select } from "redux-saga/effects";
import socketIOClient from "socket.io-client";

function handleEvent(data){
	console.log(data)
}

function* handleWebSocket() {
	const endpoint = "http://localhost:4000";

	const socket = yield call(socketIOClient, endpoint);

    socket.on("sendSocketid", data => handleEvent(data));
  

  yield all([
    
  ]);
}

export default handleWebSocket;
