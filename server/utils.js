import mapping from './map-utilities/mapping'

module.exports = {
    consoleLog:function(text) {
        console.log(new Date() + ': ' + text)
    },
    universalMap: function(id,to){
		switch(to){
			case 'name':
				return mapping[id]['name'];
			case 'charId':
				return mapping[id]['charId'];
			case 'numberId':
				for (var i = mapping.length - 1; i >= 0; i--) {
					if (mapping[i]['charId'] === id){
						return i
					}
				}
			default:
				return mapping[id]['name'];
		}
	}
}


