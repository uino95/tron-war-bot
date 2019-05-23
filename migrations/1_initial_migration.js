var Migrations = artifacts.require("./Migrations.sol");

module.exports = async function(deployer) {
  await tronWrap.trx.freezeBalance(tronWrap.toSun(1000), 3, "ENERGY");
  deployer.deploy(Migrations);
};
