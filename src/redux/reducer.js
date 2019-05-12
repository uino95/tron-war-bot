import { combineReducers } from "redux";

import {
  SELECT_NATION,
  MAP_UPDATED
} from "./actions";

const merge = (prev, next) => Object.assign({}, prev, next);

const initialState={
	selectedNations:[],
	nations:[]
}

const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_NATION:
    	if(state.selectedNations.includes(action.nation)) 
    		return {
    			selectedNations: state.selectedNations.filter(nation => action.nation != nation),
    			nations: state.nations
    		}
    	else 
    		return {
	    		selectedNations: [...state.selectedNations, action.nation],
	    		nations: state.nations
    		}
    case MAP_UPDATED:
		return {
			selectedNations: [],
			nations: action.nations
		}
		
    default:
      return state;
  }
};

const reducer = combineReducers({
  map: mapReducer
});

export default reducer;
