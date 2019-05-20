var TronWarBot = artifacts.require("TronWarBot");

module.exports = async function(deployer) {
  var twb = await TronWarBot.deployed();
  // await twb.addFrontendAdmin(accounts[1], {from: accounts[0]});
};
