// action types
export const SELECT_NATION = "SELECT_NATION";
export const MAP_UPDATED = "MAP_UPDATED";
//export const DB_UPDATED = "DB_UPDATED";

// action creators
export function selectNation(nation) {
  return {
    type: SELECT_NATION,
    nation: nation
  };
}

export function updateMap(nations) {
	return {
		type: MAP_UPDATED,
		nations: nations
	}
}

// export function updateDb() {
// 	return {
// 		type: DB_UPDATED
// 	}
// }