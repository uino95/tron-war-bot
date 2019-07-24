import store from '../store'

let pollForUpdate = function () {
  let tronWeb = window.tronweb
  store.commit('setTronweb', tronWeb)
  store.dispatch('registerContractsInstance') 
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
        const balanceNumber = parseFloat(balanceInTRX).toFixed(3) 
        if (balanceNumber !== store.state.accountBalance){
          store.commit('setAccountBalance', {
            accountBalance: balanceNumber
          })
        }
      } else {
        store.commit('setAccountBalance', {
          accountBalance: -1
        })
      }
      

      // update available dividends
      const dividendPoolAddres = await store.state.contracts.TronWarBotInstance.divPoolAddress().call()
      const availableDividensInSun = await tronWeb.trx.getBalance(dividendPoolAddres) / 1000000000000000000; //number
      // const availableDividensInTRX = tronWeb.fromSun(availableDividensInSun) ; //string
      const availableDividendsFixed = availableDividensInSun.toFixed(3)
      console.log(availableDividendsFixed)
      if (availableDividendsFixed !== store.state.availableDividens){
        store.commit('setAvailableDividends', {
          availableDividends: availableDividendsFixed
        })
      }

      // update total war balance supply
      const currentTotalWARSupply = await store.state.contracts.WarCoinInstance.totalSupply().call()  ;
      const currentTotalWARSupplyInTRX = tronWeb.fromSun(currentTotalWARSupply)
      const currentTotalWARSupplyFixed = parseFloat(currentTotalWARSupplyInTRX).toFixed(3) 
      if (currentTotalWARSupplyFixed !== store.state.totalWARSupply) {
        store.commit('setTotalWarSupply', {
          totalWARSupply: currentTotalWARSupplyFixed
        })
      }

      // update current address war balance
      if(store.state.loggedInAccount !== null){
        const currentWarBalanceInSun = await store.state.contracts.WarCoinInstance.balanceOf(store.state.loggedInAccount).call();
        const currentWarBalanceInTRX = tronWeb.fromSun(currentWarBalanceInSun)
        const currentWarBalanceFixed = parseFloat(currentWarBalanceInTRX).toFixed(3) 
        if (currentWarBalanceFixed !== store.state.currentAddressWarBalance) {
          store.commit('setCurrentAddressWarBalance', {
            currentAddressWarBalance: currentWarBalanceFixed
          })
        }
      } else {
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: 0
        })
      }


    } else {
      tronWeb = window.tronWeb
      if(store.state.contracts.WarCoinInstance == null){
        store.dispatch('registerContractsInstance') 
      }
    }
  }, 4000)
}

export default pollForUpdate