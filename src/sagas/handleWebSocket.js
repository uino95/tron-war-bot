import { all, call, put, spawn, takeEvery, select } from "redux-saga/effects";
import socketIOClient from "socket.io-client";

function handleEvent(data){

}

function* handleWebSocket() {
	const endpoint = "";

	const socket = yield call(socketIOClient, endpoint);

    socket.on("nomeEvento", data => handleEvent(data));
  

  yield all([
    
  ]);
}

export default handleRequestSaga;
