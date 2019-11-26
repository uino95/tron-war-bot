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
                <v-img v-if="info.serverStatus != 500 && !currentBattle.placeHolder" class="white--text"
                  :position="currentBattle.civilWar == 1 ? 'bottom 75% center' : 'center'"
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
                <v-img v-else :position="'bottom 55% center'" :aspect-ratio="this.windowSize.x/300"
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
                    <v-slider thumb-label v-model="betAmount"
                      :min="betBattleGameParams ? betBattleGameParams.minimumBet : 1"
                      :max="betBattleGameParams ? betBattleGameParams.maximumBet : 1" label="Bet Amount"></v-slider>
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
      <v-flex md5>
        <v-card>
          <v-toolbar color="primary_battle_tab" dark>
            <v-toolbar-title>My Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-data-table :headers="personalBetsHeaders" :pagination.sync="paginationBets" :items="myBets" class="elevation-1">
            <template v-slot:items="props" >
              <td class="text-xs-left">{{ props.item.userChoice | CHOICE}}</td>
              <td class="text-xs-left">{{ props.item.amount | TRXnotBIG }}</td>
              <td class="text-xs-left">{{ props.item.turn }}</td>
              <td class="text-xs-left"
                v-bind:class="{greenText: props.item.result > 0, redText: props.item.result == 0}">
                <span>{{props.item.result | RESULT}}</span>
              </td>
            </template>

            <template v-slot:no-data>
              <v-chip v-if="account == null" label outline color="red">Login First</v-chip>
              <v-chip v-else label outline color="red"> No Bets Yet </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>

      <!-- Latest bets -->
      <v-flex md7>
        <v-card>
          <v-toolbar color="primary_battle_tab" dark>
            <v-toolbar-title>Latest Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-data-table :headers="latestBetsHeaders" :pagination.sync="paginationBets" :items="latestBets" class="elevation-1">
            <template v-slot:items="props" >
              <td class="text-xs-left hidden-xs-only">{{ props.item.from }}</td>
              <td class="text-xs-left">{{ props.item.userChoice | CHOICE }}</td>
              <td class="text-xs-left">{{ props.item.amount | TRXnotBIG }}</td>
              <td class="text-xs-left">{{ props.item.turn }}</td>
              <td class="text-xs-left"
                v-bind:class="{greenText: props.item.result > 0, redText: props.item.result == 0}">
                <span>{{props.item.result | RESULT}}</span>
              </td>
            </template>

            <template v-slot:no-data>
              <v-chip v-if="account == null" label outline color="red">Login First</v-chip>
              <v-chip v-else label outline color="red"> No Bets Yet </v-chip>
            </template>
          </v-data-table>
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
  import {
    betMixin
  } from '../mixins/betMixin'

  export default {

    mixins: [betMixin],

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
        historyTurn: [],
        paginationBets: {
          sortBy: 'turn',
          descending: true,
        },
        latestBetsHeaders: [{
            text: 'Address',
            value: 'address',
            id: 0,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0 pl-3 hidden-xs-only'
          },
          {
            text: 'Choice',
            id: 1,
            value: 'choice',
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0 pl-3'
          },
          {
            text: 'Amount',
            value: 'bet',
            id: 2,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0 pl-3'
          },
          {
            text: 'Turn',
            value: 'turn',
            id: 3,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0'
          },
          {
            text: 'Result',
            value: 'result',
            id: 4,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0'
          },
        ],
        personalBetsHeaders: [{
            text: 'Choice',
            id: 1,
            value: 'choice',
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0 pl-3'
          },
          {
            text: 'Amount',
            value: 'bet',
            id: 2,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0 pl-3'
          },
          {
            text: 'Turn',
            value: 'turn',
            id: 3,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0'
          },
          {
            text: 'Result',
            value: 'result',
            id: 4,
            sortable: false,
            align: 'left',
            class: 'body-1 pa-0'
          },
        ]
      }
    },
    filters: {
      CHOICE: (userChoice) => {
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
      if (this.currentCountry != 241 && this.currentCountry != this.currentBattle.o && this.currentCountry != this
        .currentBattle.d) {
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
          "probabilities": [0, 0, 0],
          "quotes": [0, 0, 0]
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