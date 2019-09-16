// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const cron = require("node-cron");
const config = require("./config");
const backendLogic = require('./backendLogic');
const referral = require('./referral');
const social = require('./social');

console.log("[SCHEDULER]: Simulate turn")
cron.schedule(config.test ? "15,45 * * * * *" : "45 */10 * * * *", backendLogic.simulateNextTurn);

console.log("[SCHEDULER]: Launch next turn")
cron.schedule(config.test ? "*/30 * * * * *" : "0 */10 * * * *", backendLogic.launchNextTurn);

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);

console.log("[SCHEDULER]: Scheduling run updates...")
cron.schedule(config.test ? "0 */2 * * * *" : "0 0 6,18 * * *", social.runUpdate);
