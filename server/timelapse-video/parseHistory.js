var fs = require('fs');
const utils = require('../utils/index')
const UPDATE_EVERY = 50

function writeToFile(object){
    var jsonContent = JSON.stringify(object);
    
      fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
    
        console.log("JSON file has been saved.");
      });
}


const parse = function(){
    let rawdata = fs.readFileSync('input.json');
    let history = JSON.parse(rawdata);
    let result = [];

    console.log(history.globalHistory[0])
    console.log(typeof history.globalHistory)
    history = history.globalHistory

    history[0].forEach((el,index) => {
        result.push({
            'countryName': utils.universalMap(index),
            'flag': utils.universalMap(index,'flag'),
            'color': index % 12
        })
    })

    console.log(result);

    history.forEach((el,ind) => {
      el.forEach((elem,index) => {
        result[index][(ind *  UPDATE_EVERY).toString()] = elem.territories
      })
    })

    history[history.length - 1].forEach((el,index) => {
        result[index]["12607"] = el.territories
    })
  
    
  
    writeToFile(result)
}

module.exports = {
  parse
}

