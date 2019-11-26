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
                <span>If you feel like who the next Conqueror is going to be, you came to the right place. Every 5 mins
                  the Bot spits out one new Battle. Bet on who will make the conquer next in this tab.</span>
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
                      item-value="numberId" hide-no-data hide-selected label="Select Country"
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
                    <v-slider thumb-label v-model="betAmount" :min="betNextGameParam ? betNextGameParam.minimumBet : 1"
                      :max="betNextGameParam ? betNextGameParam.maximumBet : 1" label="Bet Amount"></v-slider>
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


                <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" color="primary_next_tab" dark
                  @click="placeBet(currentCountry, betAmount)">
                  <div v-bind:style="{'max-width': windowSize.x * 0.6 + 'px'}" class="text-truncate">
                    Bet {{betAmount}} TRX
                    {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}
                  </div>
                </v-btn>
                <v-btn v-else-if="info.serverStatus == 300" dark color="primary_next_tab" @click="battleInProgress">
                  Battle in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 400" dark color="primary_next_tab" @click="payoutInProgress">
                  Payout in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 500" dark color="primary_next_tab" @click="gameOver">Game Over
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
          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>My Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-data-table :headers="personalBetsHeaders" :items="myBets" :pagination.sync="paginationBets" class="elevation-1">
            <template v-slot:items="props">
              <td class="text-xs-left">{{ universalMap(props.item.userChoice) }}</td>
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
          <v-toolbar color="primary_next_tab" dark>
            <v-toolbar-title>Latest Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-data-table :headers="latestBetsHeaders" :items="latestBets" :pagination.sync="paginationBets" class="elevation-1">
            <template v-slot:items="props">
              <td class="text-xs-left hidden-xs-only">{{ props.item.from }}</td>
              <td class="text-xs-left">{{ universalMap(props.item.userChoice) }}</td>
              <td class="text-xs-left">{{ props.item.amount | TRXnotBIG }}</td>
              <td class="text-xs-left">{{ props.item.turn }}</td>
              <td class="text-xs-left"
                v-bind:class="{greenText: props.item.result > 0, redText: props.item.result == 0}">
                <span>{{props.item.result | RESULT}}</span>
              </td>
            </template>

            <template v-slot:no-data>
              <v-chip v-if="account == null" label outline  color="red">Login First</v-chip>
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
  import mapping from '../assets/mapping';
  import {
    betMixin
  } from '../mixins/betMixin'

  export default {
    mixins: [betMixin],
    data: () => ({
      currentMyBetPagination: 1,
      currentLatestBetPagination: 1,
      showBetNextTab: false,
      valid: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      betAmount: null,
      snackbarTimeout: 6000,

      gameType: 1,
      info: {},
      bets: [],
      personalBets: [],
      mapStatus: [],
      mapping: mapping,
      isWaitingForConfirm: false,
      currentTxId: null,
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
          text: 'Country',
          id: 1,
          value: 'country',
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
          class: 'body-1 pa-0'
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
          text: 'Country',
          id: 1,
          value: 'country',
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
          class: 'body-1 pa-0'
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
    }),
    mounted() {
      this.initBetAmount()
      if (this.currentCountry == 241) {
        this.currentCountry = null
      }
    },
    methods: {
      initBetAmount: function () {
        setTimeout(() => {
          if (this.betNextGameParam) {
            this.betAmount = this.betNextGameParam.minimumBet
          } else {
            this.initBetAmount()
          }
        }, 500)
      },
    },

    computed: {

      winChance: function () {
        let country = this.currentCountry
        if (country == null || this.mapStatus.length == 0) return 0;
        let p = this.mapStatus[country].probability
        return p
      },
      multiplier: function () {
        let country = this.currentCountry
        if (country == null || this.mapStatus.length == 0) return 0;

        return this.mapStatus[country.toString()].nextQuote
      },
      potentialWin: function () {

        let multiplier = this.multiplier;
        let win = (this.betAmount * multiplier).toFixed(3);

        if (win == Infinity) return 0 + " TRX";
        else return win + " TRX";
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
</style>