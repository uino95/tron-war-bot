var WarCoin = artifacts.require("WarCoin");

module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  if (!process.env.ADMIN_ADDRESS && accounts.length < 2) return;
  var admin = process.env.ADMIN_ADDRESS ||  ((accounts.length > 1) ? accounts[1]: accounts[0]);
  var war = await WarCoin.deployed();
  await war.addBackendAdmin(admin);
};
