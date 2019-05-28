var TronWarBot = artifacts.require("TronWarBot");
var WarCoin = artifacts.require("WarCoin");


module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  var admin = process.env.ADMIN_ADDRESS ||  ((accounts.length > 1) ? accounts[1]: accounts[0]);
  var from = (accounts.length > 1) ? accounts[1]: accounts[0];
  var twb = await TronWarBot.deployed();
  var war = await WarCoin.deployed();
  await war.addFrontend(twb.address, {from: from});
  await twb.changeWarCoinContract(war.address, {from: from});
};
