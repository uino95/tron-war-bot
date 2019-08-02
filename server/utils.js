const mapping = require( './map-utilities/mapping');
const crypto = require('crypto');

module.exports = {
    universalMap: function(id,to){
		switch(to){
			case 'name':
				return mapping[id]['name'];
			case 'charId':
				return mapping[id]['charId'];
			case 'numberId':
				for (var i = mapping.length - 1; i >= 0; i--) {
					if (mapping[i]['name'] === id){
						return i
					}
				}
			default:
				return mapping[id]['name'];
		}
	},
	sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  sha256: (e) =>{
    return crypto.createHmac('sha256', "").update(e.toString()).digest('hex');
  },
  randomFromHex: (e)=> {
    return parseFloat("0."+ parseInt(e.substr(0,16),16).toString());
  },
  randomHex: (len = 12) => {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len) // return required number of characters
  }
}
