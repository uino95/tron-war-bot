<template>
  <!--
  <v-flex v-if="!showBetNextTab">
    <v-card >
      <v-card-text >
        <div class="text-xs-center display-1 text-capitalize">It will be available as next run starts</div>
      </v-card-text>
    </v-card>
  </v-flex> -->
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>
      <!-- Place a bet -->
      <v-flex>
        <v-card>

          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>Bet on Next Conqueror
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon color="secondary-next-tab" dark v-on="on">info</v-icon>
                </template>
                <span>Here you can bet on the next conqueror</span>
              </v-tooltip>
            </v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>


          <v-card-title primary-title class="justify-center">
            <v-flex md10>
              <v-form ref="form" v-model="valid" lazy-validation>

                <v-layout row wrap align-center justify-center>
                  <v-flex md8>
                    <v-autocomplete outline v-model="currentCountry" :items="mapping" item-text="name"
                      :loading="isLoading" item-value="numberId" hide-no-data hide-selected label="Select Country"
                      placeholder="Type in or pick from map"></v-autocomplete>
                  </v-flex>

                  <v-flex md4>
                    <v-text-field :value="potentialWin" label="Potential win" outline readonly></v-text-field>
                  </v-flex>
                </v-layout>

                <v-layout align-center justify-center row wrap>
                  <v-flex md4>
                    <v-text-field :value="winChance | probability " label="Win Chance" outline readonly></v-text-field>
                  </v-flex>

                  <v-flex md4>
                    <v-text-field :value="multiplier" label="Multiplier" outline readonly></v-text-field>
                  </v-flex>

                  <v-flex md4>
                    <core-timer isTurnTimer />
                  </v-flex>
                </v-layout>

                <v-layout row wrap>
                  <v-flex xs12>
                    <v-slider
                      thumb-label
                      v-model="betAmount"
                      min="50"
                      max="500"
                      label="Bet Amount"
                    ></v-slider>
                  </v-flex>
                </v-layout>
                <!-- <v-layout row wrap>
                  <v-flex md4>
                    <core-timer isTurnTimer />
                  </v-flex>

                  <v-flex md4>
                    <core-balance-button />
                  </v-flex>
                  <v-flex md4>
                    <v-text-field :value="info.jackpot?(parseFloat(info.jackpot).toFixed(3) + ' TRX'):'loading...'"
                      label="Current Jackpot" outline readonly></v-text-field>
                  </v-flex>
                </v-layout> -->


                <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" color="primary_next_tab" dark @click="placeBet">Bet {{betAmount}} {{currency}} {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}</v-btn>
                <v-btn v-else-if="info.serverStatus == 300" dark color="primary_next_tab" @click="battleInProgress">Battle in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 400" dark color="primary_next_tab" @click="payoutInProgress">Payout in progress...</v-btn>
                <v-btn v-else-if="data.serverStatus == 500" dark color="primary_final_tab" @click="gameOver">Game Over</v-btn>
              </v-form>
            </v-flex>
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
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>My Latest Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-container grid-list-md text-xs-centerm class="gameTab">

            <!-- if the user is not logged in -->
            <v-layout v-if="account == null" >
              <v-flex class="subheading">
                <v-chip label outline color="red">Login First</v-chip>
              </v-flex>
            </v-layout>

            <!-- if the user has already placed at least one bet -->
            <v-layout v-else-if="myBets.length === 0" >
              <v-flex class="subheading">
                <v-chip label outline color="red">No bets yet...</v-chip>
              </v-flex>
            </v-layout>

            <!-- else show the bets -->
            <v-layout v-else row wrap class="gameTabHeader">
              <v-flex xs5 class="title">
                Country
              </v-flex>
              <v-flex xs4 class="title">
                Bet
              </v-flex>
              <v-flex xs3 class="title">
                Turn
              </v-flex>

              <v-divider class="gameTabDivider"></v-divider>

              <v-container class="gameTabContent">
                <v-layout row wrap v-for="bet in myBets.slice(10 * currentMyBetPagination - 10, 10 * currentMyBetPagination)" :key="bet.time">
                  <v-flex xs5 class="subheading">
                    {{universalMap(bet.userChoice)}}
                  </v-flex>
                  <v-flex xs4 class="subheading">
                    {{bet.amount | TRX}}
                  </v-flex>
                  <v-flex xs3 class="subheading">
                    {{bet.turn}}
                  </v-flex>
                </v-layout>

                <v-container v-if="myBets.length > 10">
                  <v-pagination
                    v-model="currentMyBetPagination"
                    :length="Math.ceil(myBets.length/10)"
                    color="primary_next_tab"
                  ></v-pagination>
                </v-container>
              </v-container>

            </v-layout>

          </v-container>
        </v-card>
      </v-flex>

      <!-- Latest bets -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>Latest Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <!-- if the user is using a mobile device -->
          <v-container v-if="this.$store.state.isMobile" grid-list-md text-xs-center class="gameTab">

            <!-- if there are no bets -->
            <v-layout v-if="latestBets.length === 0">
              <v-flex class="subheading">
                <v-chip label outline color="red">No bets yet...</v-chip>
              </v-flex>
            </v-layout>

            <v-layout v-else row wrap class="gameTabHeader">
              <v-flex xs6 class="title">
                <span>Country</span>
              </v-flex>
              <v-flex xs3 class="title">
                <span>Bet</span>
              </v-flex>
              <v-flex xs3 class="title">
                <span>Turn</span>
              </v-flex>

              <v-divider class="gameTabDivider"></v-divider>
              <v-container class="gameTabContent" text-xs-center>

              <v-layout row wrap v-for="bet in latestBets.slice(10 * currentLatestBetPagination - 10, 10 * currentLatestBetPagination)" :key="bet.time">
                <v-flex xs6 class="subheading">
                  <span>{{universalMap(bet.userChoice)}}</span>
                </v-flex>
                <v-flex xs3 class="subheading">
                  <span>{{bet.amount | TRX}}</span>
                </v-flex>
                <v-flex xs3 class="subheading">
                  <span>{{bet.turn}}</span>
                </v-flex>
              </v-layout>

            </v-container>
              <v-container v-if="latestBets.length > 10">
              <v-pagination
                v-model="currentLatestBetPagination"
                :length="Math.ceil(latestBets.length/10)"
                color="primary_next_tab"
              >
              </v-pagination>
            </v-container>
            </v-layout>
          </v-container>

          <!-- else, the user is on pc -->
          <v-container v-else grid-list-md text-xs-center class="gameTab">

            <!-- if there are no bets -->
            <v-layout v-if="latestBets.length === 0">
              <v-flex class="subheading">
                <v-chip label outline color="red">No bets yet...</v-chip>
              </v-flex>
            </v-layout>

            <v-layout v-else row wrap class="gameTabHeader">
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

              <v-divider class="gameTabDivider"></v-divider>

              <v-container class="gameTabContent" text-xs-center>
                <v-layout row wrap v-for="bet in latestBets.slice(10 * currentLatestBetPagination - 10, 10 * currentLatestBetPagination)" :key="bet.time">

                  <v-flex xs3 class="subheading text-truncate">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" v-text="(bet.from)" v-bind:alt="(bet.from)"></span>
                      </template>
                      <span>{{bet.from}}</span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex xs5 class="subheading">
                    <span>{{universalMap(bet.userChoice)}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.amount | TRX}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.turn}}</span>
                  </v-flex>

                </v-layout>
              </v-container>

              <v-container v-if="latestBets.length > 10">
                <v-pagination
                  v-model="currentLatestBetPagination"
                  :length="Math.ceil(latestBets.length/10)"
                  color="primary_next_tab"
                ></v-pagination>
              </v-container>

            </v-layout>
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
      currentMyBetPagination: 1,
      currentLatestBetPagination: 1,
      betAmount: 1,
      showBetNextTab: false,
      isLoading: false,
      valid: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      info: {},
      snackbarTimeout: 6000,
      currencies: ["TRX", "WAR"],
      currency: "TRX",
      currencyRule: [v => !!v || 'Select a currency',
        //v => v < 50 || 'You don\'t have enough money'
      ],

      gameType: 1,
      minBet: 50,
      history: [],
      bets: [],
      mapStatus: [],
      mapping: mapping,
      isWaitingForConfirm: false,
      currentTxId: null
    }),

    firebase: {
      history: db.ref('history').orderByChild('turn'),
      bets: db.ref('bets').orderByChild('time'),
      info: db.ref('data'),
      mapStatus: db.ref('countriesMap')
    },

    filters: {
      RESULT: (result) =>{
        if (result < 0) {
          return '-'
        } else {
          return window.tronWeb.fromSun(result)
        }
      },
      TRX: (amount) => {
        return window.tronWeb.fromSun(amount) + 'TRX'
      },
      probability: (p) =>{
        return (p <= 0.1 && p > 0) ? 'very low' : p.toFixed(2) + ' %'
      }
    },

    methods: {

      async placeBet() {
        this.isWaitingForConfirm = true
        if (this.$store.state.loggedInAccount == null) {
          this.snackbarText = "Login First";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
        } else if (this.currentCountry == null) {
          this.snackbarText = "Select a country first";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
        } else {
          //console.log("instance ",this.$store.state.contracts.TronWarBotInstance)
          this.snackbarText = "The blockchain is processing your bet. Please wait...";
          this.snackbarColor = "info";
          this.snackbar = true;
          try {
            this.currentTxId = await this.$store.state.contracts.TronWarBotInstance.bet(this.gameType, this.currentCountry, this.info.turn).send({
              callValue: window.tronWeb.toSun(this.betAmount)
            })
          } catch {
            this.isWaitingForConfirm = false;
            this.snackbarColor = "error";
            this.snackbar = true;
            this.snackbarText = "Failed to sign transaction: Confirmation declined by user"
          }
        }
      },
      async postReferral(txId) {
        try {
          await axios.post(this.$store.state.test ? `http://localhost:3000/referral` :
            `https://api.tronwarbot.com/referral`, {
              user_addr: this.account,
              txId: txId,
              referrer_addr: window.location.pathname.slice(5)
            })
        } catch (e) {
          console.log(e)
          try{
            this.snackbarText = "[REFERRAL] " + e.response.data.message
            this.snackbarColor = "error";
            this.snackbarTimeout = 10000;
            this.snackbar = true;
          } catch(err){
            console.log(err)
            this.snackbarText = "[REFERRAL] Connection error. Referral not done"
            this.snackbarColor = "error";
            this.snackbarTimeout = 10000;
            this.snackbar = true;
          }
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
      gameOver(){
        this.snackbarText = "Game over. Be ready for the next run";
        this.snackbarColor = "info";
        this.snackbarTimeout = 2000;
        this.snackbar = true;
      },
      getProbability: async function (idCountry){
        let p = await db.ref('countriesMap').orderByKey().equalTo(idCountry.toString()).once('value')
        //let p = Math.random()
        //console.log(p.val()[idCountry].probability)
        return p.val()[idCountry].probability
      }
    },
    watch:{
      myBets: function() {
        let _this = this
        // console.log("ENTRO NEL TIMEOUT")
        if(this.currentTxId !== null){
          const txId = this.currentTxId
          window.tronWeb.trx.getTransaction(txId).then((tx) => {
            if (tx.ret[0].contractRet == "SUCCESS") {
              _this.snackbarColor = "success";
              _this.snackbarText =
                `Successfully placed a bet on ${_this.universalMap(_this.currentCountry)}!`;
              if (window.location.pathname.startsWith('/ref')) {
                _this.postReferral(txId)
              }
            } else {
              _this.snackbarText = tx.ret[0].contractRet;
              _this.snackbarColor = "error";
            }
            _this.snackbar = true
            _this.isWaitingForConfirm = false
          })
          this.currentTxId = null
        }
      }
    },
    computed: {
      myBets: function () {
        return this.bets.filter(bet => bet.from === this.account && bet.gameType == this.gameType).reverse()
      },
      latestBets: function () {
        return this.bets.filter(bet => bet.gameType == this.gameType).reverse().slice(0,20)
      },
      winChance: function (){
        let country = this.currentCountry
        if( country == null ) return 0;
        let p = this.mapStatus[country].probability * 100
        return p
      },
      multiplier: function(){
        let country = this.currentCountry
        if(country == null) return 0;
        return this.mapStatus[country].nextQuote
      },
      potentialWin: function(){
        let multiplier = this.multiplier;
        let win = (this.betAmount * multiplier).toFixed(3);

        if(win == Infinity) return 0 + " TRX";
        else return win + " TRX";
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
    }
  }
</script>

<style scoped>
  .info {
    width: 100%;
    height: 300px;
  }
</style>