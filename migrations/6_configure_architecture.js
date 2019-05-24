var TronWarBot = artifacts.require("TronWarBot");
var WarCoin = artifacts.require("WarCoin");

module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  var twb = await TronWarBot.deployed();
  var war = await WarCoin.deployed();
  await war.addFrontend(twb.address, {from: accounts[1]});
  await twb.changeWarCoinContract(war.address, {from: accounts[1]});
};
