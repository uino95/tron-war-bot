const utils = require('./utils')

const templates = {
  //Random
  '222': [
    "$receiver$. Prime minister declare eating pop corns is now illegal.",
  ],
  //Deaths
  '122': [
    "$receiver$. Dead bodies found around a dining table stuffed with vegan food. +$deaths$ deaths.",
    "$receiver$. Hobo fight for the last bottle of whiskey turns into a massacre. +$deaths$ deaths."
  ],
  //Infected
  '212': [
    "Man surprised by policemen in $receiver$ while eating bat's poo. +$infected$ infected.",
    "$receiver$'s special agents opened a mysterious box from $sender$ with stated 'Do not open me!'. It was full of viruses! +$infected$ infected.",
    "$receiver$'s health organization declares the novel virus form can only be defeated through extensive hugging. +$infected$ infected.",
    "In $receiver$ people have invaded the streets as an official strike against the virus' oppression. +$infected$ infected.",
    "Ambassador of $sender$ found positive to virus test while visiting $receiver$'s president. +$infected$ infected.",
  ],
  //Recovered
  '232': [
    "$receiver$'s scientist found the recipe for the philosopher's stone. +$recovered$ recovered.",
  ],
  //Cohesion resistant
  '221': [
    "$receiver$'s prime minister declares winemakers should now wash their feet before grape harvest."
  ],
  //Cohesion weakening
  '223': [
    "In $receiver$ use of face mask is now banned. They are rude and unpolite."
  ]
}





const generate = (params={sender:null, receiver:null, deaths:0, infected:0, cohesion:0}) => {
  if (params.sender == null || params.receiver == null) return '';

  let type = (Math.sign(-params.deaths)+ 2).toString()
  type += (Math.sign(-params.infected) + 2).toString()
  type += (Math.sign(-params.cohesion) + 2).toString()

  let _size = templates[type].length;
  if (!_size) return '';

  let _rand = utils.randomInt(_size);
  let s = templates[type][_rand];
  if (params.sender) s = s.replace(/\$sender\$/g, utils.universalMap(params.sender))
  if (params.receiver) s = s.replace(/\$receiver\$/g, utils.universalMap(params.receiver))
  if (params.infected) s = s.replace(/\$infected\$/g, params.infected).replace(/\$recovered\$/g, -params.infected)
  if (params.deaths) s = s.replace(/\$deaths\$/g, params.deaths)
  if (params.cohesion) s = s.replace(/\$cohesion\$/g, params.cohesion)
  return s;
}


module.exports = {
  generate,
}
