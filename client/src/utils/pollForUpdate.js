import store from '../store'

// function fetchTronWeb() {
//   let tronWeb = window.tronWeb
//   if (tronWeb === undefined) {
//     setTimeout(function () {
//       console.log('tronWeb not instanciated yet. retrying in 1 second...')
//       fetchTronWeb()
//     }, 1000)
//   } else {
//     store.commit('setTronWebInstance', tronWeb)
//     return tronWeb
//   }
// }

let pollForUpdate = async function () {
  let tronWeb = window.tronWeb
  console.log(tronWeb)
  if(tronWeb !== undefined){
    store.commit('setTronWebInstance', tronWeb)
    await store.dispatch('registerContractsInstance')
  }
  setInterval(async () => {
    if (store.state.tronWeb !== null) {
      // update current account
      try {
        const account = await store.state.tronWeb.trx.getAccount();
        const accountAddress = account.address; // HexString(Ascii)
        const accountAddressInBase58 = store.state.tronWeb.address.fromHex(accountAddress); // Base58

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
        const balanceInSun = await store.state.tronWeb.trx.getBalance(store.state.loggedInAccount); //number
        const balanceInTRX = store.state.tronWeb.fromSun(balanceInSun); //string
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
      const availableDividensInSun = await store.state.tronWeb.trx.getBalance(dividendPoolAddres);
      const availableTRXToBigNumber = store.state.tronWeb.BigNumber(availableDividensInSun.toString()) //number
      store.commit('setAvailableDividends', {
        availableDividends: availableTRXToBigNumber
      })

      // update total war balance supply
      const currentTotalWARSupply = await store.state.contracts.WarCoinInstance.totalSupply().call();
      store.commit('setTotalWarSupply', {
        totalWARSupply: store.state.tronWeb.BigNumber(currentTotalWARSupply)
      })


      // update current address war balance
      if (store.state.loggedInAccount !== null) {
        const currentWarBalanceInSun = await store.state.contracts.WarCoinInstance.balanceOf(store.state.loggedInAccount).call();
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: store.state.tronWeb.BigNumber(currentWarBalanceInSun)
        })
      } else {
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: store.state.tronWeb.BigNumber("0")
        })
      }

    } else {
      console.log('store.state.tronWeb not instanciated yet. retrying in 1 second...')
      tronWeb = window.tronWeb
      console.log(tronWeb)
      if(tronWeb !== undefined){
        store.commit('setTronWebInstance', tronWeb)
        await store.dispatch('registerContractsInstance')
      }
    }
  }, 4000)
}

export default pollForUpdate