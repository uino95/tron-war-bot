<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-tabs centered color="secondary lighten-1" dark icons-and-text>
        <v-tabs-slider color="secondary lighten-4"></v-tabs-slider>

        <v-tab href="#tab-1">
            Bet Panel
            <v-icon>attach_money</v-icon>
        </v-tab>

        <v-tab href="#tab-2">
            Current Run Stats
            <v-icon>bar_chart</v-icon>
        </v-tab>

        <v-tab-item id="tab-1">
            <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                    <!-- Place a bet -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="secondary lighten-4" dark>
                                <v-toolbar-title>Place a bet</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-card-title primary-title class="justify-center">
                                <v-form ref="form"
                                        v-model="valid"
                                        lazy-validation>
                                    <v-autocomplete
                                            outline
                                            v-model="currentCountry"
                                            :items="countriesTest.countryList"
                                            item-text="name"
                                            item-value="name"
                                            color="white"
                                            hide-no-data
                                            hide-selected
                                            label="Select Country"
                                            placeholder="Start typing to search"
                                    ></v-autocomplete>

                                    <v-text-field v-model="balance"
                                                  label="Your Balance"
                                                  outline
                                                  disabled></v-text-field>

                                    <v-text-field v-model="jackpot"
                                                  label="Current Jackpot"
                                                  outline
                                                  disabled></v-text-field>

                                    <v-select
                                            v-model="currency"
                                            :items="currencies"
                                            :rules="currencyRule"
                                            label="Currency"
                                            required
                                            outline
                                    ></v-select>

                                    <v-btn color="success" @click="placeBet">Bet 50 {{currency}}</v-btn>
                                </v-form>
                            </v-card-title>
                        </v-card>
                    </v-flex>
                    <!-- My latest bets -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="secondary lighten-4" dark>
                                <v-toolbar-title>My Latest Bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-container grid-list-md text-xs-center>
                                <v-layout row wrap>
                                    <v-flex xs3 class="title">
                                        Country
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        Bet
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        Time
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        Result
                                    </v-flex>
                                </v-layout>
                                <v-divider style="margin-bottom: 3%"></v-divider>
                                <v-layout row wrap v-for="bet in myBets" :key="bet">
                                    <v-flex xs3 class="subheading">
                                        {{bet.country}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{bet.bet+"TRX"}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{bet.time}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{bet.result}}
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </v-flex>
                    <!-- Latest turn bets -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="secondary lighten-4" dark>
                                <v-toolbar-title>Latest turn bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-container grid-list-md text-xs-center>
                                <v-layout row wrap>
                                    <v-flex xs3 style="text-align: start" class="title">
                                        <span>Address</span>
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        <span>Country</span>
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        <span>Bet</span>
                                    </v-flex>
                                    <v-flex xs3 class="title">
                                        <span>Time</span>
                                    </v-flex>
                                </v-layout>
                                <v-divider style="margin-bottom: 3%"></v-divider>
                                <v-layout row wrap v-for="bet in latestBets" :key="bet">
                                    <v-flex xs3 style="text-align: start" class="subheading" v-alt="bet.address">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <span v-on="on" v-text="bet.address.substring(0,8)+'...'"></span>
                                            </template>
                                            <span>{{bet.address}}</span>
                                        </v-tooltip>
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        <span>{{bet.country}}</span>
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        <span>{{bet.bet+"TRX"}}</span>
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        <span>{{bet.time}}</span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-tab-item>


        <v-tab-item id="tab-2">
            <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                    <!-- Countries -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="secondary lighten-4" dark>
                                <v-toolbar-title>Stats</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-container grid-list-md text-xs-center class="font-weight-light">
                                <v-layout row wrap>
                                    <v-flex xs6 style="text-align: start;" class="title">
                                        Country
                                    </v-flex>
                                    <v-flex xs6 style="text-align: end;" class="title">
                                        Owned Territories
                                    </v-flex>
                                </v-layout>

                                <v-divider style="margin-bottom: 3%"></v-divider>

                                <v-layout row wrap v-for="country in sortedArray" :key="country">
                                    <v-flex xs1>
                                        <img :src="getFlagString(country[0])" :alt="country[0]">
                                    </v-flex>
                                    <v-flex xs5 style="text-align: start" class="subheading">
                                        {{country[0]}}
                                    </v-flex>
                                    <v-flex xs6 class="title" style="text-align: end">
                                        {{country[1].length}}
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </v-flex>
                    <!-- History -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="secondary lighten-4" dark>
                                <v-toolbar-title>History</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-container grid-list-md text-xs-center class="font-weight-light">
                                <v-layout row wrap>
                                    <v-flex xs1 style="text-align: start;" class="title">
                                        Turn
                                    </v-flex>
                                    <v-flex xs7 class="title">
                                        Conquest
                                    </v-flex>
                                    <v-flex xs4 class="title">
                                        Prev. owned by
                                    </v-flex>
                                </v-layout>

                                <v-divider style="margin-bottom: 3%"></v-divider>

                                <v-layout row wrap v-for="conquest in history" :key="conquest">
                                    <v-flex xs1 style="text-align: start" class="subheading">
                                        {{conquest.turn}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading" style="color: green;">
                                        {{conquest.conquest[0]}}
                                    </v-flex>
                                    <v-flex xs1>
                                        <v-icon>arrow_forward</v-icon>
                                    </v-flex>
                                    <v-flex xs3 class="subheading" style="color: red;">
                                        {{conquest.conquest[1]}}
                                    </v-flex>
                                    <v-flex xs4 class="subheading" style="color: red;">
                                        {{conquest.prev}}
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-tab-item>
    </v-tabs>
</template>

<script>

    import {db} from '../plugins/firebase'

    String.prototype.replaceAll = function(search, replace) {
        if (replace === undefined) {
            return this.toString();
        }
        return this.split(search).join(replace);
    };

    export default {

        data: () => ({
            search: '',
            spain: "/img/flags/spain.svg",
            balance: 21471828.99,
            countries: [],
            jackpot: 10938147,
            betText: "Bet 50 TRX",
            currencies: ["TRX", "WAR"],
            currency: "TRX",
            currencyRule: [v => !!v || 'Select a currency',
                //v => v < 50 || 'You don\'t have enough money'
            ],
            history: [],
            countriesTest: {
                "turn": 804,
                "countries": [["El Salvador", [0, 1, 2, 25, 28, 48, 51, 52, 54, 60, 62, 85, 91, 93, 105, 131, 151, 160, 161, 167, 187, 201, 220, 223, 228]], ["Spain", [3, 7, 8, 16, 19, 20, 21, 26, 40, 50, 61, 65, 66, 72, 77, 78, 79, 80, 81, 83, 92, 96, 99, 104, 117, 118, 119, 123, 126, 127, 134, 135, 137, 141, 148, 150, 153, 169, 180, 186, 188, 196, 202, 211, 222, 239]], ["Bahrain", [4, 9, 24, 58, 100, 114, 130, 158, 173, 178, 207, 233]], ["Zimbabwe", [5, 18, 36, 45, 46, 49, 68, 75, 90, 98, 109, 121, 129, 140, 142, 143, 145, 146, 177, 192, 198, 215, 216, 234, 235, 236]], ["France", [6, 57, 59, 67]], ["Chile", [10, 41, 219]], ["Georgia", [11, 17, 55, 76, 101, 116, 200, 212, 217, 230]], ["Pitcairn Islands", [12, 47, 112, 132, 147, 152, 157, 172, 206, 209, 213, 218, 225, 226, 227]], ["Paraguay", [13, 32, 71, 86, 88, 170, 194, 210]], ["Antarctica", [14, 35, 174, 182]], ["New Zealand", [15, 149, 208]], ["Cambodia", [22, 33, 39, 53, 95, 97, 111, 115, 136, 144, 155, 163, 164, 165, 181, 204, 224, 231, 232]], ["Serbia", [23, 128, 133, 175, 191, 229]], ["Belarus", [27, 56, 94, 122, 124, 166, 195, 197]], ["Bermuda", [29, 38, 84, 190]], ["Ecuador", [30, 31]], ["Sri Lanka", [34]], ["[REDACTED]", [37, 44, 64, 179]], ["Japan", [42, 108, 176]], ["Gambia", [43]], ["Libya", [63]], ["Norway", [69, 238]], ["Papua New Guinea", [70, 74, 87, 156]], ["Wales", [73, 102, 237, 240]], ["Republic of Congo", [82, 183, 193]], ["Thailand", [89]], ["Turkey", [103, 171]], ["Jordan", [106]], ["Philippines", [107, 139]], ["Kyrgyzstan", [110, 159, 205, 221]], ["Taiwan", [113, 125, 138, 168, 214]], ["Nepal", [120]], ["Netherlands", [154, 184]], ["ABC Islands", [162]], ["Vanuatu", [185]], ["Somalia", [189, 199]], ["Ghana", [203]]],
                "countryList": [{"name":"Afghanistan","code":"AF"},{"name":"Åland Islands","code":"AX"},{"name":"Albania","code":"AL"},{"name":"Algeria","code":"DZ"},{"name":"American Samoa","code":"AS"},{"name":"AndorrA","code":"AD"},{"name":"Angola","code":"AO"},{"name":"Anguilla","code":"AI"},{"name":"Antarctica","code":"AQ"},{"name":"Antigua and Barbuda","code":"AG"},{"name":"Argentina","code":"AR"},{"name":"Armenia","code":"AM"},{"name":"Aruba","code":"AW"},{"name":"Australia","code":"AU"},{"name":"Austria","code":"AT"},{"name":"Azerbaijan","code":"AZ"},{"name":"Bahamas","code":"BS"},{"name":"Bahrain","code":"BH"},{"name":"Bangladesh","code":"BD"},{"name":"Barbados","code":"BB"},{"name":"Belarus","code":"BY"},{"name":"Belgium","code":"BE"},{"name":"Belize","code":"BZ"},{"name":"Benin","code":"BJ"},{"name":"Bermuda","code":"BM"},{"name":"Bhutan","code":"BT"},{"name":"Bolivia","code":"BO"},{"name":"Bosnia and Herzegovina","code":"BA"},{"name":"Botswana","code":"BW"},{"name":"Bouvet Island","code":"BV"},{"name":"Brazil","code":"BR"},{"name":"British Indian Ocean Territory","code":"IO"},{"name":"Brunei Darussalam","code":"BN"},{"name":"Bulgaria","code":"BG"},{"name":"Burkina Faso","code":"BF"},{"name":"Burundi","code":"BI"},{"name":"Cambodia","code":"KH"},{"name":"Cameroon","code":"CM"},{"name":"Canada","code":"CA"},{"name":"Cape Verde","code":"CV"},{"name":"Cayman Islands","code":"KY"},{"name":"Central African Republic","code":"CF"},{"name":"Chad","code":"TD"},{"name":"Chile","code":"CL"},{"name":"China","code":"CN"},{"name":"Christmas Island","code":"CX"},{"name":"Cocos (Keeling) Islands","code":"CC"},{"name":"Colombia","code":"CO"},{"name":"Comoros","code":"KM"},{"name":"Congo","code":"CG"},{"name":"Congo, The Democratic Republic of the","code":"CD"},{"name":"Cook Islands","code":"CK"},{"name":"Costa Rica","code":"CR"},{"name":"Cote D'Ivoire","code":"CI"},{"name":"Croatia","code":"HR"},{"name":"Cuba","code":"CU"},{"name":"Cyprus","code":"CY"},{"name":"Czech Republic","code":"CZ"},{"name":"Denmark","code":"DK"},{"name":"Djibouti","code":"DJ"},{"name":"Dominica","code":"DM"},{"name":"Dominican Republic","code":"DO"},{"name":"Ecuador","code":"EC"},{"name":"Egypt","code":"EG"},{"name":"El Salvador","code":"SV"},{"name":"Equatorial Guinea","code":"GQ"},{"name":"Eritrea","code":"ER"},{"name":"Estonia","code":"EE"},{"name":"Ethiopia","code":"ET"},{"name":"Falkland Islands (Malvinas)","code":"FK"},{"name":"Faroe Islands","code":"FO"},{"name":"Fiji","code":"FJ"},{"name":"Finland","code":"FI"},{"name":"France","code":"FR"},{"name":"French Guiana","code":"GF"},{"name":"French Polynesia","code":"PF"},{"name":"French Southern Territories","code":"TF"},{"name":"Gabon","code":"GA"},{"name":"Gambia","code":"GM"},{"name":"Georgia","code":"GE"},{"name":"Germany","code":"DE"},{"name":"Ghana","code":"GH"},{"name":"Gibraltar","code":"GI"},{"name":"Greece","code":"GR"},{"name":"Greenland","code":"GL"},{"name":"Grenada","code":"GD"},{"name":"Guadeloupe","code":"GP"},{"name":"Guam","code":"GU"},{"name":"Guatemala","code":"GT"},{"name":"Guernsey","code":"GG"},{"name":"Guinea","code":"GN"},{"name":"Guinea-Bissau","code":"GW"},{"name":"Guyana","code":"GY"},{"name":"Haiti","code":"HT"},{"name":"Heard Island and Mcdonald Islands","code":"HM"},{"name":"Holy See (Vatican City State)","code":"VA"},{"name":"Honduras","code":"HN"},{"name":"Hong Kong","code":"HK"},{"name":"Hungary","code":"HU"},{"name":"Iceland","code":"IS"},{"name":"India","code":"IN"},{"name":"Indonesia","code":"ID"},{"name":"Iran, Islamic Republic Of","code":"IR"},{"name":"Iraq","code":"IQ"},{"name":"Ireland","code":"IE"},{"name":"Isle of Man","code":"IM"},{"name":"Israel","code":"IL"},{"name":"Italy","code":"IT"},{"name":"Jamaica","code":"JM"},{"name":"Japan","code":"JP"},{"name":"Jersey","code":"JE"},{"name":"Jordan","code":"JO"},{"name":"Kazakhstan","code":"KZ"},{"name":"Kenya","code":"KE"},{"name":"Kiribati","code":"KI"},{"name":"Korea, Democratic People'S Republic of","code":"KP"},{"name":"Korea, Republic of","code":"KR"},{"name":"Kuwait","code":"KW"},{"name":"Kyrgyzstan","code":"KG"},{"name":"Lao People'S Democratic Republic","code":"LA"},{"name":"Latvia","code":"LV"},{"name":"Lebanon","code":"LB"},{"name":"Lesotho","code":"LS"},{"name":"Liberia","code":"LR"},{"name":"Libyan Arab Jamahiriya","code":"LY"},{"name":"Liechtenstein","code":"LI"},{"name":"Lithuania","code":"LT"},{"name":"Luxembourg","code":"LU"},{"name":"Macao","code":"MO"},{"name":"Macedonia, The Former Yugoslav Republic of","code":"MK"},{"name":"Madagascar","code":"MG"},{"name":"Malawi","code":"MW"},{"name":"Malaysia","code":"MY"},{"name":"Maldives","code":"MV"},{"name":"Mali","code":"ML"},{"name":"Malta","code":"MT"},{"name":"Marshall Islands","code":"MH"},{"name":"Martinique","code":"MQ"},{"name":"Mauritania","code":"MR"},{"name":"Mauritius","code":"MU"},{"name":"Mayotte","code":"YT"},{"name":"Mexico","code":"MX"},{"name":"Micronesia, Federated States of","code":"FM"},{"name":"Moldova, Republic of","code":"MD"},{"name":"Monaco","code":"MC"},{"name":"Mongolia","code":"MN"},{"name":"Montserrat","code":"MS"},{"name":"Morocco","code":"MA"},{"name":"Mozambique","code":"MZ"},{"name":"Myanmar","code":"MM"},{"name":"Namibia","code":"NA"},{"name":"Nauru","code":"NR"},{"name":"Nepal","code":"NP"},{"name":"Netherlands","code":"NL"},{"name":"Netherlands Antilles","code":"AN"},{"name":"New Caledonia","code":"NC"},{"name":"New Zealand","code":"NZ"},{"name":"Nicaragua","code":"NI"},{"name":"Niger","code":"NE"},{"name":"Nigeria","code":"NG"},{"name":"Niue","code":"NU"},{"name":"Norfolk Island","code":"NF"},{"name":"Northern Mariana Islands","code":"MP"},{"name":"Norway","code":"NO"},{"name":"Oman","code":"OM"},{"name":"Pakistan","code":"PK"},{"name":"Palau","code":"PW"},{"name":"Palestinian Territory, Occupied","code":"PS"},{"name":"Panama","code":"PA"},{"name":"Papua New Guinea","code":"PG"},{"name":"Paraguay","code":"PY"},{"name":"Peru","code":"PE"},{"name":"Philippines","code":"PH"},{"name":"Pitcairn","code":"PN"},{"name":"Poland","code":"PL"},{"name":"Portugal","code":"PT"},{"name":"Puerto Rico","code":"PR"},{"name":"Qatar","code":"QA"},{"name":"Reunion","code":"RE"},{"name":"Romania","code":"RO"},{"name":"Russian Federation","code":"RU"},{"name":"RWANDA","code":"RW"},{"name":"Saint Helena","code":"SH"},{"name":"Saint Kitts and Nevis","code":"KN"},{"name":"Saint Lucia","code":"LC"},{"name":"Saint Pierre and Miquelon","code":"PM"},{"name":"Saint Vincent and the Grenadines","code":"VC"},{"name":"Samoa","code":"WS"},{"name":"San Marino","code":"SM"},{"name":"Sao Tome and Principe","code":"ST"},{"name":"Saudi Arabia","code":"SA"},{"name":"Senegal","code":"SN"},{"name":"Serbia and Montenegro","code":"CS"},{"name":"Seychelles","code":"SC"},{"name":"Sierra Leone","code":"SL"},{"name":"Singapore","code":"SG"},{"name":"Slovakia","code":"SK"},{"name":"Slovenia","code":"SI"},{"name":"Solomon Islands","code":"SB"},{"name":"Somalia","code":"SO"},{"name":"South Africa","code":"ZA"},{"name":"South Georgia and the South Sandwich Islands","code":"GS"},{"name":"Spain","code":"ES"},{"name":"Sri Lanka","code":"LK"},{"name":"Sudan","code":"SD"},{"name":"Suriname","code":"SR"},{"name":"Svalbard and Jan Mayen","code":"SJ"},{"name":"Swaziland","code":"SZ"},{"name":"Sweden","code":"SE"},{"name":"Switzerland","code":"CH"},{"name":"Syrian Arab Republic","code":"SY"},{"name":"Taiwan, Province of China","code":"TW"},{"name":"Tajikistan","code":"TJ"},{"name":"Tanzania, United Republic of","code":"TZ"},{"name":"Thailand","code":"TH"},{"name":"Timor-Leste","code":"TL"},{"name":"Togo","code":"TG"},{"name":"Tokelau","code":"TK"},{"name":"Tonga","code":"TO"},{"name":"Trinidad and Tobago","code":"TT"},{"name":"Tunisia","code":"TN"},{"name":"Turkey","code":"TR"},{"name":"Turkmenistan","code":"TM"},{"name":"Turks and Caicos Islands","code":"TC"},{"name":"Tuvalu","code":"TV"},{"name":"Uganda","code":"UG"},{"name":"Ukraine","code":"UA"},{"name":"United Arab Emirates","code":"AE"},{"name":"United Kingdom","code":"GB"},{"name":"United States","code":"US"},{"name":"United States Minor Outlying Islands","code":"UM"},{"name":"Uruguay","code":"UY"},{"name":"Uzbekistan","code":"UZ"},{"name":"Vanuatu","code":"VU"},{"name":"Venezuela","code":"VE"},{"name":"Viet Nam","code":"VN"},{"name":"Virgin Islands, British","code":"VG"},{"name":"Virgin Islands, U.S.","code":"VI"},{"name":"Wallis and Futuna","code":"WF"},{"name":"Western Sahara","code":"EH"},{"name":"Yemen","code":"YE"},{"name":"Zambia","code":"ZM"},{"name":"Zimbabwe","code":"ZW"}],
            },
            // historyTest: [{"turn": 805, "conquest": ["Ciao", "Miao"], prev: "Isola di Pasqua"},
            //     {"turn": 804, "conquest": ["Bu", "Bi"], prev: "Isola di Pasqua"},
            //     {"turn": 803, "conquest": ["Pippo (tanto)", "Pluto"], prev: "Isola di Pasqua"},
            //     {"turn": 802, "conquest": ["Ghana", "Zimbawe"], prev: "Isola di Pasqua"},
            //     {"turn": 801, "conquest": ["Togo", "USA"], prev: "Isola di Pasqua"},
            //     {"turn": 800, "conquest": ["USA", "Giappone"], prev: "Isola di Pasqua"},
            //     {"turn": 799, "conquest": ["Mordor", "Gondor"], prev: "Isola di Pasqua"},
            //     {"turn": 798, "conquest": ["Freezer", "Namek"], prev: "Isola di Pasqua"},
            //     {"turn": 797, "conquest": ["Rohan", "Gondor"], prev: "Isola di Pasqua"},
            //     {"turn": 796, "conquest": ["Sith", "Naboo"], prev: "Isola di Pasqua"},
            //     {"turn": 795, "conquest": ["Daenerys", "King's Landing"], prev: "Isola di Pasqua"}],
            latestBets: [
                {
                    address: "afuyagfiyuarfgfiuaryntfiua",
                    country: "Mongolia",
                    bet: "50",
                    time: "10:01"
                },
                {
                    address: "gaiuhguairheguahguraohguoa",
                    country: "USA",
                    bet: "50",
                    time: "09:41"
                },
                {
                    address: "fjewifaujihguraehguahgughs",
                    country: "Russia",
                    bet: "50",
                    time: "08:01"
                },
                {
                    address: "agui5hgauyngiamigaig782ygh",
                    country: "Italia",
                    bet: "50",
                    time: "05:00"
                },
            ],
            myBets: [
                {
                    country: "Zimbawe",
                    bet: 7.5,
                    time: "10:00",
                    result: "won"
                },
                {
                    country: "Malawii",
                    bet: 2.3,
                    time: "10:00",
                    result: "pending"
                },
                {
                    country: "Togo",
                    bet: 5.0,
                    time: "10:00",
                    result: "lost"
                }
            ],
            ecosystem: [{
                text: 'vuetify-loader',
                href: 'https://github.com/vuetifyjs/vuetify-loader'
            },
                {
                    text: 'github',
                    href: 'https://github.com/vuetifyjs/vuetify'
                },
                {
                    text: 'awesome-vuetify',
                    href: 'https://github.com/vuetifyjs/awesome-vuetify'
                }
            ]
        }),
        
        firebase: {
            history: db.ref('history')
        },
    
        methods: {
            placeBet() {
                alert("Bet placed");
                
                //let contract_address = "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e";
                //window.tronWeb.contract().at(contract_address).then(contract => {
                  //  contract.bet(0, 59).send({callValue:window.tronWeb.toSun(1)})
                //});

                let contract_address = "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e";
                window.tronWeb.contract().at(contract_address).then(contract => {
                    contract.jackpot(0).call().then(res => {console.log(res.toString())})
                });

                // listen on this url
//                 Function: get events by contract address

                // subpath: $baseUrl/events/{contractAddress}

                // parameters   
                // limit: each page size, default is 25
                // sort: sort Field, default is sort by timeStamp descending order
                // since: start time of event occurrence, timeStamp >= since will be shown
                // block: block number, block number >= block will be shown
                // contractAddress: contract address
                // start: start page, default is 1
                // "https://api.tronex.io/events/TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e?limit=1&sort=-timeStamp&since=0&block=0&start=4"

                

            },
            getFlagString(str) {
                return "/img/flags/"+str.toLowerCase().replaceAll(" ", "-") + ".svg";
            }
        },
        props: ['currentCountry'],
        computed: {
            sortedArray: function () {
                function compare(a, b) {
                    if (a[1].length > b[1].length)
                        return -1;
                    if (a[1].length < b[1].length)
                        return 1;
                    return 0;
                }

                let arr = this.countriesTest.countries;
                return arr.sort(compare);
            }
        }
    }
</script>

<style>

</style>
