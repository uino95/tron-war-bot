import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const test = true; //REMEBER TO SWITCH TO FALSE

export default new Vuex.Store({
  state: {
    loggedInAccount: null,
    accountBalance: -1,
    selectedCountry: null,
    battleChoice: null,
    isMobile: false,
    test: test, 
    contracts:{
      WarCoinAddress: test ? "TJ6kbSxQ8ctPGuHmRb3W92gUN42AooHeNt" : "TTbPmiq35XjAhQThatnukS45pNYd7xV2m1",
      TronWarBotAddress: test ? "TYUyBmkVZdtftSJf9c5StD8rMXFf37thab" : "TY7KWcSvmwA1J7pCy42S1wBbf9c1siCkMo",
      WarCoinInstance: null,
      TronWarBotInstance: null
    },
    currentAddressWarBalance: 0,
    //availableDividends: 0,
    totalWARSupply: 0,
    tronWeb: null,
    gameParams:{
      finalBetParams: null,
      betNextParams: null,
      betBattleParams: null
    },
    pollWarEndend: false
  },
  mutations: {
    setLoggedInAccount(state, payload) {
      state.loggedInAccount = payload.accountAddress
    },
    setAccountBalance(state, payload) {
      state.accountBalance = payload.accountBalance
    },
    setSelectedCountry(state, payload) {
      state.selectedCountry = payload
    },
    setBattleChoice(state, battleChoice){
      state.battleChoice = battleChoice
    },
    setIsMobile(state, value){
      state.isMobile = value
    },
    setContractsInstance(state, payload){
      state.contracts.TronWarBotInstance = payload.tronWarBot
      state.contracts.WarCoinInstance = payload.warCoin
    },
    // setAvailableDividends(state, payload) {
    //   state.availableDividends = payload.availableDividends
    // },
    setCurrentAddressWarBalance(state, payload) {
      state.currentAddressWarBalance = payload.currentAddressWarBalance
    },
    setTotalWarSupply(state, payload){
      state.totalWARSupply = payload.totalWARSupply
    },
    setTronWebInstance(state, payload){
      console.log("tronweb set")
      state.tronWeb = payload
    },
    setGameParams(state,payload){
      state.gameParams.finalBetParams = payload.finalBetParams
      state.gameParams.betNextParams = payload.betNextParams
      state.gameParams.betBattleParams = payload.betBattleParams
    },
    setPollWar(state, payload){
      state.pollWarEndend = payload
    }
  },
  actions: {
    async registerContractsInstance({commit, state}){
      const tronWarBotInstance = await state.tronWeb.contract().at(state.contracts.TronWarBotAddress)
      const warCoinInstance = await state.tronWeb.contract().at(state.contracts.WarCoinAddress)
      console.log("setting contracts instances")
      commit('setContractsInstance', {
        warCoin: warCoinInstance,
        tronWarBot: tronWarBotInstance
      })
    } 
  }
})
