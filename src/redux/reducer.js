import { combineReducers } from "redux";

import {
  SELECT_NATION
} from "./actions";

const merge = (prev, next) => Object.assign({}, prev, next);

const mapReducer = (state = [], action) => {
  switch (action.type) {
    case SELECT_NATION:
      if(state.includes(action.nation)) return state.filter(nation => action.nation != nation)
      else return [...state, action.nation]
    default:
      return state;
  }
};

const reducer = combineReducers({
  nations: mapReducer
});

export default reducer;
