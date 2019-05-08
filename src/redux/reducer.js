import { combineReducers } from "redux";

import {
  SELECT_NATION
} from "./actions";

const merge = (prev, next) => Object.assign({}, prev, next);

const mapReducer = (state = [], action) => {
  switch (action.type) {
    case SELECT_NATION:
      return [...state, action.nation];
    default:
      return state;
  }
};

const reducer = combineReducers({
  nations: mapReducer
});

export default reducer;
