// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const cron = require("node-cron");
const config = require("./config");
const referral = require('./referral');
const backendLogic = require('./backendLogic');

// console.log("[SCHEDULER]: Stop bets!")
// cron.schedule(config.test ? "*/30 * * * * *" : "0 */5 * * * *", backendLogic.stopBets);
console.log("[SCHEDULER]: Launch next turn!")
cron.schedule(config.test ? "*/30 * * * * *" : "0 */5 * * * *", backendLogic.launchNextTurn);

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);
