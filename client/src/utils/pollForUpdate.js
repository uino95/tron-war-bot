import store from '../store'
import tronWeb from 'tronweb'


async function pollTronWeb(interval){

  let tronWebPrivate
  
  let handle = setInterval(async () =>{
    tronWebPrivate = window.tronWeb
    if(tronWebPrivate.ready){
      clearInterval(handle)
      store.commit('setTronWebInstance', tronWebPrivate)
      await store.dispatch('registerContractsInstance')
      pollAccount(2000)
      pollBalance(2000)
      pollMyWar(4000)
    }
  }, interval)

}

function pollAccount(interval){
  setInterval(async () => {
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
  }, interval)
}

function pollBalance(interval){
  setInterval(async () => {
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
  }, interval)
}

async function pollDividends(interval){
  const tronWebPublic = new tronWeb({
    fullHost: 'https://api.trongrid.io', 
    privateKey: 'a548c2dda3cd5d0a5c8a484f9c0130aacd1c4fd185762caef13a45318647ca32',
  })
  const tronWarBotInstance = await tronWebPublic.contract().at(store.state.contracts.TronWarBotAddress)
  const warCoinInstance = await tronWebPublic.contract().at(store.state.contracts.WarCoinAddress)

  setInterval(async () => {
    try {
      // update available dividends
      const dividendPoolAddres = await tronWarBotInstance.divPoolAddress().call()
      const availableDividensInSun = await tronWebPublic.trx.getBalance(dividendPoolAddres);
      const availableTRXToBigNumber = tronWebPublic.BigNumber(availableDividensInSun.toString()) //number
      store.commit('setAvailableDividends', {
        availableDividends: availableTRXToBigNumber
      })
    } catch (error) {
      console.log("error is here in dividends ", error)
    }
    try{
      // update total war balance supply
      const currentTotalWARSupply = await warCoinInstance.totalSupply().call();
      store.commit('setTotalWarSupply', {
        totalWARSupply: tronWebPublic.BigNumber(currentTotalWARSupply)
      })
    } catch (error) {
      console.log("error is here IN TOTAL WAR BALANCE ", error)
    }
  }, interval)
}

function pollMyWar(interval){
  setInterval(async() => {
    try{
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
    } catch (error) {
      console.log("error is here in MY WAR ", error)
    }
  }, interval) 
}


const pollForUpdate = async function () {

  pollTronWeb(500)
  pollDividends(4000)
}

export default pollForUpdate
