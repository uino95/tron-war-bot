import store from '../store'
import tronWeb from 'tronweb'

const masterAddress = "TVUEuVpq2jWMTJDsgxHVyeFK78Qnddpmsx"
let tronWebPublic
let tronWarBotInstance
let warCoinInstance

async function pollTronWeb(interval) {

  let tronWebPrivate

  let handle = setInterval(async () => {
    tronWebPrivate = window.tronWeb
    try {
      if (tronWebPrivate.ready) {
        clearInterval(handle)
        store.commit('setTronWebInstance', tronWebPrivate)
        pollAccount(2000)
        pollBalance(2000)
        await store.dispatch('registerContractsInstance')
      }
    } catch (error) {
      console.log('tronweb not found')
    }
  }, interval)

}

function pollAccount(interval) {
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
      console.log(error)
      store.commit('setLoggedInAccount', {
        accountAddress: null
      })
    }
  }, interval)
}

function pollJackpot(interval) {
  setInterval(async () => {
    try {
      const jackpot = await tronWarBotInstance.jackpot("0").call()
      const jackPotBigNumber = tronWebPublic.BigNumber(jackpot.toString())
      if (store.state.jackpot == null || jackPotBigNumber.toString() != store.state.jackpot.toString() ) {
        store.commit('setJackpot', {
          jackpot: jackPotBigNumber
        })
      }
    } catch (error) {
      console.log(error)
    }
  },interval)
}

function pollBalance(interval) {
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

  let dividendsInterval = setInterval(async () => {
    try {
      if (store.state.pollDivsEndend) {
        clearInterval(dividendsInterval)
      }
      // update available dividends
      const availableDividensInSunFromHouseReserves = await tronWarBotInstance.houseReserves().call()
      const availableDividensInSunFromMaster = await tronWebPublic.trx.getBalance(masterAddress);
      const houseReserves = tronWebPublic.BigNumber(availableDividensInSunFromHouseReserves.toString())
      const masterBalance = tronWebPublic.BigNumber(availableDividensInSunFromMaster.toString())
      console.log('masterBalance ', tronWebPublic.fromSun(masterBalance).toString())
      console.log('houseReserves ', tronWebPublic.fromSun(houseReserves).toString())
      const availableDividensInSun = houseReserves.plus(masterBalance)
      store.commit('setAvailableDividends', {
        availableDividends: availableDividensInSun
      })
    } catch (error) {
      console.log("error is here in dividends ", error)
    }
  }, interval)
}

function pollMyWar(interval) {
  let warInterval = setInterval(async () => {
    try {
      if (store.state.pollDivsEndend) {
        clearInterval(warInterval)
      }
      const currentTotalWARSupply = await warCoinInstance.totalSupply().call();
      store.commit('setTotalWarSupply', {
        totalWARSupply: tronWebPublic.BigNumber(currentTotalWARSupply)
      })
    } catch (error) {
      console.log("error is here in TOTAL WAR SUPPLY ", error)
    }
    try{
      // update current address war balance
      if (store.state.loggedInAccount !== null) {
        const currentWarBalanceInSun = await warCoinInstance.balanceOf(store.state.loggedInAccount).call();
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: tronWebPublic.BigNumber(currentWarBalanceInSun)
        })
      } else {
        store.commit('setCurrentAddressWarBalance', {
          currentAddressWarBalance: tronWebPublic.BigNumber("0")
        })
      }
    } catch (error) {
      console.log("error is here in MY WAR ", error)
    }
  }, interval)
}

export function startPolling(interval){
  pollMyWar(interval)
  pollDividends(interval)
}

async function getGameParams() {
  try {
    const finalBetParams = await tronWarBotInstance.gameParams(0).call()
    const betNextParams = await tronWarBotInstance.gameParams(1).call()
    const betBattleParams = await tronWarBotInstance.gameParams(2).call()
    store.commit('setGameParams', {
      finalBetParams: {
        houseEdge: tronWeb.fromSun(finalBetParams.houseEdge),
        minimumBet: tronWeb.fromSun(finalBetParams.minimumBet),
        maximumBet: tronWeb.fromSun(finalBetParams.maximumBet)
      },
      betNextParams: {
        houseEdge: tronWeb.fromSun(betNextParams.houseEdge),
        minimumBet: tronWeb.fromSun(betNextParams.minimumBet),
        maximumBet: tronWeb.fromSun(betNextParams.maximumBet)
      },
      betBattleParams: {
        houseEdge: tronWeb.fromSun(betBattleParams.houseEdge),
        minimumBet: tronWeb.fromSun(betBattleParams.minimumBet),
        maximumBet: tronWeb.fromSun(betBattleParams.maximumBet)
      }
    })
  } catch {
    console.log("something went wrong while retrieving game Params ", error)
  }
}

const pollForUpdate = async function () {

  tronWebPublic = new tronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: 'a548c2dda3cd5d0a5c8a484f9c0130aacd1c4fd185762caef13a45318647ca32',
  })

  tronWarBotInstance = await tronWebPublic.contract().at(store.state.contracts.TronWarBotAddress)
  warCoinInstance = await tronWebPublic.contract().at(store.state.contracts.WarCoinAddress)

  getGameParams()
  pollTronWeb(500)
  pollJackpot(2000)
}

export default pollForUpdate