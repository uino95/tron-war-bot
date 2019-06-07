const express = require('express')
const app = express()
const port = 3000

app.get('/conquest_countries', (req, res) => res.send(`
{"turn":8,"conquest":[40,125],"countries":[["Virgin Islands",[0]],["Lesser Antilles",[1]],["ABC Islands",[2]],["Jersey and Guernsey",[3]],["Afghanistan",[4]],["Angola",[5]],["\u00c5land",[6]],["Albania",[7]],["Andorra",[8]],["United Arab Emirates",[9]],["Argentina",[10]],["Armenia",[11]],["American Samoa",[12]],["Antarctica",[13]],["French Southern Territories",[14]],["Australia",[15]],["Austria",[16]],["Azerbaijan",[17]],["Burundi",[18]],["Belgium",[19]],["Benin",[20]],["Burkina Faso",[21]],["Bangladesh",[22]],["Bulgaria",[23]],["Bahrain",[24]],["Bahamas",[25]],["Bosnia and Herzegovina",[26]],["Belarus",[27]],["Belize",[28]],["Bermuda",[29]],["Bolivia",[30]],["Brazil",[31]],["Barbados",[32]],["Brunei",[33]],["Bhutan",[34]],["Bouvet Island",[35]],["Botswana",[36]],["Cameroon",[37,44]],["Canada",[38]],["Cocos Islands",[39]],["Switzerland",[40]],["Chile",[41]],["China",[42]],["Ivory Coast",[43]],["Democratic Republic of the Congo",[45]],["Republic of Congo",[46]],["Cook Islands",[47]],["Colombia",[48]],["Comoros",[49]],["Cape Verde",[50]],["Costa Rica",[51]],["Cuba",[52]],["Christmas Island",[53]],["Cayman Islands",[54]],["Cyprus",[55]],["Czech Republic",[56]],["Germany",[57]],["Djibouti",[58]],["Denmark",[59]],["Dominican Republic",[60]],["Algeria",[61]],["Ecuador",[62]],["Egypt",[63]],["Eritrea",[64]],["Western Sahara",[65]],["Spain",[66]],["Estonia",[67]],["Ethiopia",[68]],["Finland",[69]],["Fiji",[70]],["Falkland Islands",[71]],["France",[72]],["Faroe Islands",[73]],["Micronesia",[74]],["Gabon",[75]],["Georgia",[76]],["Ghana",[77]],["Gibraltar",[78]],["Guinea",[79]],["Gambia",[80]],["Guinea-Bissau",[81]],["Equatorial Guinea",[82]],["Greece",[83]],["Greenland",[84]],["Guatemala",[85]],["French Guiana",[86]],["Guam",[87]],["Guyana",[88]],["Hong Kong",[89]],["Heard Island and McDonald Islands",[90]],["Honduras",[91]],["Croatia",[92]],["Haiti",[93]],["Hungary",[94]],["Indonesia",[95]],["Isle of Man",[96,239]],["India",[97]],["British Indian Ocean Territory",[98]],["Ireland",[99]],["Iran",[100]],["Iraq",[101]],["Iceland",[102]],["Israel",[103]],["Italy",[104]],["Jamaica",[105]],["Jordan",[106]],["Japan",[107]],["Kazakhstan",[108]],["Kenya",[109]],["Kyrgyzstan",[110]],["Cambodia",[111]],["Kiribati",[112]],["South Korea",[113]],["Kuwait",[114]],["Laos",[115]],["Lebanon",[116]],["Liberia",[117]],["Libya",[118]],["Liechtenstein",[119]],["Sri Lanka",[120]],["Lesotho",[121]],["Lithuania",[122]],["Luxembourg",[123]],["Latvia",[124]],["Macao",[125]],["Morocco",[126]],["Monaco",[127]],["Moldova",[128]],["Madagascar",[129]],["Maldives",[130]],["Mexico",[131]],["Marshall Islands",[132]],["Macedonia",[133]],["Mali",[134]],["Malta",[135]],["Myanmar",[136]],["Montenegro",[137]],["Mongolia",[138]],["Northern Mariana Islands",[139]],["Mozambique",[140]],["Mauritania",[141]],["Mauritius",[142]],["Malawi",[143]],["Malaysia",[144]],["Mayotte",[145]],["Namibia",[146]],["New Caledonia",[147]],["[REDACTED]",[148]],["Norfolk Island",[149]],["Nigeria",[150]],["Nicaragua",[151]],["Niue",[152]],["Netherlands",[153]],["Norway",[154]],["Nepal",[155]],["Nauru",[156]],["New Zealand",[157]],["Oman",[158]],["Pakistan",[159]],["Panama",[160]],["Pitcairn Islands",[161]],["Peru",[162]],["Philippines",[163]],["Palau",[164]],["Papua New Guinea",[165]],["Poland",[166]],["Puerto Rico",[167]],["North Korea",[168]],["Portugal",[169]],["Paraguay",[170]],["Palestine",[171]],["French Polynesia",[172]],["Qatar",[173]],["Reunion",[174]],["Romania",[175]],["Russia",[176]],["Rwanda",[177]],["Saudi Arabia",[178]],["Sudan",[179]],["Senegal",[180]],["Singapore",[181]],["South Georgia and the South Sandwich Islands",[182]],["Saint Helena",[183]],["Svalbard and Jan Mayen",[184]],["Solomon Islands",[185]],["Sierra Leone",[186]],["El Salvador",[187]],["San Marino",[188]],["Somalia",[189]],["Saint Pierre and Miquelon",[190]],["Serbia",[191]],["South Sudan",[192]],["S\u00e3o Tom\u00e9 and Pr\u00edncipe",[193]],["Suriname",[194]],["Slovakia",[195]],["Slovenia",[196]],["Sweden",[197]],["Swaziland",[198]],["Seychelles",[199]],["Syria",[200]],["Turks and Caicos Islands",[201]],["Chad",[202]],["Togo",[203]],["Thailand",[204]],["Tajikistan",[205]],["Tokelau",[206]],["Turkmenistan",[207]],["Timor-Leste",[208]],["Tonga",[209]],["Trinidad and Tobago",[210]],["Tunisia",[211]],["Turkey",[212]],["Tuvalu",[213]],["Taiwan",[214]],["Tanzania",[215]],["Uganda",[216]],["Ukraine",[217]],["United States Minor Outlying Islands",[218]],["Uruguay",[219]],["United States of America",[220]],["Uzbekistan",[221]],["Vatican City",[222]],["Venezuela",[223]],["Vietnam",[224]],["Vanuatu",[225]],["Wallis and Futuna",[226]],["Samoa",[227]],["Clipperton Island",[228]],["Kosovo",[229]],["Northern Cyprus",[230]],["Paracel Islands",[231]],["Spratly Islands",[232]],["Yemen",[233]],["South Africa",[234]],["Zambia",[235]],["Zimbabwe",[236]],["Scotland",[237]],["Wales",[238]],["Northern Ireland",[240]]]}
	`))
app.get('/conquest', (req, res) => res.send(`
{"turn":8,"conquest":[40,125]}
	`))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))