<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>
      <!-- Place a bet -->
      <v-flex>
        <v-card>

          <v-toolbar color="primary_battle_tab" dark>
            <v-toolbar-title>Bet on the outcome of the current battle
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon color="secondary-battle-tab" dark v-on="on">info</v-icon>
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
                <v-img v-if="info.serverStatus != 500 && !currentBattle.placeHolder" class="white--text" :position="currentBattle.civilWar == 1 ? 'bottom 75% center' : 'center'"
                  :aspect-ratio="this.windowSize.x/150"
                  :src=" currentBattle.civilWar == 1 ? 'img/civilWar9.png' : 'img/vs-battle.jpg'">
                  <v-layout class="mt-4" row wrap align-center justify-space-between>
                    <v-flex ml-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip open-delay="600" bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                              class="title pb-2 text-truncate">{{universalMap(currentBattle.o)}} </div>
                          </template>
                          <span>{{universalMap(currentBattle.o)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-if="hover" v-on:click="toggle_country(currentBattle.o,1)">
                              <div class="title"> 1 </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_battle_tab" v-else-if="currentChoice==1"
                              v-on:click="toggle_country(currentBattle.o,1)">
                              <div class="title"> 1 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(currentBattle.o))"
                              :alt="universalMap(currentBattle.o)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                          <v-btn large icon dark color="primary_battle_tab" v-if="currentChoice==1"
                            v-on:click="toggle_country(currentBattle.o,1)">
                            <div class="title"> 1 </div>
                          </v-btn>
                          <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                            :src="getFlagString(universalMap(currentBattle.o))" :alt="universalMap(currentBattle.o)"
                            v-on:click="toggle_country(currentBattle.o,1)" />
                        </v-avatar>
                        <div class="title pt-2">{{currentBattle.probabilities[1] | probability}}</div>
                      </v-layout>
                    </v-flex>

                    <v-flex xs2>
                      <v-hover v-if="currentBattle.civilWar != 1">
                        <v-avatar class="mt-2" slot-scope="{ hover }">
                          <v-btn fab dark color="primary_battle_tab" v-if="hover || currentChoice == 0"
                            v-on:click="toggle_country(241,0)">
                            <div class="title"> X </div>
                          </v-btn>
                        </v-avatar>
                      </v-hover>
                      <div class="title" v-else> Raise VS </div>
                    </v-flex>

                    <v-flex v-if="currentBattle.civilWar == 1" mr-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip open-delay="600" bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                              class="title pb-2 truncate">{{universalMap(currentBattle.d)}} </div>
                          </template>
                          <span>{{universalMap(currentBattle.d)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-on:click="toggle_country(241, 0)" v-if="hover">
                              <div class="title"> X </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_battle_tab" v-else-if="currentChoice==0"
                              v-on:click="toggle_country(241,0)">
                              <div class="title"> X </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(currentBattle.d))"
                              :alt="universalMap(currentBattle.d)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                          <v-btn large icon dark color="primary_battle_tab" v-if="currentChoice==0"
                            v-on:click="toggle_country(241,0)">
                            <div class="title"> X </div>
                          </v-btn>
                          <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                            :src="getFlagString(universalMap(currentBattle.d))" :alt="universalMap(currentBattle.d)"
                            v-on:click="toggle_country(241,0)" />
                        </v-avatar>
                        <div class="title pt-2">{{currentBattle.probabilities[0] | probability}}</div>
                      </v-layout>
                    </v-flex>

                    <v-flex v-else mr-1 xs4>
                      <v-layout column align-center>
                        <v-tooltip open-delay="600" bottom>
                          <template v-slot:activator="{ on }">
                            <div v-on="on" v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
                              class="title pb-2 truncate">{{universalMap(currentBattle.d)}} </div>
                          </template>
                          <span>{{universalMap(currentBattle.d)}}</span>
                        </v-tooltip>
                        <v-hover v-if="!isMobile">
                          <v-avatar slot-scope="{ hover }">
                            <v-btn large icon dark v-on:click="toggle_country(currentBattle.d, 2)" v-if="hover">
                              <div class="title"> 2 </div>
                            </v-btn>
                            <v-btn large icon dark color="primary_battle_tab" v-else-if="currentChoice==2"
                              v-on:click="toggle_country(currentBattle.d,2)">
                              <div class="title"> 2 </div>
                            </v-btn>
                            <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                              :src="getFlagString(universalMap(currentBattle.d))"
                              :alt="universalMap(currentBattle.d)" />
                          </v-avatar>
                        </v-hover>
                        <v-avatar v-else>
                          <v-btn large icon dark color="primary_battle_tab" v-if="currentChoice==2"
                            v-on:click="toggle_country(currentBattle.d,2)">
                            <div class="title"> 2 </div>
                          </v-btn>
                          <v-img v-else :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                            :src="getFlagString(universalMap(currentBattle.d))" :alt="universalMap(currentBattle.d)"
                            v-on:click="toggle_country(currentBattle.d,2)" />
                        </v-avatar>
                        <div class="title pt-2">{{currentBattle.probabilities[2] | probability}}</div>
                      </v-layout>
                    </v-flex>

                  </v-layout>

                  <core-timer class="mt-4" />
                </v-img>
                <v-img v-else :position="'bottom 55% center'"
                  :aspect-ratio="this.windowSize.x/300"
                  :src=" 'img/placeholder.jpg'">
                </v-img>
              </v-card>
              <v-spacer />
              <v-form v-if="!currentBattle.placeHolder" ref="form" v-model="valid" lazy-validation>

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
                    <v-slider thumb-label v-model="betAmount" :min="betBattleGameParams ? betBattleGameParams.minimumBet : 1" :max="betBattleGameParams ? betBattleGameParams.maximumBet : 1"
                      label="Bet Amount"></v-slider>
                  </v-flex>
                </v-layout>
                <v-flex xs12 class="text-xs-center pa-2">
                  <div class="title pb-2"> Choose your guess </div>
                  <v-hover>
                    <v-btn fab dark color="primary_battle_tab" v-on:click="toggle_country(currentBattle.o,1)">
                      <div class="title white--text"> 1 </div>
                    </v-btn>
                  </v-hover>
                  <v-btn fab dark color="primary_battle_tab" v-on:click="toggle_country(241,0)">
                    <div class="title white--text"> x </div>
                  </v-btn>
                  <v-hover>
                    <v-btn v-if="currentBattle.civilWar != 1" fab dark color="primary_battle_tab"
                      v-on:click="toggle_country(currentBattle.d,2)">
                      <div class="title white--text"> 2 </div>
                    </v-btn>
                  </v-hover>
                </v-flex>
                <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" color="primary_battle_tab" dark
                  @click="placeBet(currentChoice, betAmount)">
                  <div v-bind:style="{'max-width': windowSize.x * 0.6 + 'px'}" class="text-truncate">
                    Bet {{betAmount}} TRX
                    {{currentCountry != null ?'on ' + (currentChoice != 0 ? universalMap(currentCountry) : 'DRAW')  :''}}
                  </div>
                </v-btn>
                <v-btn v-else-if="info.serverStatus == 300" dark color="primary_battle_tab" @click="battleInProgress">
                  Battle in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 400" dark color="primary_battle_tab" @click="payoutInProgress">
                  Payout in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 500" dark color="primary_battle_tab" @click="gameOver">Game Over
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
          <v-toolbar color="primary_battle_tab" dark>
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
              <v-flex xs2 class="title">
                Choice
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
                  <v-flex xs2 class="subheading">
                    {{bet.userChoice | CHOICE}}
                  </v-flex>
                  <v-flex xs4 class="subheading">
                    {{bet.amount | TRXnotBIG }}
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
                    color="primary_battle_tab"></v-pagination>
                </v-container>
              </v-container>

            </v-layout>

          </v-container>
        </v-card>
      </v-flex>

      <!-- Latest bets -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary_battle_tab" dark>
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
              <v-flex xs3 class="title">
                <span>Choice</span>
              </v-flex>
              <v-flex xs6 class="title">
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
                  <v-flex xs3 class="subheading">
                    <span>{{bet.userChoice | CHOICE}}</span>
                  </v-flex>
                  <v-flex xs6 class="subheading">
                    <span>{{bet.amount | TRXnotBIG }}</span>
                  </v-flex>
                  <v-flex xs3 class="subheading">
                    <span>{{bet.turn}}</span>
                  </v-flex>
                </v-layout>

              </v-container>
              <v-container v-if="latestBets.length > 10">
                <v-pagination v-model="currentLatestBetPagination" :length="Math.ceil(latestBets.length/10)"
                  color="primary_battle_tab">
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
              <v-flex xs4 class="title">
                <span>Address</span>
              </v-flex>
              <v-flex xs2 class="title">
                <span>Choice</span>
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

                  <v-flex xs4 class="subheading text-truncate">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on" v-text="(bet.from)" v-bind:alt="(bet.from)"></span>
                      </template>
                      <span>{{bet.from}}</span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.userChoice | CHOICE}}</span>
                  </v-flex>

                  <v-flex xs2 class="subheading">
                    <span>{{bet.amount | TRXnotBIG }}</span>
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
                  color="primary_battle_tab"></v-pagination>
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
  import {betMixin} from '../mixins/betMixin'

  export default {

    mixins:[betMixin],
    
    data() {
      return {
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
        historyTurn:[]
      }
    },
    filters:{
      CHOICE : (userChoice)=> {
        return userChoice == 0 ? 'X' : userChoice.toString()
      }
    },
    firebase: function () {
      return {
        history: db.ref('public/history').orderByChild('turn').limitToLast(1)
      }
    },

    mounted() {
      this.initBetAmount()
      if(this.currentCountry != 241 && this.currentCountry != this.currentBattle.o && this.currentCountry != this.currentBattle.d){
        this.currentChoice = null
        this.currentCountry = null
      }
    },

    methods: {
      initBetAmount: function () {
        setTimeout(() => {
          if (this.betBattleGameParams) {
            this.betAmount = this.betBattleGameParams.minimumBet
          } else {
            this.initBetAmount()
          }
        }, 500)
      },
      toggle_country: function (country, choice) {
        this.currentCountry = country
        this.currentChoice = choice
      },
    },

    computed: {
      currentBattle: function () {
        if (this.history[0]) return this.history[0].next;
        return {
          "placeHolder": true,
          "civilWar": 0,
          "cohesion": {
            "d": 0.5,
            "dt": 0.5,
            "o": 0.5,
            "ot": 0.5
          },
          "d": 0,
          "dt": 0,
          "o": 0,
          "ot": 0,
          "probabilities": [0,0,0],
          "quotes": [0,0,0]
        }
      },
      
      winChance: function () {
        if (this.currentChoice == null) return 0;
        return this.currentBattle.probabilities[this.currentChoice]
      },
      multiplier: function () {
        if (this.currentChoice == null) return 0;
        return this.currentBattle.quotes[this.currentChoice]
      },
      potentialWin: function () {

        let win = (this.betAmount * this.multiplier).toFixed(3);
        if (win == Infinity) return 0 + " TRX";
        else return win + " TRX";
      },
      currentChoice: {
        get() {
          return this.$store.state.battleChoice
        },
        set(value) {
          this.$store.commit('setBattleChoice', value)
        }
      },
      betBattleGameParams() {
        return this.$store.state.gameParams.betBattleParams
      },
    }
  }
</script>

<style scoped>
  .info {
    width: 100%;
    height: 300px;
  }
</style>