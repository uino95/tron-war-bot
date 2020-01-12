import json

# with open('./countries.json', 'r') as f:
#     distros_dict = json.load(f)

# features = distros_dict['features']

territories = [[0,"Virgin Islands"],[1,"Lesser Antilles"],[2,"ABC Islands"],[3,"Jersey and Guernsey"],[4,"Afghanistan"],[5,"Angola"],[6,"\u00c5land"],[7,"Albania"],[8,"Andorra"],[9,"United Arab Emirates"],[10,"Argentina"],[11,"Armenia"],[12,"American Samoa"],[13,"Antarctica"],[14,"French Southern Territories"],[15,"Australia"],[16,"Austria"],[17,"Azerbaijan"],[18,"Burundi"],[19,"Belgium"],[20,"Benin"],[21,"Burkina Faso"],[22,"Bangladesh"],[23,"Bulgaria"],[24,"Bahrain"],[25,"Bahamas"],[26,"Bosnia and Herzegovina"],[27,"Belarus"],[28,"Belize"],[29,"Bermuda"],[30,"Bolivia"],[31,"Brazil"],[32,"Barbados"],[33,"Brunei"],[34,"Bhutan"],[35,"Bouvet Island"],[36,"Botswana"],[37,"Central African Republic"],[38,"Canada"],[39,"Cocos Islands"],[40,"Switzerland"],[41,"Chile"],[42,"China"],[43,"Ivory Coast"],[44,"Cameroon"],[45,"Democratic Republic of the Congo"],[46,"Republic of Congo"],[47,"Cook Islands"],[48,"Colombia"],[49,"Comoros"],[50,"Cape Verde"],[51,"Costa Rica"],[52,"Cuba"],[53,"Christmas Island"],[54,"Cayman Islands"],[55,"Cyprus"],[56,"Czech Republic"],[57,"Germany"],[58,"Djibouti"],[59,"Denmark"],[60,"Dominican Republic"],[61,"Algeria"],[62,"Ecuador"],[63,"Egypt"],[64,"Eritrea"],[65,"Western Sahara"],[66,"Spain"],[67,"Estonia"],[68,"Ethiopia"],[69,"Finland"],[70,"Fiji"],[71,"Falkland Islands"],[72,"France"],[73,"Faroe Islands"],[74,"Micronesia"],[75,"Gabon"],[76,"Georgia"],[77,"Ghana"],[78,"Gibraltar"],[79,"Guinea"],[80,"Gambia"],[81,"Guinea-Bissau"],[82,"Equatorial Guinea"],[83,"Greece"],[84,"Greenland"],[85,"Guatemala"],[86,"French Guiana"],[87,"Guam"],[88,"Guyana"],[89,"Hong Kong"],[90,"Heard Island and McDonald Islands"],[91,"Honduras"],[92,"Croatia"],[93,"Haiti"],[94,"Hungary"],[95,"Indonesia"],[96,"Isle of Man"],[97,"India"],[98,"British Indian Ocean Territory"],[99,"Ireland"],[100,"Iran"],[101,"Iraq"],[102,"Iceland"],[103,"Israel"],[104,"Italy"],[105,"Jamaica"],[106,"Jordan"],[107,"Japan"],[108,"Kazakhstan"],[109,"Kenya"],[110,"Kyrgyzstan"],[111,"Cambodia"],[112,"Kiribati"],[113,"South Korea"],[114,"Kuwait"],[115,"Laos"],[116,"Lebanon"],[117,"Liberia"],[118,"Libya"],[119,"Liechtenstein"],[120,"Sri Lanka"],[121,"Lesotho"],[122,"Lithuania"],[123,"Luxembourg"],[124,"Latvia"],[125,"Macao"],[126,"Morocco"],[127,"Monaco"],[128,"Moldova"],[129,"Madagascar"],[130,"Maldives"],[131,"Mexico"],[132,"Marshall Islands"],[133,"Macedonia"],[134,"Mali"],[135,"Malta"],[136,"Myanmar"],[137,"Montenegro"],[138,"Mongolia"],[139,"Northern Mariana Islands"],[140,"Mozambique"],[141,"Mauritania"],[142,"Mauritius"],[143,"Malawi"],[144,"Malaysia"],[145,"Mayotte"],[146,"Namibia"],[147,"New Caledonia"],[148,"Niger"],[149,"Norfolk Island"],[150,"Nigeria"],[151,"Nicaragua"],[152,"Niue"],[153,"Netherlands"],[154,"Norway"],[155,"Nepal"],[156,"Nauru"],[157,"New Zealand"],[158,"Oman"],[159,"Pakistan"],[160,"Panama"],[161,"Pitcairn Islands"],[162,"Peru"],[163,"Philippines"],[164,"Palau"],[165,"Papua New Guinea"],[166,"Poland"],[167,"Puerto Rico"],[168,"North Korea"],[169,"Portugal"],[170,"Paraguay"],[171,"Palestine"],[172,"French Polynesia"],[173,"Qatar"],[174,"Reunion"],[175,"Romania"],[176,"Russia"],[177,"Rwanda"],[178,"Saudi Arabia"],[179,"Sudan"],[180,"Senegal"],[181,"Singapore"],[182,"South Georgia and the South Sandwich Islands"],[183,"Saint Helena"],[184,"Svalbard and Jan Mayen"],[185,"Solomon Islands"],[186,"Sierra Leone"],[187,"El Salvador"],[188,"San Marino"],[189,"Somalia"],[190,"Saint Pierre and Miquelon"],[191,"Serbia"],[192,"South Sudan"],[193,"S\u00e3o Tom\u00e9 and Pr\u00edncipe"],[194,"Suriname"],[195,"Slovakia"],[196,"Slovenia"],[197,"Sweden"],[198,"Swaziland"],[199,"Seychelles"],[200,"Syria"],[201,"Turks and Caicos Islands"],[202,"Chad"],[203,"Togo"],[204,"Thailand"],[205,"Tajikistan"],[206,"Tokelau"],[207,"Turkmenistan"],[208,"Timor-Leste"],[209,"Tonga"],[210,"Trinidad and Tobago"],[211,"Tunisia"],[212,"Turkey"],[213,"Tuvalu"],[214,"Taiwan"],[215,"Tanzania"],[216,"Uganda"],[217,"Ukraine"],[218,"United States Minor Outlying Islands"],[219,"Uruguay"],[220,"United States of America"],[221,"Uzbekistan"],[222,"Vatican City"],[223,"Venezuela"],[224,"Vietnam"],[225,"Vanuatu"],[226,"Wallis and Futuna"],[227,"Samoa"],[228,"Clipperton Island"],[229,"Kosovo"],[230,"Northern Cyprus"],[231,"Paracel Islands"],[232,"Spratly Islands"],[233,"Yemen"],[234,"South Africa"],[235,"Zambia"],[236,"Zimbabwe"],[237,"Scotland"],[238,"Wales"],[239,"England"],[240,"Northern Ireland"]]

status = [["El Salvador",[0,1,2,10,25,28,29,30,31,32,35,41,48,50,51,52,54,60,62,71,85,86,88,91,93,105,112,131,151,160,162,167,170,182,187,194,201,210,219,220,223,228]],["Spain",[3,4,5,6,7,8,9,11,16,17,18,19,20,21,23,24,26,27,37,38,40,43,44,45,46,49,55,56,57,58,59,61,63,64,65,66,67,68,69,72,73,75,76,77,78,79,80,81,82,83,84,92,94,96,97,99,100,101,102,103,104,106,108,109,110,114,116,117,118,119,122,123,124,126,127,128,130,133,134,135,137,141,143,148,150,153,154,158,159,166,169,171,173,175,176,177,178,179,180,183,184,186,188,189,190,191,192,193,195,196,197,199,200,202,203,205,207,211,212,215,216,217,221,222,229,230,233,237,238,239,240]],["Pitcairn Islands",[12,13,47,70,74,132,147,149,152,156,157,161,172,206,209,213,218,225,226,227]],["Cambodia",[14,15,22,33,34,39,42,53,87,89,90,95,107,111,113,115,120,125,129,136,138,139,142,144,155,163,164,165,168,174,181,185,204,208,214,224,231,232]],["Zimbabwe",[36,98,121,140,145,146,198,234,235,236]]]
featuresToDelete = []

featuresList = []

j=0,
colorsGray = ["#eceff1","#cfd8dc","#b0bec5","#90a4ae","#78909c","#607d8b","#546e7a","#455a64","#37474f","#263238",
"#fafafa","#f5f5f5","#eeeeee","#e0e0e0","#bdbdbd","#9e9e9e","#757575","#616161","#424242","#212121"]

colorsGreen = ["#e8f5e9","#c8e6c9","#a5d6a7","#81c784","#66bb6a","#4caf50","#43a047","#388e3c","#2e7d32","#1b5e20","#b9f6ca","#69f0ae","#00e676","#00c853",
"#e0f2f1","#b2dfdb","#80cbc4","#4db6ac","#26a69a","#009688","#00897b","#00796b","#00695c","#004d40","#a7ffeb","#64ffda","#1de9b6","#00bfa5"]

colorsYellow = ["#fffde7","#fff9c4","#fff59d","#fff176","#ffee58","#ffeb3b","#fdd835","#fbc02d","#f9a825","#f57f17","#ffff8d","#ffff00","#ffea00","#ffd600",
"#f9fbe7","#f0f4c3","#e6ee9c","#dce775","#d4e157","#cddc39","#c0ca33","#afb42b","#9e9d24","#827717","#f4ff81","#eeff41","#c6ff00","#aeea00"]

colorsRed = ["#fbe9e7","#ffccbc","#ffab91","#ff8a65","#ff7043","#ff5722","#f4511e","#e64a19","#d84315","#bf360c","#ff9e80","#ff6e40","#ff3d00","#dd2c00",
"#fff3e0","#ffe0b2","#ffcc80","#ffb74d","#ffa726","#ff9800","#fb8c00","#f57c00","#ef6c00","#e65100","#ffd180","#ffab40","#ff9100","#ff6d00"]

colorBlue = ["#e3f2fd","#bbdefb","#90caf9","#64b5f6","#42a5f5","#2196f3","#1e88e5","#1976d2","#1565c0","#0d47a1","#82b1ff","#448aff","#2979ff","#2962ff]",
"#e1f5fe","#b3e5fc","#81d4fa","#4fc3f7","#29b6f6","#03a9f4","#039be5","#0288d1","#0277bd","#01579b","#80d8ff","#40c4ff","#00b0ff","#0091ea"]

#print(len(features))
print(len(colorBlue))

i = len(colorBlue) - 1

# for item in distros_dict:
# 	item['color'] = colorBlue[i]
# 	i = i-1
# 	if i < 0 : i=len(colorBlue) - 1



# for item in territories:
# 	obj['id'] =

def convert (name):
    for item in territories:
        if item[1] == name:
            return item[0]



numberId = 0
name = ''
cc	= ''

for item in territories:
    for item2 in status:
        for item3 in item2[1]:
            if item3 == item[0]:
                featuresList.append(
                    {
                        "controlledBy": convert(item2[0])
                    })

    	# if item2['controlledBy'] == item[1]:

    	# 	featuresList.append(
	    # 		{
	    # 			"controlledBy": numberId,
	    # 			# "cc": cc,
	    # 			# "name": name
	    # 		}
    	# 	)
    	# 	break


#print(len(features))



with open('./mapStatus.json', 'w') as f:
    json.dump(featuresList,f)

# def anydup(thelist):
#   seen = set()
#   for x in thelist:
#     if x in seen:
#         print(x)
#         return True
#     seen.add(x)
#   return False

# anydup(featuresList)
