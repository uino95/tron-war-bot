// action types
export const SELECT_NATION = "SELECT_NATION";

// action creators
export function selectNation(nation) {
  return {
    type: SELECT_NATION,
    nation: nation
  };
}