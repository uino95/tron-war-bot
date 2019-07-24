import store from '../store'

let pollForUpdate = function () {
  let tronWeb = window.tronweb
  store.dispatch('registerContractsInstance')
  setInterval(async () => {
    if (tronWeb) {
      // update current account
      try {
        const account = await tronWeb.trx.getAccount();
        const accountAddress = account.address; // HexString(Ascii)
        const accountAddressInBase58 = tronWeb.address.fromHex(accountAddress); // Base58

        if (accountAddressInBase58 !== store.state.loggedInAccount) {
          store.commit('setLoggedInAccount', {
            accountAddress: accountAddressInBase58
          })
        }
      } catch (error) {
        store.commit('setLoggedInAccount', {
          accountAddress: null
        })
      }

      // update current account balance 
      if (store.state.loggedInAccount !== null) {
        const balanceInSun = await tronWeb.trx.getBalance(store.state.loggedInAccount); //number
        const balanceInTRX = tronWeb.fromSun(balanceInSun); //string
        const balanceNumber = parseFloat(balanceInTRX).toFixed(3)
        if (balanceNumber !== store.state.accountBalance) {
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
      const availableDividensInSun = await tronWeb.trx.getBalance(dividendPoolAddres);
      const availableTRXToBigNumber = tronWeb.BigNumber(availableDividensInSun.toString()) //number
      store.commit('setAvailableDividends', {
        availableDividends: availableTRXToBigNumber
      })

      // update total war balance supply
      const currentTotalWARSupply = await store.state.contracts.WarCoinInstance.totalSupply().call();
      store.commit('setTotalWarSupply', {
        totalWARSupply: currentTotalWARSupply
      })


      // update current address war balance
      if (store.state.loggedInAccount !== null) {
        const currentWarBalanceInSun = await store.state.contracts.WarCoinInstance.balanceOf(store.state.loggedInAccount).call();
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: currentWarBalanceInSun
        })
      } else {
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: tronWeb.BigNumber("0")
        })
      }

    } else {
      tronWeb = window.tronWeb
      if (store.state.contracts.WarCoinInstance == null) {
        store.dispatch('registerContractsInstance')
      }
    }
  }, 4000)
}

export default pollForUpdate