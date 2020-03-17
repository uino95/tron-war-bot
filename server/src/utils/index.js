const mapping = require( '../map-utilities/mapping');
const crypto = require('crypto');

const utils = {
    map: JSON.parse(JSON.stringify(mapping)),
    universalMap: function(id,to){
		switch(to){
			case 'name':
				return mapping[id]['name'];
			case 'cc':
				return mapping[id]['cc'];
      case 'flag':
        return getFlag(mapping[id]['cc']);
      case 'full':
        return getFlag(mapping[id]['cc']) + ' ' +  mapping[id]['name'] ;
      case 'population':
        return mapping[id]['population'];
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
  randomInt : (odds=100) => {
    return Math.floor(Math.random() * odds);
  },
  randomHex: (len = 16) => {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len) // return required number of characters
  },
  random: ()=>{
    return utils.randomFromHex(utils.randomHex())
  },
  trimUp: (v, decimals=0) => {
    let m = 10**decimals;
    return Math.sign(v)*Math.ceil(Math.abs(v)*m)/m
  },
  formatNumber: (n) => {
    return (n>0 ? '+' : '') + n.toFixed(1)
  },
  quoteFromProbability: (p) => {
    let w = p ? Math.min(1/p, 200) : 200;
    return Math.floor(w *100)/100;
  },
  toPercent : (n) =>(n * 100).toFixed(1) + "%",
  truncate: (s, n)=> (s.length > n) ? s.substr(0, n-2) + '..' : s,
  imgUrl: (s)=> 'https://api.tronwarbot.com/img/' + s
}

module.exports = utils;


const getFlag = (cc)=>{
  // country code regex
  const CC_REGEX = /^[a-z]{2}$/i;
  const OFFSET = 127397;
  if (!CC_REGEX.test(cc)) return '🏳';
  const chars = [...cc.toUpperCase()].map(c => c.charCodeAt() + OFFSET);
  return String.fromCodePoint(...chars);
}
