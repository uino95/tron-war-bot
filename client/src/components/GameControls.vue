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
                    <!-- Place a bet -->
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
                    <!-- My latest bets -->
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
            jackpot: 10938147,
            betText: "Bet 50 TRX",
            currencies: ["TRX", "WAR"],
            currency: "TRX",
            currencyRule: [v => !!v || 'Select a currency',
                //v => v < 50 || 'You don\'t have enough money'
            ],
            countriesTest: [
                {
                    name: "Malawii",
                    bet: 1.5,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Flag_of_Malawi.svg"
                },
                {
                    name: "Zimbawe",
                    bet: 7.4,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Non",
                    bet: 4.5,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Ho",
                    bet: 4.4,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Voglia",
                    bet: 6.0,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Di",
                    bet: 9.9,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Mettere",
                    bet: 6.6,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Le",
                    bet: 2.8,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                },
                {
                    name: "Bandiere",
                    bet: 3.5,
                    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/1200px-Flag_of_Zimbabwe.svg.png"
                }
            ],
            watch: {
                currency: function (newVal) {
                    if (newVal.equals("TRX")) {
                        this.betText = "Bet 50 TRX";
                    } else {
                        this.betText = "Bet 1 WAR";
                    }
                }
            },
            methods: {
                validate() {
                    alert(this.$refs.form.$data);
                },
            },
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
        })
    }
</script>

<style>

</style>
