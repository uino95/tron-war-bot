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
                    <span>Bet on the final winner of the World War! Each bet goes into the jackpot. At the end of the run (40 days on average) 80% of the jackpot is given to the winners, and 20% is given to WAR token holders. As the time goes it will be more expensive to bet on countries, also depending on how good they are doing. The first you bet, the better!</span>
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
                      <v-text-field slot="activator" :value="calculatePotentialWin" label="Potential win" outline readonly>
                      </v-text-field>
                      <span>This is how much you would win, if you would bet on the selected country and the run would finish now </span>
                    </v-tooltip>
                  </v-flex>

                  <v-flex md3>
                    <v-text-field :value="this.$store.state.jackpot?(parseFloat(this.$store.state.jackpot).toFixed(3) + ' TRX'):'loading...'"
                      label="Current Jackpot" outline readonly></v-text-field>
                  </v-flex>

                  <v-flex md3>
                    <core-current-turn />
                  </v-flex>

                  <v-flex md3>
                    <core-balance-button />
                  </v-flex>
                </v-layout>

              <v-btn v-if="info.serverStatus == 200" :loading="isWaitingForConfirm" dark color="primary_final_tab" @click="placeBet(currentCountry)">Bet {{currentCountry != null && this.countriesMap.length != 0 ? this.countriesMap[this.currentCountry].finalQuote : ''}} {{currentCountry != null ? currency : ''}} {{currentCountry != null ?'on ' + universalMap(currentCountry):''}}</v-btn>
              <v-btn v-else-if="info.serverStatus == 300" dark color="primary_final_tab" @click="battleInProgress">Battle in progress...</v-btn>
              <v-btn v-else-if="info.serverStatus == 400" dark color="primary_final_tab" @click="payoutInProgress">Payout in progress...</v-btn>
              <v-btn v-else-if="info.serverStatus == 500" dark color="primary_final_tab" @click="gameOver">Game Over</v-btn>
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
      <v-flex md6 column wrap>
        <!-- My latest bets -->
        <v-flex>
          <v-card>
            <v-toolbar color="primary_final_tab" dark>
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
                      color="primary_final_tab"
                    ></v-pagination>
                  </v-container>
                </v-container>

              </v-layout>

            </v-container>
          </v-card>
        </v-flex>

        <!-- Latest bets -->
        <v-flex>
          <v-card>
            <v-toolbar color="primary_final_tab" dark>
              <v-toolbar-title>Latest Bets</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <!-- if the user is using a mobile device -->
            <v-container v-if="this.$store.state.isMobile" grid-list-md text-xs-center class="gameTab">

              <!-- if the user has already placed at least one bet -->
              <v-layout v-if="latestBets.length === 0" >
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
                    color="primary_final_tab"
                  >
                  </v-pagination>
                </v-container>

              </v-layout>
            </v-container>

            <!-- else, the user is on pc -->
            <v-container v-else grid-list-md text-xs-center class="gameTab">

              <!-- if the user has already placed at least one bet -->
              <v-layout v-if="latestBets.length === 0" >
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
              </v-layout>

              <v-container v-if="latestBets.length > 10">
                <v-pagination
                  v-model="currentLatestBetPagination"
                  :length="Math.ceil(latestBets.length/10)"
                  color="primary_final_tab"
                ></v-pagination>
              </v-container>
            </v-container>

          </v-card>
        </v-flex>
      </v-flex>

      <!-- Number of bets per country -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary_final_tab" dark>
            <v-toolbar-title>Number of bets per country</v-toolbar-title>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="gameTab">
            <v-layout align-center justify-space-between row wrap class="gameTabHeader">
              <v-flex style="text-align: start;" class="title">Country</v-flex>
              <v-flex style="text-align: end;" class="title">Bets Placed</v-flex>
            </v-layout>

            <v-divider class="gameTabDivider"></v-divider>

            <v-container>
              <v-layout column>
                <v-layout row wrap
                  v-for="country in betsPerCountry.slice(10 * currentRunPagination - 10, 10 * currentRunPagination )"
                  :key="country.countryId">

                  <v-flex xs2>
                    <v-avatar>
                      <v-lazy-image :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                        :src="getFlagString(universalMap(country.countryId))" :alt="country.countryId" />
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
                  color="primary_final_tab"
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
  import {betMixin} from '../mixins/betMixin'

  String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) {
      return this.toString();
    }
    return this.split(search).join(replace);
  };

  export default {
    mixins:[betMixin],
    data: () => ({
      currentRunPagination:1,
      currentLatestBetPagination: 1,
      currentMyBetPagination: 1,
      isLoading: false,
      isWaitingForConfirm: false,
      valid: false,
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      potentialWin: 0,
      currencies: ["TRX", "WAR"],
      currency: "TRX",
      unsortedBetsPerCountry: [],
      currentTxId: null,

      gameType: 0,
      bets: [],
      personalBets:[],
      info:{},
      countriesMap:[],
      mapping: mapping,
    }),
    firebase: function() {
      return {
        bets: db.ref('public/bets').orderByChild('gameType').equalTo(this.gameType.toString()).limitToLast(30),
        personalBets: db.ref('public/bets').orderByChild('from').equalTo(this.account),
        info: db.ref('public/data'),
        countriesMap: db.ref('public/countriesMap')
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
        finalBets.forEach(bet =>{
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
        if (this.currentCountry == null || this.countriesMap.length == 0) return 0;
        let bets = this.betsPerCountry
        let betsOnThatCountry = bets.find(el => (el.countryId === this.currentCountry))
        return ((parseFloat(this.$store.state.jackpot) + this.countriesMap[this.currentCountry].finalQuote) * (1 - this.$store.state.gameParams.finalBetParams.houseEdge) * 1 /
          Math.max(betsOnThatCountry.numberOfBets + 1, 1)).toFixed(3) + ' TRX';
      },
    },
  }
</script>