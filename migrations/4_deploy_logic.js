var TronWarBot = artifacts.require("TronWarBot");

module.exports = async function(deployer) {
  var twb = await deployer.deploy(TronWarBot);
};
