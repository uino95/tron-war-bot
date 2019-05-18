import { createSelector } from "reselect";

export const selectedNations = state => state.map.selectedNations;
export const nations = state => state.map.nations;
export const bets = state => state.bets