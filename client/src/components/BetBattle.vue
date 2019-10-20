<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>
      <!-- Place a bet -->
      <v-flex>
        <v-card>

          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>Bet on the outcome of the current battle
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon color="secondary-next-tab" dark v-on="on">info</v-icon>
                </template>
                <span>Here you can see who is fighting right now. If you feel that you can predict the outcome of this
                  epic battle just choose your part and bet on it. 1 stand for the offender the one the left, 2 stands
                  for the defender the one on the right, x stands for a peaceful resolution.</span>
              </v-tooltip>
            </v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>


          <v-card-title primary-title class="justify-center">
            <v-flex md10>

              <v-card class="mb-4">
                <v-img class="white--text" :position="history[0].next.civilWar == 1 ? 'bottom 75% center' : 'center'" :aspect-ratio="this.windowSize.x/50" :src=" history[0].next.civilWar == 1 ? 'img/civilWar9.png' : 'img/vs-battle.jpg'">
                  <v-layout class="mt-4" row wrap align-center justify-space-between>
                    <v-flex ml-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                          class="title pb-2 truncate">{{universalMap(history[0].next.o)}} </div>
                          </template>
                          <span>{{universalMap(history[0].next.o)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-if="hover" v-on:click="toggle_country(history[0].next.o,1)">
                              <div class="title"> 1 </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_next_tab" v-else-if="currentChoice==1"
                              v-on:click="toggle_country(history[0].next.o,1)">
                              <div class="title"> 1 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.o))"
                              :alt="universalMap(history[0].next.o)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                            <v-btn large icon dark color="primary_next_tab" v-if="currentChoice==1"
                              v-on:click="toggle_country(history[0].next.o,1)">
                              <div class="title"> 1 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.o))"
                              :alt="universalMap(history[0].next.o)" v-on:click="toggle_country(history[0].next.o,1)"/>
                        </v-avatar>
                        <div class="title pt-2">{{history[0].next.probabilities[1] | probability}}</div>
                      </v-layout>
                    </v-flex>

                    <v-flex xs2>
                      <v-hover v-if="history[0].next.civilWar != 1" >
                        <v-avatar  class="mt-2" slot-scope="{ hover }">
                          <v-btn fab dark color="primary_next_tab" v-if="hover || currentChoice == 0" v-on:click="toggle_country(241,0)">
                            <div class="title"> X </div>
                          </v-btn>
                        </v-avatar>
                      </v-hover>
                      <div class="title" v-else> Raise VS </div>
                    </v-flex>

                    <v-flex v-if="history[0].next.civilWar == 1" mr-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                          class="title pb-2 truncate">{{universalMap(history[0].next.d)}} </div>
                          </template>
                          <span>{{universalMap(history[0].next.d)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-on:click="toggle_country(241, 0)" v-if="hover">
                              <div class="title"> X </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_next_tab" v-else-if="currentChoice==0"
                              v-on:click="toggle_country(241,0)">
                              <div class="title"> X </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.d))"
                              :alt="universalMap(history[0].next.d)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                            <v-btn large icon dark color="primary_next_tab" v-if="currentChoice==0"
                              v-on:click="toggle_country(241,0)">
                              <div class="title"> X </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.d))"
                              :alt="universalMap(history[0].next.d)" v-on:click="toggle_country(241,0)"/>
                        </v-avatar>
                        <div class="title pt-2">{{history[0].next.probabilities[0] | probability}}</div>
                      </v-layout>
                    </v-flex>

                    <v-flex v-else mr-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                          class="title pb-2 truncate">{{universalMap(history[0].next.d)}} </div>
                          </template>
                          <span>{{universalMap(history[0].next.d)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-on:click="toggle_country(history[0].next.d, 2)" v-if="hover">
                              <div class="title"> 2 </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_next_tab" v-else-if="currentChoice==2"
                              v-on:click="toggle_country(history[0].next.d,2)">
                              <div class="title"> 2 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.d))"
                              :alt="universalMap(history[0].next.d)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                            <v-btn large icon dark color="primary_next_tab" v-if="currentChoice==2"
                              v-on:click="toggle_country(history[0].next.d,2)">
                              <div class="title"> 2 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(history[0].next.d))"
                              :alt="universalMap(history[0].next.d)" v-on:click="toggle_country(history[0].next.d,2)"/>
                        </v-avatar>
                        <div class="title pt-2">{{history[0].next.probabilities[2] | probability}}</div>
                      </v-layout>
                    </v-flex>

                  </v-layout>

                  <core-timer class="mt-4" />
                </v-img>
              </v-card>
              <v-spacer />
              <v-form ref="form" v-model="valid" lazy-validation>

                <v-layout row wrap align-center justify-center>
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
                </v-layout>

                <v-layout row wrap>
                  <v-flex xs12>
                    <v-slider thumb-label v-model="betAmount" :min="1 " :max="betNextGameParam.maximumBet "
                      label="Bet Amount"></v-slider>
                  </v-flex>
                </v-layout>
                <v-flex xs12 class="text-xs-center pa-2">
                  <div class="title pb-2"> Choose your guess </div>
                  <v-hover>
                    <v-btn fab dark color="primary_next_tab" v-on:click="toggle_country(history[0].next.o,1)">
                      <div class="title white--text"> 1 </div>
                    </v-btn>
                  </v-hover>
                  <v-btn fab dark color="primary_next_tab" v-on:click="toggle_country(241,0)">
                    <div class="title white--text"> x </div>
                  </v-btn>
                  <v-hover>
                    <v-btn v-if="history[0].next.civilWar != 1" fab dark color="primary_next_tab" v-on:click="toggle_country(history[0].next.d,2)">
                      <div class="title white--text"> 2 </div>
                    </v-btn>
                  </v-hover>
                </v-flex>
                <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" color="primary_next_tab" dark
                  @click="placeBet">
                  <div v-bind:style="{'max-width': windowSize.x * 0.6 + 'px'}" class="truncate">
                    Bet {{betAmount}} TRX {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}
                  </div>
                </v-btn>
                <v-btn v-else-if="info.serverStatus == 300" dark color="primary_next_tab" @click="battleInProgress">
                  Battle in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 400" dark color="primary_next_tab" @click="payoutInProgress">
                  Payout in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 500" dark color="primary_final_tab" @click="gameOver">Game Over
                </v-btn>
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
            <v-layout v-if="account == null">
              <v-flex class="subheading">
                <v-chip label outline color="red">Login First</v-chip>
              </v-flex>
            </v-layout>

            <!-- if the user has already placed at least one bet -->
            <v-layout v-else-if="myBets.length === 0">
              <v-flex class="subheading">
                <v-chip label outline color="red">No bets yet...</v-chip>
              </v-flex>
            </v-layout>

            <!-- else show the bets -->
            <v-layout v-else row wrap class="gameTabHeader">
              <v-flex xs3 class="title">
                Country
              </v-flex>
              <v-flex xs4 class="title">
                Bet
              </v-flex>
              <v-flex xs3 class="title">
                Turn
              </v-flex>
              <v-flex xs2 class="title">
                <span>Result</span>
              </v-flex>

              <v-divider class="gameTabDivider"></v-divider>

              <v-container class="gameTabContent">
                <v-layout row wrap
                  v-for="bet in myBets.slice(10 * currentMyBetPagination - 10, 10 * currentMyBetPagination)"
                  :key="bet.time">
                  <v-flex xs3 class="subheading">
                    {{universalMap(bet.userChoice)}}
                  </v-flex>
                  <v-flex xs4 class="subheading">
                    {{bet.amount | TRX}}
                  </v-flex>
                  <v-flex xs3 class="subheading">
                    {{bet.turn}}
                  </v-flex>
                  <v-flex xs2 class="subheading" v-bind:class="{greenText: bet.result > 0, redText: bet.result == 0}">
                    <span>{{bet.result | RESULT}}</span>
                  </v-flex>
                </v-layout>

                <v-container v-if="myBets.length > 10">
                  <v-pagination v-model="currentMyBetPagination" :length="Math.ceil(myBets.length/10)"
                    color="primary_next_tab"></v-pagination>
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

                <v-layout row wrap
                  v-for="bet in latestBets.slice(10 * currentLatestBetPagination - 10, 10 * currentLatestBetPagination)"
                  :key="bet.time">
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
                <v-pagination v-model="currentLatestBetPagination" :length="Math.ceil(latestBets.length/10)"
                  color="primary_next_tab">
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
              <v-flex xs3 class="title">
                <span>Country</span>
              </v-flex>
              <v-flex xs2 class="title">
                <span>Bet</span>
              </v-flex>
              <v-flex xs2 class="title">
                <span>Turn</span>
              </v-flex>
              <v-flex xs2 class="title">
                <span>Result</span>
              </v-flex>

              <v-divider class="gameTabDivider"></v-divider>

              <v-container class="gameTabContent" text-xs-center>
                <v-layout row wrap
                  v-for="bet in latestBets.slice(10 * currentLatestBetPagination - 10, 10 * currentLatestBetPagination)"
                  :key="bet.time">

                  <v-flex xs3 class="subheading text-truncate">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" v-text="(bet.from)" v-bind:alt="(bet.from)"></span>
                      </template>
                      <span>{{bet.from}}</span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex xs3 class="subheading">
                    <span>{{universalMap(bet.userChoice)}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.amount | TRX}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.turn}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading" v-bind:class="{greenText: bet.result > 0, redText: bet.result == 0}">
                    <span>{{bet.result | RESULT}}</span>
                  </v-flex>

                </v-layout>
              </v-container>

              <v-container v-if="latestBets.length > 10">
                <v-pagination v-model="currentLatestBetPagination" :length="Math.ceil(latestBets.length/10)"
                  color="primary_next_tab"></v-pagination>
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
  import axios from 'axios'
  import tronweb from 'tronweb'
  import VLazyImage from "v-lazy-image";

  export default {
    components: {
      VLazyImage,
    },
    data: () => ({
      currentMyBetPagination: 1,
      currentLatestBetPagination: 1,
      valid: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      betAmount: null,
      snackbarTimeout: 6000,
      placeholderFlag: "/img/flags/placeholder.svg",

      gameType: 2,
      info: {},
      bets: [],
      personalBets: [],
      mapStatus: [],
      history: [],
      isWaitingForConfirm: false,
      currentTxId: null,
      windowSize: {
        x: 0,
        y: 0
      }
    }),

    firebase: function() {
      return {
        bets: db.ref('public/bets').orderByChild('gameType').equalTo(this.gameType.toString()).limitToLast(30),
        personalBets: db.ref('public/bets').orderByChild('from').equalTo(this.account),
        info: db.ref('public/data'),
        mapStatus: db.ref('public/countriesMap'),
        history: db.ref('public/history').orderByChild('turn').limitToLast(1)
      }
    },

    filters: {
      RESULT: (result) => {
        if (result < 0) {
          return '-'
        } else {
          return tronweb.fromSun(result)
        }
      },
      TRX: (amount) => {
        return tronweb.fromSun(amount) + 'TRX'
      },
      probability: (p) => {
        let P = p * 100
        return (P <= 0.1 && P > 0) ? 'very low' : P.toFixed(2) + ' %'
      }
    },

    mounted() {
      this.initBetAmount()
      this.onResize()
    },

    methods: {
      onResize() {
        this.windowSize = {
          x: window.innerWidth,
          y: window.innerHeight
        }
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
          this.snackbarText = "The blockchain is processing your bet. Please wait...";
          this.snackbarColor = "info";
          this.snackbar = true;
          try {
            this.currentTxId = await this.$store.state.contracts.TronWarBotInstance.bet(this.gameType, this.currentChoice, this.info.turn).send({
              callValue: window.tronWeb.toSun(this.betAmount)
            })
          } catch (err) {
            this.isWaitingForConfirm = false;
            this.snackbarColor = "error";
            this.snackbar = true;
            this.snackbarText = "Failed to sign transaction: " + err
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
          try {
            this.snackbarText = "[REFERRAL] " + e.response.data.message
            this.snackbarColor = "error";
            this.snackbarTimeout = 10000;
            this.snackbar = true;
          } catch (err) {
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
      gameOver() {
        this.snackbarText = "Game over. Be ready for the next run";
        this.snackbarColor = "info";
        this.snackbarTimeout = 2000;
        this.snackbar = true;
      },
      initBetAmount: function () {
        setTimeout(() => {
          if (this.betNextGameParam) {
            this.betAmount = 1
          } else {
            this.initBetAmount()
          }
        }, 500)
      },
      toggle_country: function (country, choice) {
        this.currentCountry = country
        this.currentChoice = choice
      },
      compare: function(a,b){
        return b.turn - a.turn
      }
    },
    watch: {
      myBets: function () {
        let _this = this
        if (this.currentTxId !== null) {
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
      isMobile: function(){
        return this.$store.state.isMobile
      },
      myBets: function(){
        let pBets = this.personalBets.sort(this.compare)
        return pBets.filter((bet) => bet.gameType == this.gameType)
      },
      latestBets: function () {
        return this.bets.sort(this.compare)
      },
      winChance: function () {
        let country = this.currentCountry
        if (country == null) return 0;
        let p = this.history[0].next.probabilities[this.currentChoice]
        return p
      },
      multiplier: function () {
        let country = this.currentCountry
        if (country == null) return 0;
        let m = this.history[0].next.quotes[this.currentChoice]
        return m
      },
      potentialWin: function () {

        let multiplier = this.multiplier;
        let win = (this.betAmount * multiplier).toFixed(3);

        if (win == Infinity) return 0 + " TRX";
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
      currentChoice: {
        get() {
          return this.$store.state.battleChoice
        },
        set(value) {
          this.$store.commit('setBattleChoice', value)
        }
      },
      account() {
        return this.$store.state.loggedInAccount
      },
      betNextGameParam() {
        return this.$store.state.gameParams.betNextParams
      },
    }
  }
</script>

<style scoped>
  .info {
    width: 100%;
    height: 300px;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>