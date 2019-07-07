import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedInAccount: null,
    accountBalance: -1,
    selectedCountry: -1
  },
  mutations: {
    setLoggedInAccount(state, payload) {
      state.loggedInAccount = payload.accountAddress
    },
    setAccountBalance(state, payload) {
      state.accountBalance = payload.balance
    },
    setSelectedCountry(state, payload) {
      state.selectedCountry = payload.country
    }
  }
})
