import { createStore, applyMiddleware} from "redux";
import createSagaMiddleware from "redux-saga";

import { rootSaga } from "../sagas";
import reducer from "./reducer";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducer, applyMiddleware(sagaMiddleware));

console.log("STATE: ", store.getState());

sagaMiddleware.run(rootSaga);

export default store;
