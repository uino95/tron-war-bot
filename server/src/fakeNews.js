const utils = require('./utils')

const templates = {
  //Random
  '222': [
    "$receiver$. Prime minister declare eating pop corns is now illegal.",
    "$receiver$ to ban Apple products beacuse Tim Cook is gay.",
    "In $receiver$ the cotton shortage causes mass nudism.",
    "Donald Trump: “Real news aren't mexicans!”",
    "Sasha Grey: “If the crisis hits I'll work for free!”",
    "Putin on insufficient virus tests: “You find problem. I hide problem. Problem kaput!”",
    "Silvio Berlusconi to donate 10 millions to help sick people to a pleasant stay. Free plastic surgery for all female nurse personnel.",
    "Tokyo 2020 mutated into Covid 2020.",
  ],
  //Deaths
  '122': [
    "$receiver$. Dead bodies found around a dining table stuffed with vegan food. +$deaths$ deaths.",
    "$receiver$. Hobo fight for the last bottle of whiskey turns into a massacre. +$deaths$ deaths.",
    "$receiver$. A group of drug-addicts, led to believe the virus mutate them into pokemons, flied from a skyscraper. +$deaths$ deaths.",
    "The Anti-vax Research Lab of $receiver$ proves vaccines are ineffective. Anti-vax researchers used as guinea pigs. +$deaths$ deaths.",
    "After converting metal detectors into virus scanner an airplane explodes in $receiver$. Terrorism is most likely.  +$deaths$ deaths.",
    "Military tanks crash and explode while patroling $receiver$'s streets. Army's officer: “It's a sabotage by hackers in $sender$”. +$deaths$ deaths.",
    "Glorya Gaynor did not survive. $deaths$ deaths in $receiver$.",
    "$receiver$ to deploy military tanks to prevent social gathering. $deaths$ people blasted in a park.",
    "In $receiver$ hospitals are full. The head physicians: “If you breathe, you are fine. Stay at home!”. +$deaths$ deaths.",
    "Dwayne Johnson performs the infamous “The Rock Bottom” amid havoc in a grocery store. +$deaths$ deaths.",
    "ISIS group members were found dead in a secret lab in $receiver$ while creating a new virulent terror weapon. +$deaths$ deaths.",
    "$receiver$ to develop new virus tests after shortage of equipment: “If you hold your breath for 300 seconds you are likely negative”. +$deaths$ deaths.",
    "$receiver$ scientists confirms the virus spread into water. The parliament advises: “Do not drink water!”. +$deaths$ deaths.",
    "$receiver$. During a flash mob on a balcony the balcony collapses. +$deaths$ deaths",
    "Smurfs reunion in $receiver$. But it's only five of them. Amen. +$deaths$ deaths",
    "Supermarket shut down in $receiver$. A royal rumble kicks off for the last piece of toilet paper. +$deaths$ deaths",
    "Student in $receiver$ finds out that the virus dies after shooting it with a Desert Eagle. +$deaths$ deaths",
    "$receiver$'s' population to double by 2040, babies to blame. +$deaths$ never-born babies",
    "$receiver$ Federal Agents Raid Gun Shop Find Weapons. +$deaths$ deaths",
    "Terrorist attack at security conference in $receiver$. +$deaths$ deaths",
  ],
  //Infected
  '212': [
    "Man surprised by policemen in $receiver$ while eating bat's poo. +$infected$ infected.",
    "$receiver$'s special agents opened a mysterious box from $sender$ with stated 'Do not open me!'. It was full of viruses! +$infected$ infected.",
    "$receiver$'s health organization declares the novel virus form can only be defeated through extensive hugging. +$infected$ infected.",
    "In $receiver$ people have invaded the streets as an official strike against the virus' oppression. +$infected$ infected.",
    "Ambassador of $sender$ found positive to virus test while visiting $receiver$'s president. +$infected$ infected.",
    "Scientists in $receiver$ say group sex is key to immune system strengthening as a prevention measure during covid infections. +$infected$ infected.",
    "Strong wind from $sender$ brings virus to cities in $receiver$. It's panic! +$infected$ infected.",
    "Parrots escaped from a lab in $receiver$. The vet: “No worries. They were infected. They will die soon.”. +$infected$ infected.",
    "$receiver$'s government will use McAfee anti-virus software to fight the pandemic. +$infected$ computers infected.",
    "Social distancing? $receiver$ organizes one last Project X style party before the quarantine. +$infected$ infected.",
    "Conor ‘The Notorious’ McGregor to fight Covid ‘The infamous’ CoronaVirus in $receiver$. Tickets sold out. +$infected$ infected.",
    "$sender$ to help $receiver$ by sending used sanitary equipment. $receiver$: “We are deeply thankful”. +$infected$ infected.",
    "$receiver$. A football team experiencing syntomps after eating vegan food. It's conspiracy! +$infected$ infected.",
    "New viral tik tok challenge in the streets in $receiver$: Cough and Run! +$infected$ infected.",
    "$receiver$. A bullies gang go to school. +$infected$ infected.",
    "Vegan protesters on the streets in $receiver$: “Cows farts spread the virus!” +$infected$ vegans infected.",
    "$receiver$. Infected goats escaped quarantine. +$infected$ scapegoats",
  ],
  //Recovered
  '232': [
    "$receiver$'s scientist found the recipe for the philosopher's stone. +$recovered$ recovered.",
    "Scientists have demonstrated that the average penis sizes of people in $receiver$ make them more resilient to the virus. +$recovered$ recovered.",
    "$receiver$ to cure covid using blockchain. +$recovered$ recovered.",
    "$receiver$ to convert airport's metal detectors into covid scanner. +$recovered$ recovered.",
    "$receiver$ newspaper publishes tutorial on how to remove “Greta Thunberg Email Virus”. +$recovered$ recovered.",
  ],
  //Cohesion resistant
  '221': [
    "$receiver$'s prime minister declares winemakers should now wash their feet before grape harvest.",
    "$receiver$ to deploy military tanks to prevent people leaving their houses.",
    "$receiver$ has locked down the country. Special exit-only permits granted to jews.",
    "$receiver$. Too many infected. Thursday is cancelled",
    "$receiver$. Farmers using watermelons to protect cannons",
  ],
  //Cohesion weakening
  '223': [
    "In $receiver$ use of face mask is now banned. They are rude and unpolite.",
    "Love festival in $receiver$ will take place online! Safety measure: wash your devices.",
    "Government order in $receiver$. Priests have to stay 2 meters off of children.",
    "$receiver$. Macbook user found immune to the viral outbreak.",
    "$receiver$. Nothing changes in parliament after enforced work-from-home policy for politicians.",
    "$receiver$ discovered the cause of the virus spreading. Cats and their not so lonely walk outside...",
    "$receiver$. News media stop talking about CoronaVirus.",
    "$receiver$. Landlord refuses to take cash from tenant. Housing crisis has just begun.",
    "Hospitals in $receiver$ have introduced remote working policy.",
    "Solidal masturbation policy in $receiver$. Girls enforced to send nudes to friend in such hard times.",
    "In $receiver$ wearing face masks in front of black people is no longer racism.",
    "Total quarantine in $receiver$. Voters to vote on voting",
  ]
}





const generate = (params={sender:null, receiver:null, deaths:0, infected:0, cohesion:0}) => {
  if (params.sender == null || params.receiver == null) return '';

  let type = (Math.sign(-params.deaths)+ 2).toString()
  type += (Math.sign(-params.infected) + 2).toString()
  type += (Math.sign(-params.cohesion) + 2).toString()

  let _size = (templates[type] || []).length;
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
