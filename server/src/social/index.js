const wwb = require('../worldWarBot')
const config = require('../config')
const updates = require('./updates')
const russianRoulette = require('./russianRoulette')
const promotions = require('./promotions')
const shares = require('./shares')
const ambassador = require('./ambassador')
const telegram = require('../utils/telegram')
const map = require('../map-utilities/map')

module.exports.runUpdate = async (cmap, td) => {
  try {
    // if (wwb.winner()) return updates.endWar();
    // if (td.turn == 1) await updates.startWar(td);
    // if (!(td.turn % 10)) await map.takeScreenshot();
    // if (!(td.turn % config.social.updates.statsFreq)) await updates.stats(td).catch(console.error);
    // if (!(td.turn % config.social.updates.quotesFreq)) await updates.quotes(td);
    // if (!(td.turn % config.social.promotions.ambassadorFreq)) await promotions.becomeAmbassador(cmap, td);
    // if (!(td.turn % config.social.updates.rouletteFreq)) russianRoulette.next(cmap, td);
    // updates.battleUpdate(cmap, td);
  } catch (e) {
    console.error(e)
  }
}


module.exports.init = async () =>{
  // LOAD STATUS
  // await russianRoulette.init();
  // await updates.init();
}

module.exports.shares = shares;
module.exports.ambassador = ambassador;
