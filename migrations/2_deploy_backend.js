var WarCoin = artifacts.require("WarCoin");

module.exports = async function(deployer) {
  var war = await deployer.deploy(WarCoin, "https://tronwarbot.com");
};
