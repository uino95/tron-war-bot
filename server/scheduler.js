// HERE GO ALL THE SCHEDULED TASKS ENTRY POINTS

/////////////////////////////////////////////// CRON SCHEDULER ////////////////////////////////////////////

const cron = require("node-cron");
const config = require("./config");
const referral = require('./referral');
const backendLogic = require('./backendLogic');

let m = Math.ceil(config.timing.turn / 60);
let s = config.timing.turn - ((m-1)*60);
const CRON_TURN_STRING = ((m-1) ? "0" : ("*/" + s) ) + " *"+ ((m-1) ? ("/"+m) : "") +" * * * *"

console.log("[SCHEDULER]: Launch next turn as: " +  CRON_TURN_STRING)
cron.schedule(CRON_TURN_STRING, backendLogic.launchNextTurn);

console.log("[SCHEDULER]: Scheduling referral payout at every hour...")
cron.schedule("0 0 1 * * *", referral.payReferrals);
