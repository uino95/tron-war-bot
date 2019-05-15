import { all } from "redux-saga/effects";

import handleWebSocket from './handleWebSocket'

export function* rootSaga() {
  yield all([
  		handleWebSocket()
  	]);
}
