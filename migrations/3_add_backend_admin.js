var WarCoin = artifacts.require("WarCoin");

module.exports = async function(deployer) {
  var war = await WarCoin.deployed();
  // await war.addBackendAdmin(accounts[1]);
};
