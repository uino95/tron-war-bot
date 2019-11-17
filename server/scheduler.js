// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const cron = require("node-cron");
const config = require("./config");
const backendLogic = require('./backendLogic');
const referral = require('./referral');
const social = require('./social');
const cohesion = require('./cohesion');
const wwb = require('./worldWarBot');

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);

// if (config.test) cron.schedule("*/20 * * * * *", social.shares.test);

console.log("[SCHEDULER]: Scheduling social run updates...")
wwb.onTurn(social.runUpdate);
