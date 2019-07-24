// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const referral = require('./referral');
const cron = require("node-cron");

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("1 1 1 * * *", referral.payReferrals);
