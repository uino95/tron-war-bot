var twb;TronWarBot.deployed().then(r=>twb=r);
var war;WarCoin.deployed().then(r=>war=r);



var accounts;tronWrap._getAccounts().then(r=>accounts=r)
tronWeb.trx.getBalance(accounts[0]).then(r=>tronWrap.fromSun(r.toString()))
tronWeb.trx.getBalance(accounts[1]).then(r=>tronWrap.fromSun(r.toString()))
tronWeb.trx.getBalance(accounts[2]).then(r=>tronWrap.fromSun(r.toString()))
tronWeb.trx.getBalance(accounts[3]).then(r=>tronWrap.fromSun(r.toString()))
tronWeb.trx.getBalance(accounts[4]).then(r=>tronWrap.fromSun(r.toString()))

twb.setHouseAddress(accounts[3])

twb.startGame(0,false);
twb.startGame(1,true);


twb.bet(0,32,54,{callValue:tronWrap.toSun(100)})
twb.bet(1,32,54,{callValue:tronWrap.toSun(250)})

twb.houseReserves().then(r=>tronWrap.fromSun(r.toString()))
twb.jackpot(0).then(r=>tronWrap.fromSun(r.toString()))
twb.jackpot(1).then(r=>tronWrap.fromSun(r.toString()))

twb.roundFunds(0,1)
twb.roundFunds(1,1)


twb.payout(0,1,accounts[4], tronWrap.toSun(100));
twb.payout(1,1,accounts[4], tronWrap.toSun(100));


twb.endGame(0,tronWrap.toSun(0.1));
twb.endGame(1,tronWrap.toSun(0));


twb.deposit({callValue: tronWrap.toSun(500)})

tronWeb.trx.getTransactionInfo()
tronWeb.trx.getBalance(war.address).then(r=>tronWrap.fromSun(r.toString()))
tronWeb.trx.getBalance(twb.address).then(r=>tronWrap.fromSun(r.toString()))


tronWeb.trx.send(twb.address, tronWrap.toSun(1))
