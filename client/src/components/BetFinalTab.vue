<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <!-- Place a bet -->
    <v-layout row wrap>
      <v-flex>
        <v-card>

          <v-toolbar color="primary_final_tab" dark>
            <v-toolbar-title>
              <v-layout align-center justify-space-between row>
                <v-flex> Bet on World Conqueror </v-flex>
                <v-flex>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon color="secondary_final_tab" dark v-on="on">info</v-icon>
                    </template>
                    <span>Bet on the final winner of the World War! Each bet goes into the jackpot. At the end of the
                      run (40 days on average) 80% of the jackpot is given to the winners, and 20% is given to WAR token
                      holders. As the time goes it will be more expensive to bet on countries, also depending on how
                      good they are doing. The first you bet, the better!</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-card-title primary-title class="justify-center">
            <v-flex md10>
              <v-form ref="form" v-model="valid" lazy-validation>

                <v-layout row align-center justify-center wrap>
                  <v-flex md12>
                    <v-autocomplete outline v-model="currentCountry" :items="mapping" item-text="name"
                      :loading="isLoading" item-value="numberId" hide-no-data hide-selected label="Select Country"
                      placeholder="Type in or pick from map"></v-autocomplete>
                  </v-flex>
                </v-layout>

                <v-layout align-center justify-center row wrap>
                  <v-flex md3>
                    <v-tooltip slot="append" top>
                      <v-text-field slot="activator" :value="calculatePotentialWin | TRX" label="Potential win" outline
                        readonly>
                      </v-text-field>
                      <span>This is how much you would win, if you would bet on the selected country and the run would
                        finish now </span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex md3>
                    <v-text-field :value="this.$store.state.jackpot | TRX" label="Current Jackpot" outline readonly>
                    </v-text-field>
                  </v-flex>

                  <v-flex md3>
                    <core-current-turn />
                  </v-flex>

                  <v-flex md3>
                    <core-balance-button />
                  </v-flex>
                </v-layout>

                <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" dark color="primary_final_tab"
                  @click="placeBet(currentCountry, mapStatus[currentCountry].finalQuote)">
                  <div v-bind:style="{'max-width': windowSize.x * 0.6 + 'px'}" class="text-truncate">
                    Bet
                    {{currentCountry != null && this.mapStatus.length != 0 ? this.mapStatus[this.currentCountry].finalQuote : ''}}
                    TRX
                    {{currentCountry != null ?' on ' + universalMap(currentCountry):''}}
                  </div>
                </v-btn>
                <v-btn v-else-if="info.serverStatus == 300" dark color="primary_final_tab" @click="battleInProgress">
                  Battle in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 400" dark color="primary_final_tab" @click="payoutInProgress">
                  Payout in progress...</v-btn>
                <v-btn v-else-if="info.serverStatus == 500" dark color="primary_final_tab" @click="gameOver">Game Over
                </v-btn>
                <!-- <v-flex md4>
                <v-btn color="warning">Cannot bet at the moment</v-btn>
              </v-flex> -->

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
      <v-flex md7 column wrap>
        <v-flex>
        <v-card>
          <v-toolbar color="primary_final_tab" dark>
            <v-toolbar-title>My Bets</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-data-table :headers="personalBetsHeaders" :items="myBets" :pagination.sync="paginationBets" class="elevation-1">
            <template v-slot:items="props">
              <td class="text-xs-left">{{ universalMap(props.item.userChoice) }}</td>
              <td class="text-xs-left">{{ props.item.amount | TRXnotBIG }}</td>
              <td class="text-xs-left">{{ props.item.turn }}</td>
            </template>

            <template v-slot:no-data>
              <v-alert v-if="account == null" :value="true" color="error">
                Login First
              </v-alert>
              <v-alert v-else :value="true" color="error" icon="warning">
                No data availbale
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
        </v-flex>

        <!-- Latest bets -->
        <v-flex>
          <v-card>
            <v-toolbar color="primary_final_tab" dark>
              <v-toolbar-title>Latest Bets</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <v-data-table :headers="latestBetsHeaders" :items="latestBets" :pagination.sync="paginationBets" class="elevation-1">
              <template v-slot:items="props" >
                <td class="text-xs-left hidden-xs-only">{{ props.item.from }}</td>
                <td class="text-xs-left">{{ universalMap(props.item.userChoice) }}</td>
                <td class="text-xs-left">{{ props.item.amount | TRXnotBIG }}</td>
                <td class="text-xs-left">{{ props.item.turn }}</td>
              </template>

              <template v-slot:no-data>
                <v-alert v-if="account == null" :value="true" color="error">
                  Login First
                </v-alert>
                <v-alert v-else :value="true" color="error" icon="warning">
                  No data availbale
                </v-alert>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-flex>

      <!-- Number of bets per country -->
      <v-flex xs12 md5>
        <v-card>
          <v-toolbar color="primary_final_tab" dark>
            <v-toolbar-title>Number of bets per country</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="betsPerCountryHeader" :items="betsPerCountry" class="elevation-1"
            :item-key="'bets'" :pagination.sync="paginationNumberOfBets" :rows-per-page-items="[10,20,50]" >
            <template v-slot:items="props">
              <td class="text-xs-left">
                <v-avatar size="40">
                  <v-img :lazy-src="placeholderFlag" 
                    :src="getFlagString(universalMap(props.item.countryId))" :alt="universalMap(props.item.countryId)" />
                </v-avatar>
              </td>
              <td class="text-xs-left">{{ universalMap(props.item.countryId) }}</td>
              <td class="text-xs-left">{{ props.item.numberOfBets }}</td>
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
  import tronweb from 'tronweb'

  String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) {
      return this.toString();
    }
    return this.split(search).join(replace);
  };

  export default {
    mixins: [betMixin],
    data: () => ({
      isLoading: false,
      isWaitingForConfirm: false,
      valid: false,
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      currentTxId: null,
      gameType: 0,
      bets: [],
      personalBets: [],
      info: {},
      mapStatus: [],
      mapping: mapping,
      paginationNumberOfBets: {
        sortBy: 'bets',
        descending: true,
      },
      paginationBets: {
        sortBy: 'turn',
        descending: true,
      },
      betsPerCountryHeader: [{
          text: 'Country',
          id: 1,
          value: 'flag',
          sortable: false,
          align: 'left',
          class: 'body-1 pa-0 pl-3'
        },
        {
          text: '',
          id: 2,
          value: 'country',
          sortable: false,
          align: 'left',
          class: 'body-1 pa-0 '
        },
        {
          text: '# Bets',
          id: 3,
          value: 'bets',
          sortable: true,
          align: 'left',
          class: 'body-1 pa-0 pl-3'
        },
      ],
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
      ]
    }),
    mounted() {
      if (this.currentCountry == 241) {
        this.currentCountry = null
      }
    },
    methods: {
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
      },
    },
    computed: {

      //returns an array of objects [{countryId: "id", numberOfBets: x}, ...]
      betsPerCountry: function () {
        // it will contain all the countries for which there is at least one bet
        let countries = []
        let finalBets = this.bets.filter(bet => bet.gameType == this.gameType)
        finalBets.forEach(bet => {
          countries.push(bet.userChoice)
        })
        var betsPerCountryList = [];
        for (const x of Array(241).keys()) {
          betsPerCountryList.push({
            countryId: x,
            numberOfBets: 0
          })
        }

        for (var element of countries) {
          betsPerCountryList[element].numberOfBets += 1;
        }

        betsPerCountryList.sort((a, b) => {
          return b.numberOfBets - a.numberOfBets
        })

        return betsPerCountryList
      },

      calculatePotentialWin: function () {
        if (this.currentCountry == null || this.mapStatus.length == 0) return 0;
        let bets = this.betsPerCountry
        let betsOnThatCountry = bets.find(el => (el.countryId === this.currentCountry))
        // (jackpot + finalQuote) * (1-houseEdge) * 1/max((#bet + 1), 1)
        let finalQuoteSun = tronweb.toSun((this.mapStatus[this.currentCountry].finalQuote))
        let dividend = 1 / Math.max(betsOnThatCountry.numberOfBets + 1, 1)
        let midResult = (1 - this
          .$store.state.gameParams.finalBetParams.houseEdge) * dividend
        midResult = tronweb.BigNumber(midResult)
        let result = (((this.$store.state.jackpot).plus(finalQuoteSun)).times(midResult))
        console.log(result.toString())
        return result
      },
    },
  }
</script>