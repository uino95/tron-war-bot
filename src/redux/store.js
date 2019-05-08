import { createStore} from "redux";

import reducer from "./reducer";

const store = createStore(reducer);

console.log("STATE: ", store.getState());

export default store;
