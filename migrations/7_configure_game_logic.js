var TronWarBot = artifacts.require("TronWarBot");
var WarCoin = artifacts.require("WarCoin");


module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  var admin = process.env.ADMIN_ADDRESS ||  ((accounts.length > 1) ? accounts[1]: accounts[0]);
  var divPool = (accounts.length > 2) ? accounts[2]: accounts[0];
  var from = (accounts.length > 1) ? accounts[1]: accounts[0];
  var twb = await TronWarBot.deployed();
  var war = await WarCoin.deployed();
  await twb.setHouseAddress(admin, {from: from});
  await twb.setDivPoolAddress(divPool, {from: from});
  await twb.setHouseMiningRate(tronWrap.toSun(1), {from: from});
  await twb.setDividendsToProfitsRate(tronWrap.toSun(0.5), {from: from});
  await twb.setGameParams(0, tronWrap.toSun(0.2), tronWrap.toSun(50), tronWrap.toSun(500000), {from: from});
  await twb.setGameParams(1, tronWrap.toSun(0.05), tronWrap.toSun(50), tronWrap.toSun(500), {from: from});
};
