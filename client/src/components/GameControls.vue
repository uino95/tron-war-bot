<template>
    <v-tabs centered color="grey lighten-1" dark icons-and-text>
        <v-tabs-slider color="red lighten-4"></v-tabs-slider>

        <v-tab href="#tab-1">
            Recents
            <v-icon>phone</v-icon>
        </v-tab>

        <v-tab href="#tab-2">
            Favorites
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

                            <v-expansion-panel>
                                <v-expansion-panel-content v-for="country in countriesTest"
                                                           :key="country.name">
                                    <div slot="header">
                                        <v-layout row wrap>
                                            <v-flex xs4>
                                                <v-avatar>
                                                    <img :alt="country.name" :src="country.flag">
                                                </v-avatar>
                                            </v-flex>
                                            <v-flex xs4>
                                                <div class="title font-weight-light">{{country.name}}</div>
                                            </v-flex>
                                            <v-flex xs4>
                                                <div class="title font-weight-light text-xs-center">{{country.bet}}
                                                </div>
                                            </v-flex>
                                        </v-layout>
                                    </div>
                                    <v-card>
                                        <v-layout row wrap>
                                            <v-flex xs4>
                                                <v-text-field label="Bet" v-model="betting"></v-text-field>
                                            </v-flex>
                                            <v-flex xs4>
                                                <div class="title font-weight-light">
                                                    <span class="caption">Winning:</span>
                                                    <p>{{betting*country.bet}}</p>
                                                </div>
                                            </v-flex>
                                            <v-flex xs4>
                                                <v-btn>Bet</v-btn>
                                            </v-flex>
                                        </v-layout>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            <!--<v-list>
                                <v-list-tile
                                        v-for="country in countriesTest"
                                        :key="country.name"
                                        avatar>
                                    <v-list-tile-avatar>
                                        <img :alt="country.name" :src="country.flag">
                                    </v-list-tile-avatar>

                                    <v-list-tile-content>
                                        <v-list-tile-title v-text="country.name"></v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-list-tile-action-text class="title"
                                                                 v-text="country.bet"></v-list-tile-action-text>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>-->
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
                                <v-list-tile
                                        v-for="bet in myBets"
                                        :key="bet">
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
                        <v-card dark color="success">
                            <v-toolbar color="indigo" dark>
                                <v-toolbar-title>Latest turn bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-tab-item>

        <v-tab-item id="tab-2">
            <v-card flat>
                <v-card-text>{{ text }}</v-card-text>
            </v-card>
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
            betting: 0,
            computed: {
                filteredList() {
                    return this.countriesTest.filter(country => {
                        return country.name.toLowerCase().includes(this.search.toLowerCase())
                    })
                }
            },
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
