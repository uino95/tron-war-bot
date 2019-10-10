const config = require('./config')
const utils = require('./utils')
const q = require('./utils/quotes')
const firebase = require('./firebase')
const wwb = require('./worldWarBot')
const telegram = require('./utils/telegram')
const facebook = require('./utils/facebook')

const STATS_UPDATE_FREQ = 50
const NEW_UPDATE_FREQ = 25
const QUOTES_FREQ = 150

var history=[];
var epic = [];
var insurrections = [];
var partials = {};

const runUpdate = async (cmap, td) => {
  if (!(td.turn % STATS_UPDATE_FREQ)) stats(td);
  else if (!(td.turn % QUOTES_FREQ)) quotes(td);
  battleUpdate(cmap, td);
}

const quotes = async (td) => {
  let i = (td.turn-QUOTES_FREQ)/(QUOTES_FREQ*2);
  if (!q[i]) return;
  let f = "“"+q[i][0] + "”\ncit. " + q[i][1];
  f += "\n\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"
  await facebook.post(f).catch(console.error);
}

const stats = async (td) =>{
  history = await firebase.history.orderByChild('turn').limitToLast(STATS_UPDATE_FREQ).once("value").then(r=>r.val());
  let u = {}
  let civilWar = []
  let cmap = await wwb.mapState();
  Object.values(history).forEach(r=>{
    if (!r.battle) return;
    r = r.battle;
    if (r.civilWar) civilWar.push(utils.universalMap(r.o));
    u[r.d] = u[r.d] || { id: r.d }
    u[r.d].ic = u[r.d].ic || r.cohesion.d;
    u[r.d].fc = cmap[r.d].cohesion
    u[r.d].wt = (u[r.d].wt || 0) - (r.result%2) + (Math.floor(r.result/2))
    u[r.o] = u[r.o] || { id: r.o }
    u[r.o].ic = u[r.o].ic || r.cohesion.o;
    u[r.o].fc = cmap[r.o].cohesion
    u[r.o].wt = (u[r.o].wt || 0) + (r.result%2) - (Math.floor(r.result/2))
  })

  let top3 = Object.values(u).sort(function(a, b){return b.wt - a.wt});
  let j = await firebase.data.once("value").then(r=>r.val()['jackpot']);
  let leaderboard = wwb.leaderboard();
  let countriesStillAlive = wwb.countriesStillAlive();

  let t = buildTgStats(td, leaderboard, countriesStillAlive, j, top3, civilWar);
  let m = { 'inline_keyboard': [[{'text': '🌎 Place a bet now', 'url': 'https://tronwarbot.com'}]]};
  await telegram.sendMessage(t, {parse_mode: "HTML", reply_markup: m, disable_web_page_preview: true}).catch(console.error);

  let f = buildFbStats(td, leaderboard, countriesStillAlive, j, top3, civilWar);
  await facebook.post(f).catch(console.error);
}

const buildFbStats = (td, leaderboard, countriesStillAlive, j, top3, civilWar) => {
  // FACEBOOK
  let f = "♟ Tron World War ⚔️ " + td.turn +" ♟\n\n"
  f +="🎖🎖 TOP 5 ARMIES 🎖🎖\n"
  f += "🥇 " + leaderboard[0].territories + " territories -\t" + utils.universalMap(leaderboard[0].idx) + "\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  f += "🥈 " + leaderboard[1].territories + " territories -\t" + utils.universalMap(leaderboard[1].idx) + "\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  f += "🥉 " + leaderboard[2].territories + " territories -\t" + utils.universalMap(leaderboard[2].idx) + "\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  f += "4th " + leaderboard[3].territories + " territories -\t" + utils.universalMap(leaderboard[3].idx) + "\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  f += "5th " + leaderboard[4].territories + " territories -\t" + utils.universalMap(leaderboard[4].idx) + "\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  f += "\n🌎 " + countriesStillAlive.length + " countries in the game!\n\n"
  f += "\n🕛 12 HOURS BREAK: 🕛\n"
  f += "\n👍 BEST 3 👍\n"
  f +=  "+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].fc-top3[0].ic) +")\n"
  f +=  "+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].fc-top3[1].ic) +")\n"
  f +=  "+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].fc-top3[2].ic) +")\n"
  top3.reverse();
  f += "\n🔻 WORST 3 🔻\n"
  f +=  top3[0].wt + " " + utils.universalMap(top3[0].id) +  "  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].fc-top3[0].ic) +")\n"
  f +=  top3[1].wt + " " + utils.universalMap(top3[1].id) +  "  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].fc-top3[1].ic) +")\n"
  f +=  top3[2].wt + " " + utils.universalMap(top3[2].id) +  "  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].fc-top3[2].ic) +")\n"
  if (civilWar.length) f += "\nInsurrections: " + civilWar.length + " (" + civilWar + ")\n"
  f += "\nStay up to date at https://tronwarbot.com\n"
  f += "#tron #world #war #gaming #simulation #bot"
  return f;
}

const buildTgStats = (td, leaderboard, countriesStillAlive, j, top3, civilWar) => {
  // TELEGRAM
  let t = "⏱♟ <b>TURN " + td.turn +"</b> UPDATE ♟⏱\n\n"
  t +="🎖🎖 <b>TOP 5 ARMIES</b> 🎖🎖\n"
  t += "🥇<b>" + leaderboard[0].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[0].idx) + "</b>\t C: "+utils.toPercent(leaderboard[0].cohesion)+"\n";
  t += "🥈<b>" + leaderboard[1].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[1].idx) + "</b>\t C: "+utils.toPercent(leaderboard[1].cohesion)+"\n";
  t += "🥉<b>" + leaderboard[2].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[2].idx) + "</b>\t C: "+utils.toPercent(leaderboard[2].cohesion)+"\n";
  t += "<i>4th</i> <b>" + leaderboard[3].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[3].idx) + "</b>\t C: "+utils.toPercent(leaderboard[3].cohesion)+"\n";
  t += "<i>5th</i> <b>" + leaderboard[4].territories + "</b> territories -\t<b>" + utils.universalMap(leaderboard[4].idx) + "</b>\t C: "+utils.toPercent(leaderboard[4].cohesion)+"\n";
  t += "\n🌎 <b>" + countriesStillAlive.length + "</b> countries in the game!\n"
  t += "\nJackpot: <b>" + j + " TRX</b>\n";
  // t += "\n🕛 <b>12 HOURS BREAK:</b> 🕛\n"
  // t += "\n👍 <b> BEST 3 </b> 👍\n"
  // t +=  "<b>+" + top3[0].wt + " " + utils.universalMap(top3[0].id) + "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].fc-top3[0].ic) +")\n"
  // t +=  "<b>+" + top3[1].wt + " " + utils.universalMap(top3[1].id) + "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].fc-top3[1].ic) +")\n"
  // t +=  "<b>+" + top3[2].wt + " " + utils.universalMap(top3[2].id) + "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].fc-top3[2].ic) +")\n"
  // t += "\n🔻<b> WORST 3 </b> 🔻\n"
  // t +=  "<b>" + top3[0].wt + " " + utils.universalMap(top3[0].id) +  "</b>  C: " + utils.toPercent(top3[0].fc) + " (" + utils.toPercent(top3[0].fc-top3[0].ic) +")\n"
  // t +=  "<b>" + top3[1].wt + " " + utils.universalMap(top3[1].id) +  "</b>  C: " + utils.toPercent(top3[1].fc) + " (" + utils.toPercent(top3[1].fc-top3[1].ic) +")\n"
  // t +=  "<b>" + top3[2].wt + " " + utils.universalMap(top3[2].id) +  "</b>  C: " + utils.toPercent(top3[2].fc) + " (" + utils.toPercent(top3[2].fc-top3[2].ic) +")\n"
  // t += "\nInsurrections: <b>" + civilWar.length + "</b> <i>(" + civilWar + ")</i>\n"
  t += "\nWho will conquer the world? <b>Don't miss it!</b>\n";
  t += "🎖👇👇👇👇👇👇👇🎖";
  return t
}

const battleUpdate = async (cmap, td) => {
  let n = false
  if (!(td.turn%NEW_UPDATE_FREQ)) {
    n=true;
    epic = []
    insurrections = [];
    partials = {};
  }
  history.push(td);
  // TODOS:
  // - PARTIALS +- TERRITORIES OK
  if (td.battle && td.battle.result){
    let w,l;
    switch (td.battle.result){
      case 1:
      // - SUCCESSFUL INSURRECTIONS OK
        if (td.battle.civilWar) insurrections.push(td.battle);
        w=td.battle.o;
        l=td.battle.d;
        break;
      case 2:
        w=td.battle.d;
        l=td.battle.o;
        break;
    }
    partials[w] = (partials[w] || 0) + 1
    partials[l] = (partials[l] || 0) - 1
  }
  let top = Object.keys(partials).map((i)=>{return {idx:i, t:partials[i]}}).sort((a,b)=>b.t-a.t);

  // - BET WINS??
  // - EPIC BATTLES (wins with low probability)
  if (td.battle && td.battle.probabilities[td.battle.result]<0.05) epic.push(td.battle);
  insurrections = insurrections.filter((b)=>!!cmap[b.o].territories);
  // - LAST RESULT
  // - CURRENT BATTLE

  let s ="";
  if (top.length) s += "<b>🆕 Territories:</b>\t\n"
  top.forEach((c)=>{
    if (!c.t) return;
    s += "<b>" + (c.t>0 ? "+" : "\-") + c.t + "</b> " + utils.universalMap(c.idx) + "\n";
  })
  if (epic.length) s += "\n🔥 <b>Epic battles:</b> 🔥\n";
  epic.forEach((b)=>{
    s += (b.result==1 ? "<b>" : "" ) + utils.universalMap(b.o) + (b.result==1 ? "</b>" : "" ) + " vs " + (b.result==2 ? "<b>" : "" ) + utils.universalMap(b.d) + (b.result==2 ? "</b>" : "" ) + " ➡️ <b>"+ (b.result || "X") + "</b> <i>with a " + utils.toPercent(b.probabilities[b.result])+" chance</i>\n";
  })

  if (insurrections.length) {
    s+= "\n<b>Successful insurrections:</b>"
    s+= insurrections.map(e=> "\n" + utils.universalMap(e.o) + ": " + cmap[e.o].territories + " territories").toString();
    s+= "\n";
  }

  if (td.battle) {
    s += "\n<b>⏪ Previous battle:</b>\n"
    s += (td.battle.result==1 ? "<b>" : "" ) + utils.universalMap(td.battle.o) + (td.battle.result==1 ? "</b>" : "" ) + (td.battle.civilWar ? " rebelled on ": " vs ") + (td.battle.result==2 ? "<b>" : "" ) + utils.universalMap(td.battle.d) + (td.battle.result==2 ? "</b>" : "" ) + " ➡️ <b>"+ (td.battle.result || "X") + "</b>\n";
    if (td.battle.result == 0) s += (td.battle.civilWar ? "<i>✨ The insurrection was settled with no casualties!</i>\n":"<i>The war peacefully resolved!</i>\n");
    if (td.battle.result == 1) s += (td.battle.civilWar ? ("<i>That was a successful golpe!\n🍀 Long live " + utils.universalMap(td.battle.o) + "🍀</i>\n") : ("<i>The offender "+ utils.universalMap(td.battle.o) + " conquered " + utils.universalMap(td.battle.dt) + "</i>\n"));
    if (td.battle.result == 2) s += "<i>The defender "+ utils.universalMap(td.battle.d) + " conquered " + utils.universalMap(td.battle.ot) + "</i>\n";
  }
  if (td.next) {
    s += "\n\n⚔️<b>"+ td.turn +" 💥 BATTLE IN PROGRESS ⚔️</b>\n"
    s += (td.next.civilWar ? "✨":"") +"<b>" + utils.universalMap(td.next.o) + (td.next.civilWar ? " is rebelling on ": " vs ") + utils.universalMap(td.next.d) + "</b>\n";
    s += "<i>attacking from " + utils.universalMap(td.next.ot) + " to " + utils.universalMap(td.next.dt) + "</i>\n"
    s += "<b>1</b>: " + utils.toPercent(td.next.probabilities[1]) + "\t ";
    s += "<b>X</b>: " + utils.toPercent(td.next.probabilities[0]) + "\t ";
    s += (td.next.civilWar ? "" : ("<b>2</b>: " + utils.toPercent(td.next.probabilities[2]) + "\n"));
  }

  // if (!td.next.civilWar) {
  //   s += "⚔️<b> " + utils.truncate(utils.universalMap(td.next.o), 10) + " " + utils.toPercent(cmap[td.next.o].cohesion) + "</b> > <b>" + utils.truncate(utils.universalMap(td.next.dt), 10) + " </b>\n";
  //   s += "\t\t\t  <i>Previously: " + utils.truncate(utils.universalMap(td.next.d) ,23) + "</i>\n"
  // } else {
  //   s += "✨<b>" + utils.truncate(utils.universalMap(td.next.o), 10) + " </b> rebelled on  <b>" + utils.truncate(utils.universalMap(td.next.d), 10) + "</b>\n"
  //   s += "\t\t\t  <i>🍀 Long live " + utils.truncate(utils.universalMap(td.next.o) ,21) + "!</i>\n"
  // }
  if (!n) await telegram.sendOrUpdate(s, {parse_mode: "HTML", disable_web_page_preview: true, disable_notification:true}).catch(console.error);
  else await telegram.sendMessage(s, {parse_mode: "HTML", disable_web_page_preview: true, disable_notification:true}).catch(console.error);
}


module.exports.battleUpdate = battleUpdate;
module.exports.runUpdate = runUpdate;
