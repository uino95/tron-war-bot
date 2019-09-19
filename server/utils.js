const mapping = require( './map-utilities/mapping');
const crypto = require('crypto');

const utils = {
    map: mapping,
    universalMap: function(id,to){
		switch(to){
			case 'name':
				return mapping[id]['name'];
			case 'charId':
				return mapping[id]['charId'];
			case 'numberId':
        id = id.replace(/ |-/g, "").toLowerCase()
				for (var i = mapping.length - 1; i >= 0; i--) {
					if (mapping[i]['name'].replace(/ |-/g, "").toLowerCase() === id){
						return i
					}
				}
			default:
				return mapping[id]['name'];
		}
	},
	sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  sha256: (e) =>{
    return crypto.createHash("sha256").update(e.toString()).digest('hex');
  },
  randomFromSHA: (e)=> {
    return parseInt(e, 16) / Math.pow(2, 256)
  },
  randomFromHex: (e)=> {
    return utils.randomFromSHA(utils.sha256(e));
  },
  randomHex: (len = 16) => {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len) // return required number of characters
  },
  quoteFromProbability: (p) => {
    let w = p ? Math.min(1/p, 200) : 200;
    return Math.floor(w *100)/100;
  },
  toPercent : (n) =>(n * 100).toFixed(1) + "%",
  truncate: (s, n)=> (s.length > n) ? s.substr(0, n-2) + '..' : s
}

module.exports = utils;
