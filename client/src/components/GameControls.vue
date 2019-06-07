<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-tabs centered color="secondary" dark icons-and-text>
        <v-tabs-slider color="secondary"></v-tabs-slider>

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
                            <v-toolbar color="primary" dark>
                                <v-toolbar-title>Place a bet</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-card-title primary-title class="justify-center">
                                <v-form ref="form"
                                        v-model="valid"
                                        lazy-validation>
                                    <v-layout row wrap>
                                        <v-flex xs4>
                                            <v-autocomplete
                                                    outline
                                                    v-model="currentCountry"
                                                    :items="mapping"
                                                    item-text="name"
                                                    :loading="isLoading"
                                                    :search-input.sync="search"
                                                    item-value="numberId"
                                                    hide-no-data
                                                    hide-selected
                                                    label="Select Country"
                                                    placeholder="Start typing or pick from map"
                                            ></v-autocomplete>
                                        </v-flex>
                                        <v-flex xs4>
                                            <v-text-field v-model="calculatePotentialWin"
                                                          label="Potential win"
                                                          outline
                                                          disabled></v-text-field>
                                        </v-flex>
                                        <v-flex xs4>
                                            <v-text-field v-model="info.nextTurn"
                                                          label="Next Turn"
                                                          outline
                                                          disabled></v-text-field>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout row wrap>
                                        <v-flex xs4>
                                            <v-text-field v-model="balance"
                                                          label="Your Balance"
                                                          outline
                                                          disabled></v-text-field>
                                        </v-flex>
                                        <v-flex xs4>

                                            <v-text-field v-model="info.jackpot"
                                                          label="Current Jackpot"
                                                          outline
                                                          disabled></v-text-field>
                                        </v-flex>
                                        <v-flex xs4>
                                            <!--<v-select
                                                    v-model="currency"
                                                    :items="currencies"
                                                    :rules="currencyRule"
                                                    label="Currency"
                                                    required
                                                    outline
                                            ></v-select>-->
                                            <v-text-field v-model="currency"
                                                          label="Currency"
                                                          outline
                                                          disabled></v-text-field>
                                        </v-flex>
                                    </v-layout>

                                    <v-btn color="success" @click="placeBet">Bet 50 {{currency}}</v-btn>


                                </v-form>
                            </v-card-title>
                            <v-snackbar
                                    v-model="snackbar"
                                    :color="snackbarColor"
                                    :timeout="snackbarTimeout"
                                    vertical
                                    bottom>
                                <span class="title">{{snackbarText}}</span>
                                <v-btn dark flat @click="snackbar = false">
                                    Close
                                </v-btn>
                            </v-snackbar>
                        </v-card>
                    </v-flex>
                </v-layout>
                <v-layout row wrap>
                    <!-- My latest bets -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="primary" dark>
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
                                <v-layout row wrap v-for="bet in myBets" :key="bet.time">
                                    <v-flex xs3 class="subheading">
                                        {{universalMap(bet.country)}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{bet.bet+"TRX"}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{bet.time}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading">
                                        {{convertResultBet(bet.result)}}
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card>
                    </v-flex>
                    <!-- Latest turn bets -->
                    <v-flex>
                        <v-card>
                            <v-toolbar color="primary" dark>
                                <v-toolbar-title>Latest turn bets</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn icon>
                                    <v-icon>sort</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-container grid-list-md text-xs-center>
                                <v-layout row wrap>
                                    <v-flex xs4 style="text-align: start" class="title">
                                        <span>Address</span>
                                    </v-flex>
                                    <v-flex xs2 class="title">
                                        <span>Country</span>
                                    </v-flex>
                                    <v-flex xs2 class="title">
                                        <span>Bet</span>
                                    </v-flex>
                                    <v-flex xs2 class="title">
                                        <span>Time</span>
                                    </v-flex>
                                    <v-flex xs2 class="title">
                                        Result
                                    </v-flex>
                                </v-layout>
                                <v-divider style="margin-bottom: 3%"></v-divider>

                                <v-layout row wrap v-for="bet in latestBets" :key="bet">
                                    <v-flex xs4 style="text-align: start" class="subheading">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <span v-on="on" v-text="bet.address.substring(0,12)+'...'"></span>
                                            </template>
                                            <span>{{bet.address}}</span>
                                        </v-tooltip>
                                    </v-flex>
                                    <v-flex xs2 class="subheading">
                                        <span>{{universalMap(bet.country)}}</span>
                                    </v-flex>
                                    <v-flex xs2 class="subheading">
                                        <span>{{bet.bet+"TRX"}}</span>
                                    </v-flex>
                                    <v-flex xs2 class="subheading">
                                        <span>{{bet.time}}</span>
                                    </v-flex>
                                    <v-flex xs2 class="subheading">
                                        {{convertResultBet(bet.result)}}
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
                    <v-flex xs6>
                        <v-card>
                            <v-toolbar color="primary" dark>
                                <v-toolbar-title>Stats</v-toolbar-title>
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

                                <v-layout row wrap v-for="country in sortedArray" :key="country[0]">
                                    <v-flex xs1>
                                        <v-avatar size="90%">
                                            <img :src="getFlagString(country[0])" :alt="country[0]">
                                        </v-avatar>
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
                    <v-flex xs6>
                        <v-card>
                            <v-toolbar color="primary" dark>
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

                                <v-layout row wrap v-for="conquest in history" :key="conquest.turn">
                                    <v-flex xs1 style="text-align: start" class="subheading">
                                        {{conquest.turn}}
                                    </v-flex>
                                    <v-flex xs3 class="subheading" style="color: green;">
                                        {{universalMap(conquest.conquest[0])}}
                                    </v-flex>
                                    <v-flex xs1>
                                        <v-icon>arrow_forward</v-icon>
                                    </v-flex>
                                    <v-flex xs3 class="subheading" style="color: red;">
                                        {{universalMap(conquest.conquest[1])}}
                                    </v-flex>
                                    <v-flex xs4 class="subheading" style="color: red;">
                                        {{universalMap(conquest.prev)}}
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
    import mapping from '../assets/mapping'


    String.prototype.replaceAll = function (search, replace) {
        if (replace === undefined) {
            return this.toString();
        }
        return this.split(search).join(replace);
    };

    export default {

        data: () => ({
            search: '',
            snackbar: false,
            snackbarText: "",
            snackbarColor: "",
            info: {},
            snackbarTimeout: 6000,
            potentialWin: 0,
            betText: "Bet 50 TRX",
            currencies: ["TRX", "WAR"],
            currency: "TRX",
            currencyRule: [v => !!v || 'Select a currency',
                //v => v < 50 || 'You don\'t have enough money'
            ],
            balance: null,
            account: null,
            history: [],
            bets: [],
            mapStatus: [],
            mapping: mapping

        }),

        firebase: {
            history: db.ref('history').orderByChild('turn'),
            bets: db.ref('bets'),
            info: db.ref('data'),
            mapStatus: db.ref('countries')
        },

        methods: {
            placeBet() {
                let _this = this;
                if (this.currentCountry == null) {

                    this.snackbarText = "Select a country from map or search it";
                    this.snackbarColor = "error";
                    this.snackbar = true;
                } else {
                    this.snackbarText = "We are processing your bet! Wait for the result";
                    this.snackbarColor = "info";
                    this.snackbar = true;
                    let _txId;
                    let contract_address = "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e";
                    window.tronWeb.contract().at(contract_address).then(contract => {
                     contract.bet(0, _this.currentCountry).send({callValue:window.tronWeb.toSun(1)}).then(
                        txId => _txId = txId)
                    });

                    setTimeout(function(){
                        window.tronWeb.trx.getTransaction(_txId).then(tx => {
                            if (tx.ret[0].contractRet=="SUCCESS") {
                                _this.snackbarColor = "success";
                                _this.snackbarText = `Successfully bet on ${_this.universalMap(_this.currentCountry)}!`;
                                setTimeout(function(){
                                    _this.fetchBalance()
                                }, 2000)
                            }
                            else {
                                _this.snackbarText = tx.ret[0].contractRet;
                                _this.snackbarColor = "error";
                            }
                            _this.snackbar = true
                        })
                    }, 10000)
                }
            },
            async fetchAccount(){
                const account = await window.tronWeb.trx.getAccount();
                const accountAddress = account.address; // HexString(Ascii)
                const accountAddressInBase58 = window.tronWeb.address.fromHex(
                  accountAddress
                ); // Base58

                this.account = accountAddressInBase58

            },
            async fetchBalance(){
                const balanceInSun = await window.tronWeb.trx.getBalance(); //number
                const balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
                // const changeBackToSun = window.tronWeb.toSun(balanceInTRX); //string

                this.balance = balanceInTRX
            },
            getFlagString(str) {
                return "/img/flags/" + str.toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll("ã", "a")
                    .replaceAll("ì", "i")
                    .replaceAll("è", "e")
                    .replaceAll("ì", "i")
                    .replaceAll("å", "a")
                    .replaceAll("é", "e")
                    .replaceAll("í", "i") + ".svg";
            },
            setTimer: function () {
                const time = new Date();
                let min = time.getMinutes();
                let sec = time.getSeconds();
                if (min >= 15) {
                    min = 74 - min;
                } else {
                    min = 14 - min;
                }
                sec = 59- sec;
                sec = sec < 10 ? `0${sec}` : sec;
                min = min < 10 ? `0${min}` : min;
                this.turnTimer = `${min}:${sec}`;
            },
            startTimer: function () {
                setInterval(() => {
                    //this.setTimer();
                }, 1000);
            },
            convertResultBet: function(betResult){
                if(betResult < 0){
                    return '-'
                } else {
                    return betResult
                }
            }
        },
        props: ['currentCountry'],
        computed: {
            countryStatus: function(){
                let result = [];
                let arr = [];
                let tmp = [];
                for (var i = this.mapStatus.length - 1; i >= 0; i--) {
                    arr.push(this.universalMap(i));
                    for (var j = this.mapStatus.length - 1; j >= 0; j--) {
                        if(this.mapStatus[j]['controlledBy'] === i){tmp.push(j)}
                    }
                    arr.push(tmp);
                    tmp = [];
                    result.push(arr);
                    arr = []
                }
                return result
            },
            sortedArray: function () {
                function compare(a, b) {
                    if (a[1].length > b[1].length)
                        return -1;
                    if (a[1].length < b[1].length)
                        return 1;
                    return 0;
                }

                let arr = this.countryStatus;
                return arr.sort(compare);
            },
            myBets: function() {
                return this.bets.filter(bet => bet.address === this.account)
            },
            latestBets: function() {
                return this.bets.slice(-10, this.bets.lenght)
            },
            calculatePotentialWin: function () {
                //TODO replace
                if (this.currentCountry == null) return 0;
                return (this.info.jackpot + 50) * 0.7 / this.universalMap(this.currentCountry).length;
            },
        },
        mounted() {
            window.onmessage = (event) => {
              // Waiting for that message.

              if(event.data.message.action === 'setAccount'){
                this.fetchBalance();
                this.fetchAccount();
              }
            };
            this.fetchBalance();
            this.fetchAccount();
            this.startTimer();
        }
    }
</script>

<style>

</style>
