var WarCoin = artifacts.require("WarCoin");

module.exports = async function(deployer) {
  var url = process.env.TOKEN_URI || "https://tronwarbot.com";
  var accounts = await tronWrap._getAccounts();
  var war = await deployer.deploy(WarCoin, url);
};
