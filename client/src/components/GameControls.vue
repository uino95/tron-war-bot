<template>
    <v-tabs centered color="grey lighten-1" dark icons-and-text>
        <v-tabs-slider color="red lighten-4"></v-tabs-slider>

        <v-tab href="#tab-1">
            Bet Panel
            <v-icon>phone</v-icon>
        </v-tab>

        <v-tab href="#tab-2">
            Current Run Stats
            <v-icon>favorite</v-icon>
        </v-tab>

        <v-tab href="#tab-3">
            Nearby
            <v-icon>account_box</v-icon>
        </v-tab>

        <v-tab-item id="tab-1">
            <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                    <!-- Place a bet -->
                    <v-flex xs4>
                        <v-card>
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>Place a bet</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-card-title primary-title class="justify-center">
                                <v-form ref="form"
                                        v-model="valid"
                                        lazy-validation>
                                    <v-text-field v-model="country"
                                                  label="Country"
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

                                    <v-btn color="success" @click="validate"> {{betText}}</v-btn>
                                </v-form>
                            </v-card-title>
                        </v-card>
                    </v-flex>
                    <!-- My latest bets -->
                    <v-flex xs4>
                        <v-card>
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>My Latest Bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-list>
                                <v-list-tile v-for="bet in myBets" :key="bet">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-text="bet.country"></v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-list-tile-action-text class="title"
                                                                 v-text="bet.bet"></v-list-tile-action-text>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                    <!-- Latest turn bets -->
                    <v-flex xs4>
                        <v-card color="success">
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>Latest turn bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-list>
                                <v-list-tile v-for="bet in myBets" :key="bet">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-text="bet.country"></v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-list-tile-action-text class="title"
                                                                 v-text="bet.bet"></v-list-tile-action-text>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-tab-item>

        <v-tab-item id="tab-2">
            <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                    <!-- Countries -->
                    <v-flex xs6>
                        <v-card>
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>Stats</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-list>
                                <v-list-tile v-for="country in sortedArray" :key="country[0]">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-text="country[0]"></v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-list-tile-action-text class="title"
                                                                 v-text="country[1].length"></v-list-tile-action-text>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                    <!-- History -->
                    <v-flex xs6>
                        <v-card>
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>History</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-list>
                                <v-list-tile v-for="conquest in historyTest" :key="conquest.turn">
                                    <v-list-tile-avatar>
                                        <v-list-tile-title v-text="conquest.turn"></v-list-tile-title>
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title class="justify-center">
                                            {{conquest.conquest[0]}}<v-icon>arrow_forward</v-icon>{{conquest.conquest[1]}}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-tab-item>

        <v-tab-item id="tab-3">
            <v-card flat>
                <v-card-text>{{ text }}</v-card-text>
            </v-card>
        </v-tab-item>
    </v-tabs>
</template>

<script>
    export default {
        data: () => ({
            text: "ciaooooooooooo nsakfdjed skndlej deandnlnd jdnew",
            search: '',
            country: "USA",
            computed: {},
            countries: [],
            jackpot: 10938147,
            betText: "Bet 50 TRX",
            currencies: ["TRX", "WAR"],
            currency: "TRX",
            currencyRule: [v => !!v || 'Select a currency',
                //v => v < 50 || 'You don\'t have enough money'
            ],
            countriesTest: {
                "turn": 804,
                "countries": [["El Salvador", [0, 1, 2, 25, 28, 48, 51, 52, 54, 60, 62, 85, 91, 93, 105, 131, 151, 160, 161, 167, 187, 201, 220, 223, 228]], ["Spain", [3, 7, 8, 16, 19, 20, 21, 26, 40, 50, 61, 65, 66, 72, 77, 78, 79, 80, 81, 83, 92, 96, 99, 104, 117, 118, 119, 123, 126, 127, 134, 135, 137, 141, 148, 150, 153, 169, 180, 186, 188, 196, 202, 211, 222, 239]], ["Bahrain", [4, 9, 24, 58, 100, 114, 130, 158, 173, 178, 207, 233]], ["Zimbabwe", [5, 18, 36, 45, 46, 49, 68, 75, 90, 98, 109, 121, 129, 140, 142, 143, 145, 146, 177, 192, 198, 215, 216, 234, 235, 236]], ["France", [6, 57, 59, 67]], ["Chile", [10, 41, 219]], ["Georgia", [11, 17, 55, 76, 101, 116, 200, 212, 217, 230]], ["Pitcairn Islands", [12, 47, 112, 132, 147, 152, 157, 172, 206, 209, 213, 218, 225, 226, 227]], ["Paraguay", [13, 32, 71, 86, 88, 170, 194, 210]], ["Antarctica", [14, 35, 174, 182]], ["New Zealand", [15, 149, 208]], ["Cambodia", [22, 33, 39, 53, 95, 97, 111, 115, 136, 144, 155, 163, 164, 165, 181, 204, 224, 231, 232]], ["Serbia", [23, 128, 133, 175, 191, 229]], ["Belarus", [27, 56, 94, 122, 124, 166, 195, 197]], ["Bermuda", [29, 38, 84, 190]], ["Ecuador", [30, 31]], ["Sri Lanka", [34]], ["[REDACTED]", [37, 44, 64, 179]], ["Japan", [42, 108, 176]], ["Gambia", [43]], ["Libya", [63]], ["Norway", [69, 238]], ["Papua New Guinea", [70, 74, 87, 156]], ["Wales", [73, 102, 237, 240]], ["Republic of Congo", [82, 183, 193]], ["Thailand", [89]], ["Turkey", [103, 171]], ["Jordan", [106]], ["Philippines", [107, 139]], ["Kyrgyzstan", [110, 159, 205, 221]], ["Taiwan", [113, 125, 138, 168, 214]], ["Nepal", [120]], ["Netherlands", [154, 184]], ["ABC Islands", [162]], ["Vanuatu", [185]], ["Somalia", [189, 199]], ["Ghana", [203]]]
            },
            historyTest: [{"turn": 805, "conquest": ["ciao", "miao"]}, {
                "turn": 804,
                "conquest": ["bu", "bi"]
            }, {"turn": 803, "conquest": ["pippo (tanto)", "pluto"]}],
            myBets: [
                {
                    country: "Zimbawe",
                    bet: 7.5,
                    result: "won"
                },
                {
                    country: "Malawii",
                    bet: 2.3,
                    result: "pending"
                },
                {
                    country: "Togo",
                    bet: 5.0,
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
        methods: {
            validate() {
                alert("Bet placed");
            }
        },
        computed: {
            sortedArray: function () {
                function compare(a, b) {
                    if (a[1].length > b[1].length)
                        return -1;
                    if (a[1].length < b[1].length)
                        return 1;
                    return 0;
                }
                return this.countriesTest.countries.sort(compare);
            }
        }
    }
</script>

<style>

</style>
