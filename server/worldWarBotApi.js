const rp = require('request-promise');
const utils = require('./utils');

module.exports.countriesStillAlive = async function() {
  try {
    var data = await rp.get('https://worldwarbot.com/api/v0.1/?request=conquest_countries&turn=last')
    let res = JSON.parse(data)
    var countries = []
    for (var i = res.countries.length - 1; i >= 0; i--) {
      countries.push(utils.universalMap(res.countries[i][0], 'numberId'))
    }
    return countries;
  } catch (err) {
    console.error(err)
    return [];
  }
}

module.exports.getTurnFromAPI =  async function(turn) {  
    try {
        var data = await rp.get(`https://worldwarbot.com/api/v0.1/?request=conquest&turn=${turn}`)
        console.log(data)
        let res = JSON.parse(data)
        return res
    } catch (err) {
        console.log(err)
        return {}
    }
}

module.exports.computeCountryFromId = async function(id, turn) {
    try {
        var data = await rp.get(`https://worldwarbot.com/api/v0.1/?request=conquest_countries&turn=${turn}`)
        let res = JSON.parse(data)
        for (var i = res.countries.length - 1; i >= 0; i--) {
            for (var j = res.countries[i][1].length - 1; j >= 0; j--) {
                if (res.countries[i][1][j] === id) {
                    return utils.universalMap(res.countries[i][0], 'numberId')
                }
            }
        }
    } catch (err) {
        console.log(err)
        return null
    }
}
