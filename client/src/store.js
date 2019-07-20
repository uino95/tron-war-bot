import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const test = true;

export default new Vuex.Store({
  state: {
    loggedInAccount: null,
    accountBalance: -1,
    selectedCountry: null,
    isMobile: false,
    test: test, //REMEBER TO SWITCH TO FALSE
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
    }
  },
  actions: {
    async updateLoggedInAccount(context) {
      const account = await window.tronWeb.trx.getAccount();
      const accountAddress = account.address; // HexString(Ascii)
      const accountAddressInBase58 = window.tronWeb.address.fromHex(accountAddress); // Base58
      context.commit('setLoggedInAccount', {
        accountAddress: accountAddressInBase58
      })
    },
    async updateAccountBalance(context) {
      const balanceInSun = await window.tronWeb.trx.getBalance(); //number
      const balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
      // const changeBackToSun = window.tronWeb.toSun(balanceInTRX); //string
      context.commit('setAccountBalance', {
        accountBalance: balanceInTRX
      })
    },
  }
})
