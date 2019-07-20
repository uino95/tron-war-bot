import store from '../store'

let pollForUpdate = function () {
  let tronWeb = window.tronweb
  setInterval(async () => {
    if (tronWeb) {
      // update current account
      try{
        const account = await tronWeb.trx.getAccount();
        const accountAddress = account.address; // HexString(Ascii)
        const accountAddressInBase58 = tronWeb.address.fromHex(accountAddress); // Base58
        
        if (accountAddressInBase58 !== store.state.loggedInAccount) {
          store.commit('setLoggedInAccount', {
            accountAddress: accountAddressInBase58
          })
        }
      } catch (error){
        store.commit('setLoggedInAccount', {
          accountAddress: null
        })
      }

      // update current account balance 
      if(store.state.loggedInAccount !== null){
        const balanceInSun = await tronWeb.trx.getBalance(store.state.loggedInAccount); //number
        const balanceInTRX = tronWeb.fromSun(balanceInSun); //string
        if (balanceInTRX !== store.state.accountBalance){
          store.commit('setAccountBalance', {
            accountBalance: balanceInTRX
          })
        }
      } else {
        store.commit('setAccountBalance', {
          accountBalance: -1
        })
      }
      

      // update available dividends
      const availableDividensInSun = await tronWeb.trx.getBalance(store.state.accountOperator); //number
      const availableDividensInTRX = tronWeb.fromSun(availableDividensInSun); //string
      if (availableDividensInTRX !== store.state.availableDividens){
        store.commit('setAvailableDividends', {
          availableDividends: availableDividensInTRX
        })
      }

      // update current address war balance
      if(store.state.loggedInAccount !== null){
        const currentWarBalanceInSun = await store.state.contracts.WarCoinInstance.balanceOf(store.state.loggedInAccount).call();
        const currentWarBalanceInTRX = tronWeb.fromSun(currentWarBalanceInSun)
        if (currentWarBalanceInTRX !== store.state.currentAddressWarBalance) {
          store.commit('setCurrentAddressWarBalance', {
            currentAddressWarBalance: currentWarBalanceInTRX
          })
        }
      } else {
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: 0
        })
      }
    } else {
      tronWeb = window.tronWeb
    }
  }, 2000)
}

export default pollForUpdate