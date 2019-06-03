let TronWeb = require('tronweb')

const tronweb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: process.env.PRIVATE_KEY
})

const contract_address = "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e"
async function callContract(){
  let contract = await tronweb.contract().at(contract_address)
  console.log(contract)
  let returnValue = await contract.setGameParams(0, tronweb.toSun(0.2), tronweb.toSun(1), tronweb.toSun(1)).send()
  console.log(returnValue)
  let c = await tronweb.trx.getTransactionInfo(returnValue)
  console.log(c)
}

callContract()
