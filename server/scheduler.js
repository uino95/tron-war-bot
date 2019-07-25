// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const referral = require('./referral');
const backendLogic = require('./backendLogic');
const cron = require("node-cron");

console.log("[SCHEDULER]: Launch next turn!")
cron.schedule("0 */5 * * * *", backendLogic.launchNextTurn);

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);
