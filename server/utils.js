const mapping = require( './map-utilities/mapping')

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
    return e;
  },
  randomFromSHA: (e)=> {
    return e;
  },
  randomHex: ()=>{
    return Math.random();
  }
}
