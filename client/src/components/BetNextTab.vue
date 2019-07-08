<template>
<v-container grid-list-md text-xs-center class="outerTabContainer">
  <v-layout row wrap>
    <!-- Place a bet -->
    <v-flex>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Bet on Next Conqueror
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="secondary" dark v-on="on">info</v-icon>
              </template>
              <span>Here you can bet on the next conqueror</span>
            </v-tooltip>
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-title primary-title class="justify-center">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-layout row wrap>
              <v-flex md4>
                <v-autocomplete outline v-model="currentCountry" :items="mapping" item-text="name" :loading="isLoading" :search-input.sync="search" item-value="numberId" hide-no-data hide-selected label="Select Country"
                  placeholder="Type in or pick from map"></v-autocomplete>
              </v-flex>
              <v-flex md4>
                <v-text-field :value="calculatePotentialWin" label="Potential win" outline disabled></v-text-field>
              </v-flex>
              <v-flex md4>
                <core-timer ref="turnTimer" isTurnTimer/>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex md4>
                <v-text-field :value="balance?(balance + ' TRX'):'no account'" label="Your Balance" outline disabled></v-text-field>
              </v-flex>
              <v-flex md4>
                <v-text-field :value="info.jackpot?(parseFloat(info.jackpot).toFixed(3) + ' TRX'):'loading...'" label="Current Jackpot" outline disabled></v-text-field>
              </v-flex>
              <v-flex md4>
                <!--<v-select
                                                      v-model="currency"
                                                      :items="currencies"
                                                      :rules="currencyRule"
                                                      label="Currency"
                                                      required
                                                      outline
                                              ></v-select>-->
                <v-text-field v-model="currency" label="Currency" outline disabled></v-text-field>
              </v-flex>
            </v-layout>
            <b>Spain conqured the world! <br>Next run will start soon. Stay tuned!</b>
            <br>
            <!-- <v-btn v-if="info.serverStatus == 200" color="success" @click="placeBet">Bet {{info.minBet}} {{currency}} {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}</v-btn>
              <v-btn v-else-if="info.serverStatus == 300" color="info" @click="battleInProgress">Battle in progress...</v-btn>
              <v-btn v-else-if="info.serverStatus == 400" color="info" @click="payoutInProgress">Payout in progress...</v-btn> -->
            <v-btn color="warning">Cannot bet at the moment</v-btn>
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
    <v-flex>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>My Latest Bets</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-container grid-list-md text-xs-centerm class="gameTab">
          <v-layout row wrap class="gameTabHeader">
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
          </v-layout>
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
        <v-container grid-list-md text-xs-center class="gameTab">
          <v-layout row wrap class="gameTabHeader">
            <v-flex xs2 class="title">
              <span>Address</span>
            </v-flex>
            <v-flex xs4 class="title">
              <span>Country</span>
            </v-flex>
            <v-flex xs2 class="title" style="text-align: start;">
              <span>Bet</span>
            </v-flex>
            <v-flex xs2 class="title" style="text-align: start;">
              <span>Turn</span>
            </v-flex>
            <v-flex xs2 class="title" style="text-align: start;">
              Result
            </v-flex>
          </v-layout>
          <v-divider class="gameTabDivider"></v-divider>
          <v-container class="gameTabContent" text-xs-center>
            <v-layout row wrap v-for="bet in latestBets" :key="bet.time">
              <v-flex xs2 class="subheading">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on" v-text="bet.address.substring(0,5)+'..'" v-bind:alt="bet.address"></span>
                  </template>
                  <span>{{bet.address}}</span>
                </v-tooltip>
              </v-flex>
              <v-flex xs4 class="subheading">
                <span>{{universalMap(bet.country)}}</span>
              </v-flex>
              <v-flex xs2 class="subheading">
                <span>{{bet.bet+"TRX"}}</span>
              </v-flex>
              <v-flex xs2 class="subheading">
                <span>{{bet.turn}}</span>
              </v-flex>
              <v-flex xs2 class="subheading" v-bind:class="{greenText: bet.result > 0, redText: bet.result == 0}">
                {{convertResultBet(bet.result)}}
              </v-flex>
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

export default {
  data: () => ({
    isLoading: false,
    valid: false,
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
    placeBet() {
      let _this = this;
      if (!window.tronWeb || !window.tronWeb.ready) {
        this.$emit('showModal', 'login')
      } else if (this.currentCountry == null) {
        this.snackbarText = "Select a country from map or search it";
        this.snackbarColor = "error";
        this.snackbar = true;
      } else {
        this.snackbarText = "The blockchain is processing your bet. Please wait...";
        this.snackbarColor = "info";
        this.snackbar = true;
        let _txId;
        let contract_address = "TQXiV4TeKS4zF54PiCsUyKTQ22yYY6KuzL";
        window.tronWeb.contract().at(contract_address).then(contract => {
          contract.bet(0, _this.currentCountry).send({
            callValue: window.tronWeb.toSun(this.info.minBet)
          }).then(
            txId => _txId = txId)
        });
        setTimeout(function() {
          window.tronWeb.trx.getTransaction(_txId).then(tx => {
            if (tx.ret[0].contractRet == "SUCCESS") {
              _this.snackbarColor = "success";
              _this.snackbarText = `Successfully placed a bet on ${_this.universalMap(_this.currentCountry)}!`;
              if (window.location.pathname.startsWith('/ref')) {
                _this.postReferral(_txId)
              }
              setTimeout(function() {
                _this.$store.dispatch('updateAccountBalance')
              }, 2000)
            } else {
              _this.snackbarText = tx.ret[0].contractRet;
              _this.snackbarColor = "error";
            }
            _this.snackbar = true
          })
        }, 10000)
      }
    },
    async postReferral(txId) {
      try {
        await axios.post(`https://tronwarbot.herokuapp.com/referral`, {
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
    convertResultBet: function(betResult) {
      if (betResult < 0) {
        return '-'
      } else {
        return betResult
      }
    },
    formatTime: function(time) {
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
    countryStatus: function() {
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
    sortedArray: function() {
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
      return this.bets.filter(bet => bet.address === this.account).reverse()
    },
    latestBets: function() {
      return this.bets.slice(-30, this.bets.lenght).reverse()
    },
    calculatePotentialWin: function() {
      if (this.currentCountry == null) return 0;
      let nextTurn = this.info.nextTurn;
      let country = this.currentCountry;
      let betsOnThatCountry = this.latestBets.filter(function(bet) {
        return bet.turn == nextTurn && bet.country == country;
      }).length + 1
      return ((parseFloat(this.info.jackpot) + this.info.minBet) * (1 - this.info.houseEdge - 0.1) / betsOnThatCountry).toFixed(3) + ' TRX';
    },
    currentCountry: {
      get() {
        return this.$store.state.selectedCountry
      },
      set(value) {
        this.$store.commit('setSelectedCountry', value)
      }
    },
    balance() {
      return this.$store.state.accountBalance
    },
    account() {
      return this.$store.state.loggedInAccount
    }
  },
  mounted() {
    // this.fetchGameParam(0)
    this.$refs.turnTimer.startTimer();
  }
}
</script>
