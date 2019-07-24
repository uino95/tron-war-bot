import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const test = false; //REMEBER TO SWITCH TO FALSE

export default new Vuex.Store({
  state: {
    loggedInAccount: null,
    accountBalance: -1,
    selectedCountry: null,
    isMobile: false,
    test: test, 
    contracts:{
      WarCoinAddress: test ? "TJ6kbSxQ8ctPGuHmRb3W92gUN42AooHeNt" : "TTbPmiq35XjAhQThatnukS45pNYd7xV2m1",
      TronWarBotAddress: test ? "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e" : "TQXiV4TeKS4zF54PiCsUyKTQ22yYY6KuzL",
      WarCoinInstance: null,
      TronWarBotInstance: null
    },
    currentAddressWarBalance: 0,
    availableDividends: 0,
    accountOperator: "TPisPeMpZALp41Urg6un6S4kJJSZdtw6Kw",
    totalWARSupply: 0
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
    setIsMobile(state, value){
      state.isMobile = value
    },
    setContractsInstance(state, payload){
      state.contracts.TronWarBotInstance = payload.tronWarBot
      state.contracts.WarCoinInstance = payload.warCoin
    },
    setAvailableDividends(state, payload) {
      state.availableDividends = payload.availableDividends
    },
    setCurrentAddressWarBalance(state, payload) {
      state.currentAddressWarBalance = payload.currentAddressWarBalance
    },
    setTotalWarSupply(state, payload){
      state.totalWARSupply = payload.totalWARSupply
    }
  },
  actions: {
    async registerContractsInstance({commit, state}){
      const tronWarBotInstance = await window.tronWeb.contract().at(state.contracts.TronWarBotAddress)
      const warCoinInstance = await window.tronWeb.contract().at(state.contracts.WarCoinAddress)
      commit('setContractsInstance', {
        warCoin: warCoinInstance,
        tronWarBot: tronWarBotInstance
      })
    } 
  }
})
