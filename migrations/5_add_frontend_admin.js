var TronWarBot = artifacts.require("TronWarBot");


module.exports = async function(deployer) {
  var accounts = await tronWrap._getAccounts();
  var admin = process.env.ADMIN_ADDRESS;
  if (!admin && accounts.length < 2) return;
  if (!admin) admin = (accounts.length > 1) ? accounts[1]: accounts[0];
  var twb = await TronWarBot.deployed();
  await twb.addFrontendAdmin(admin);
};
