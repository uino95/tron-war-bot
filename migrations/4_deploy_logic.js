var TronWarBot = artifacts.require("TronWarBot");

module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  var twb = await deployer.deploy(TronWarBot);
};
