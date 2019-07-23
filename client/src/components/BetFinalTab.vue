<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">

    <!-- Place a bet -->
    <v-layout row wrap>
      <v-flex>
        <v-card>

          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              <v-layout align-center justify-space-between row>
                <v-flex> Bet on World Conqueror </v-flex>
                <v-flex>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon color="secondary" dark v-on="on">info</v-icon>
                    </template>
                    <span>Here you can bet on the world conqueror</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-card-title primary-title class="justify-center">
            <v-form ref="form" v-model="valid" lazy-validation>

              <v-layout row align-center justify-center wrap>
                <v-flex md9>
                  <v-autocomplete outline v-model="currentCountry" :items="mapping" item-text="name"
                    :loading="isLoading" item-value="numberId" hide-no-data hide-selected label="Select Country"
                    placeholder="Type in or pick from map"></v-autocomplete>
                </v-flex>
              </v-layout>

              <v-layout align-center justify-center row wrap>
                <v-flex md3>
                  <v-tooltip slot="append" top>
                    <v-text-field slot="activator" :value="calculatePotentialWin" label="Potential win" outline disabled>
                    </v-text-field>
                    <span>Here you can see what you will win if you bet on the selected country. </span>
                  </v-tooltip>
                </v-flex>
                <v-flex md3>
                  <core-balance-button />
                </v-flex>
                <v-flex md3>
                  <v-text-field :value="info.jackpot?(parseFloat(info.jackpot).toFixed(3) + ' TRX'):'loading...'"
                    label="Current Jackpot" outline disabled></v-text-field>
                </v-flex>
              </v-layout>

              <v-btn v-if="info.serverStatus == 200" color="success" @click="placeBet">Bet {{info.minBet}} {{currency}} {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}</v-btn>
              <v-btn v-else-if="info.serverStatus == 300" color="info" @click="battleInProgress">Battle in progress...</v-btn>
              <v-btn v-else-if="info.serverStatus == 400" color="info" @click="payoutInProgress">Payout in progress...</v-btn>

              <!-- <v-flex md4>
                <v-btn color="warning">Cannot bet at the moment</v-btn>
              </v-flex> -->

            </v-form>
          </v-card-title>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" vertical bottom>
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
      <v-flex column wrap>

        <v-flex>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-toolbar-title>My Latest Bets</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <v-container grid-list-md text-xs-centerm class="gameTab">

              <!-- if the user has already placed at least one bet -->
              <v-layout v-if="myBets.length === 0">
                <v-flex class="subheading">
                  <v-chip label outline color="red">No bets yet...</v-chip>
                </v-flex>
              </v-layout>

              <!-- else show the bets -->
              <v-layout v-else row wrap class="gameTabHeader">
                <v-flex xs3 class="title">
                  Country
                </v-flex>
                <v-flex xs3 class="title">
                  Bet
                </v-flex>
                <v-flex xs3 class="title">
                  Turn
                </v-flex>
                <v-flex xs3 class="title">
                  Result
                </v-flex>

                <v-divider class="gameTabDivider"></v-divider>

                <v-container class="gameTabContent">
                  <v-layout row wrap v-for="bet in myBets" :key="bet.time">
                    <v-flex xs3 class="subheading">
                      {{universalMap(bet.country)}}
                    </v-flex>
                    <v-flex xs3 class="subheading">
                      {{bet.bet+"TRX"}}
                    </v-flex>
                    <v-flex xs3 class="subheading">
                      {{bet.turn}}
                    </v-flex>
                    <v-flex xs3 class="subheading" v-bind:class="{greenText: bet.result > 0, redText: bet.result == 0}">
                      {{convertResultBet(bet.result)}}
                    </v-flex>
                  </v-layout>
                </v-container>

              </v-layout>

            </v-container>
          </v-card>
        </v-flex>
        <!-- Latest bets -->
        <v-flex>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-toolbar-title>Latest Bets</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <!-- if the user is using a mobile device -->
            <v-container v-if="this.$store.state.isMobile" grid-list-md text-xs-center class="gameTab">

              <v-layout row wrap class="gameTabHeader">
                <v-flex xs6 class="title">
                  <span>Country</span>
                </v-flex>
                <v-flex xs3 class="title">
                  <span>Bet</span>
                </v-flex>
                <v-flex xs3 class="title">
                  <span>Turn</span>
                </v-flex>
              </v-layout>

              <v-divider class="gameTabDivider"></v-divider>
              <v-container class="gameTabContent" text-xs-center>

                <v-layout row wrap v-for="bet in latestBets" :key="bet.time">
                  <v-flex xs6 class="subheading">
                    <span>{{universalMap(bet.country)}}</span>
                  </v-flex>
                  <v-flex xs3 class="subheading">
                    <span>{{bet.bet+"TRX"}}</span>
                  </v-flex>
                  <v-flex xs3 class="subheading">
                    <span>{{bet.turn}}</span>
                  </v-flex>
                </v-layout>

              </v-container>
            </v-container>

            <!-- else, the user is on pc -->
            <v-container v-else grid-list-md text-xs-center class="gameTab">
              <v-layout row wrap class="gameTabHeader">
                <v-flex xs3 class="title">
                  <span>Address</span>
                </v-flex>
                <v-flex xs5 class="title">
                  <span>Country</span>
                </v-flex>
                <v-flex xs2 class="title">
                  <span>Bet</span>
                </v-flex>
                <v-flex xs2 class="title">
                  <span>Turn</span>
                </v-flex>
              </v-layout>
              <v-divider class="gameTabDivider"></v-divider>
              <v-container class="gameTabContent" text-xs-center>
                <v-layout row wrap v-for="bet in latestBets" :key="bet.time">

                  <v-flex xs3 class="subheading">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" v-text="bet.address.substring(0,5)+'..'" v-bind:alt="bet.address"></span>
                      </template>
                      <span>{{bet.address}}</span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex xs5 class="subheading">
                    <span>{{universalMap(bet.country)}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.bet+"TRX"}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.turn}}</span>
                  </v-flex>

                </v-layout>
              </v-container>
            </v-container>

          </v-card>
        </v-flex>
      </v-flex>

      <!-- Number of bets per country -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Number of bets per country</v-toolbar-title>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="gameTab">
            <v-layout align-center justify-space-between row wrap class="gameTabHeader">
              <v-flex style="text-align: start;" class="title">Country</v-flex>
              <v-flex style="text-align: end;" class="title">Placed bets</v-flex>
            </v-layout>

            <v-divider class="gameTabDivider"></v-divider>

            <v-container>
              <v-layout column>
                <v-layout row wrap v-for="country in betsPerCountry.slice(10 * currentRunPagination - 10, 10 * currentRunPagination )" :key="country.countryId">

                  <v-flex xs2>
                    <v-avatar>
                      <v-lazy-image :src-placeholder="placeholderFlag" @error="src = placeholderFlag" :src="getFlagString(universalMap(country.countryId))" :alt="country.countryId" />
                    </v-avatar>
                  </v-flex>
                  <v-flex xs6 style="text-align:start; margin-top:5px;" class="subheading">
                    {{universalMap(country.countryId)}}
                  </v-flex>
                  <v-flex xs4 class="title" style="text-align: end">
                    {{country.numberOfBets}}
                  </v-flex>
                </v-layout>

                <v-pagination
                  v-model="currentRunPagination"
                  :length="25"
                >
                </v-pagination>
              </v-layout>
            </v-container>

          </v-container>
        </v-card>
      </v-flex>
    </v-layout>


  </v-container>
</template>

<script>
  import {
    db
  }
  from '../plugins/firebase';
  import mapping from '../assets/mapping';
  import axios from 'axios'
  import DataIterable from "vuetify/lib/mixins/data-iterable";
  import VLazyImage from "v-lazy-image";

  String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
      return this.toString();
    }
    return this.split(search).join(replace);
  };

  export default {
    components: {
      DataIterable,
      VLazyImage
    },
    data: () => ({
      currentRunPagination:1,
      isLoading: false,
      valid: false,
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      info: {},
      snackbarTimeout: 6000,
      potentialWin: 0,
      currencies: ["TRX", "WAR"],
      currency: "TRX",
      currencyRule: [v => !!v || 'Select a currency',
        //v => v < 50 || 'You don\'t have enough money'
      ],
      history: [],
      bets: [],
      mapStatus: [],
      mapping: mapping,
      intervalId: null
    }),

    firebase: {
      history: db.ref('history').orderByChild('turn'),
      bets: db.ref('bets').orderByChild('time'),
      info: db.ref('data')
    },

    methods: {
      getFlagString(str) {
        str = "/img/flags/" + str.toLowerCase()
          .replaceAll(" ", "-")
          .replaceAll("ã", "a")
          .replaceAll("ì", "i")
          .replaceAll("è", "e")
          .replaceAll("ì", "i")
          .replaceAll("å", "a")
          .replaceAll("é", "e")
          .replaceAll("í", "i") + ".svg"
        console.log(str)
        return str;
      },
      placeBet: async function() {
        const _this = this
        if (this.$store.state.loggedInAccount == null) {
          this.snackbarText = "Login First";
          this.snackbarColor = "error";
          this.snackbar = true;
        } else if (this.currentCountry == null) {
          this.snackbarText = "Select a country from map or search it";
          this.snackbarColor = "error";
          this.snackbar = true;
        } else {
          this.snackbarText = "The blockchain is processing your bet. Please wait...";
          this.snackbarColor = "info";
          this.snackbar = true;
          let txId = await this.$store.state.contracts.TronWarBotInstance.bet(this.info.gameType, this.currentCountry).send({
            callValue: window.tronWeb.toSun(this.info.minBet)
          })
          setTimeout(function () {
            window.tronWeb.trx.getTransaction(txId).then((tx) => {
              if (tx.ret[0].contractRet == "SUCCESS") {
                _this.snackbarColor = "success";
                _this.snackbarText =
                  `Successfully placed a bet on ${_this.universalMap(_this.currentCountry)}!`;
                if (window.location.pathname.startsWith('/ref')) {
                  _this.postReferral(_txId)
                }
              } else {
                _this.snackbarText = tx.ret[0].contractRet;
                _this.snackbarColor = "error";
              }
              _this.snackbar = true
            })
          }, 5000)
        }
      },
      async postReferral(txId) {
        try {
          await axios.post(this.$store.state.test ? `https://localhost:3000/referral` :
            `https://api.tronwarbot.com:10000/referral`, {
              user_addr: this.account,
              txId: txId,
              referrer_addr: window.location.pathname.slice(5)
            })
        } catch (e) {
          this.snackbarText = "Something went wrong with the referral"
          this.snackbarColor = "error";
          this.snackbarTimeout = 2000;
          this.snackbar = true;
        }
      },
      battleInProgress() {
        this.snackbarText = "Battle in progress! Please wait...";
        this.snackbarColor = "info";
        this.snackbarTimeout = 2000;
        this.snackbar = true;
      },
      payoutInProgress() {
        this.snackbarText = "Payout in progress. Please wait a few more seconds...";
        this.snackbarColor = "info";
        this.snackbarTimeout = 2000;
        this.snackbar = true;
      },
      convertResultBet: function (betResult) {
        if (betResult < 0) {
          return '-'
        } else {
          return betResult
        }
      },
      formatTime: function (time) {
        let date = new Date(time)
        let hours = date.getHours()
        let min = date.getMinutes()
        let sec = date.getSeconds()
        hours = hours < 10 ? `0${hours}` : hours;
        sec = sec < 10 ? `0${sec}` : sec;
        min = min < 10 ? `0${min}` : min;
        return hours + ':' + min + ':' + sec
      }
    },
    computed: {
      countryStatus: function () {
        let result = [];
        let arr = [];
        let tmp = [];
        for (var i = this.mapStatus.length - 1; i >= 0; i--) {
          arr.push(this.universalMap(i));
          for (var j = this.mapStatus.length - 1; j >= 0; j--) {
            if (this.mapStatus[j]['controlledBy'] === i) {
              tmp.push(j)
            }
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
      myBets: function () {
        return this.bets.filter(bet => bet.address === this.account && bet.gameType == this.info.gameType).reverse()
      },
      //returns an array of objects [{countryId: "id", numberOfBets: x}, ...]
      betsPerCountry: function () {
        // it will contain all the countries for which there is at least one bet
        let countries = []
        this.bets.forEach(bet =>{
          countries.push(bet.country)
        })

        var betsPerCountryList = [];
        for (const x of Array(241).keys()) {
          betsPerCountryList.push({countryId: x, numberOfBets: 0})
        }

        for(var element of countries){
            betsPerCountryList[element].numberOfBets += 1;
        }

        betsPerCountryList.sort((a,b) => {
          return  b.numberOfBets - a.numberOfBets
        })

        return betsPerCountryList
      },
      latestBets: function () {
        return this.bets.filter(bet => bet.gameType == this.info.gameType).reverse()
      },
      calculatePotentialWin: function () {
        if (this.currentCountry == null) return 0;
        let nextTurn = this.info.nextTurn;
        let country = this.currentCountry;
        let betsOnThatCountry = this.latestBets.filter(function (bet) {
          return bet.turn == nextTurn && bet.country == country;
        }).length + 1
        return ((parseFloat(this.info.jackpot) + this.info.minBet) * (1 - this.info.houseEdge - 0.1) /
          betsOnThatCountry).toFixed(3) + ' TRX';
      },
      currentCountry: {
        get() {
          return this.$store.state.selectedCountry
        },
        set(value) {
          this.$store.commit('setSelectedCountry', value)
        }
      },
      account() {
        return this.$store.state.loggedInAccount
      }
    },
    mounted() {
      // this.fetchGameParam(0)
      //this.$refs.runTimer.startTimer();
    }
  }
</script>