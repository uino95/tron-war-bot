var Migrations = artifacts.require("./Migrations.sol");

module.exports = async function(deployer, net, from) {
  var accounts = await tronWrap._getAccounts();
  console.log("Using account: " + accounts[0]);
  var r = await tronWrap.trx.getAccountResources();
  if (!r.TotalEnergyWeight) {
    console.log("ADDING ENERGY...")
    var b = await tronWrap.trx.getBalance();
    await tronWrap.trx.freezeBalance((b/3).toString(), 3, "ENERGY");
    await tronWrap.trx.freezeBalance((b/3).toString(), 3, "BANDWIDTH");
  }
  await deployer.deploy(Migrations);
};
