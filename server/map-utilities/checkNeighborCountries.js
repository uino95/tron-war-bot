const neighborCountriesRaw = require('./rawNeighborCountries').map((e,idx)=>{
  if (!e[idx.toString()]) {
    console.error(e + " => " + idx)
    throw "[COUNTRIES_VALIDATION]: Invalid ordering of neighborCountries file! Check that all countries are correctly orderd from 0 to 240";
  }
  return e[idx.toString()];
});



// the neighborCountries is an array of (CountryIndex => [CountryIndexes])
// var neighborCountries;
const neighborCountries = neighborCountriesRaw.map((e,idx)=>{
  for (var c of e) {
    if (!neighborCountriesRaw[parseInt(c)].includes(idx.toString())){
      console.error(parseInt(c) + " => " + idx)
      throw "[COUNTRIES_VALIDATION]: Invalid relationships in neighborCountries file! Check that all countries are correctly linked to each other";
    }
  }
  return e.map(c=>parseInt(c));
})

console.log(JSON.stringify(neighborCountries))
