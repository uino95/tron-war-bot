// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const cron = require("node-cron");
const config = require("./config");
const backendLogic = require('./backendLogic');
const referral = require('./referral');
const social = require('./social');
const cohesion = require('./cohesion');

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);

console.log("[SCHEDULER]: Scheduling run updates...")
cron.schedule(config.test ? "0 */2 * * * *" : "0 0 6,18 * * *", social.runUpdate);

if (config.test) cron.schedule("*/20 * * * * *", cohesion.test);
