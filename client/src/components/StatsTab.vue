<template>
<v-container grid-list-md text-xs-center class="outerTabContainer">
  <v-layout row wrap>

    <!-- Countries -->
    <v-flex sm12 md4 shrink>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Current Run Stats</v-toolbar-title>
        </v-toolbar>

        <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">

          <v-layout align-center justify-space-between row wrap class="gameTabHeader">
            <v-flex style="text-align: start;" class="title">Country</v-flex>
            <v-flex style="text-align: end;" class="title">Territories</v-flex>
          </v-layout>

          <v-divider class="gameTabDivider"></v-divider>

          <v-container>
            <v-layout column>
            <v-layout row wrap v-for="(country) in sortedArray.slice(10 * currentRunPagination - 10, 10 * currentRunPagination )" :key="country.id">
              <v-flex xs2>
                <v-avatar size="90%">
                  <v-lazy-image :src-placeholder="placeholderFlag" @error="src = placeholderFlag" :src="getFlagString(universalMap(country.id))" :alt="universalMap(country.id)" />
                </v-avatar>
              </v-flex>
              <v-flex xs6 style="text-align:start; margin-top:5px;" class="subheading">
                {{universalMap(country.id)}}
              </v-flex>
              <v-flex xs4 class="title" style="text-align: end">
                {{country.occupied}}
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

    <!-- History -->
    <v-flex sm12 md8 grow>
      <v-card>

        <v-toolbar color="primary" dark>
          <v-toolbar-title>History</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">

          <v-layout align-center justify-space-between row wrap class="gameTabHeader">
            <v-flex style="text-align: start;" xs3 class="title">
              Turn
            </v-flex>
            <v-flex xs6 class="title" style="text-align: center;">
              Conquest
            </v-flex>
            <v-flex xs3 class="title" style="text-align: end;">
              Prev. owner
            </v-flex>
          </v-layout>

          <v-divider class="gameTabDivider"></v-divider>

          <v-container class="gameTabContent">

            <v-layout v-if="history.length <= 1">
              <v-flex class="subheading">
                <v-chip label outline color="red">Run has not started yet...</v-chip>
              </v-flex>
            </v-layout>

            <v-layout v-else align-center justify-space-between row wrap v-for="conquest in history.slice().reverse().slice(10 * currentHistoryPagination - 10, 10 * currentHistoryPagination)" :key="conquest.turn">
              <v-flex xs2 style="text-align: start" class="subheading">
                {{conquest.turn}}
              </v-flex>

              <v-flex xs3 text-truncated class="subheading greenText text-truncate">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on" v-text="universalMap(conquest.conquest[0])" v-bind:alt="snackbar"></span>
                  </template>
                  <span>{{universalMap(conquest.conquest[0])}}</span>
                </v-tooltip>
              </v-flex>

              <v-flex xs1>
                <v-icon>arrow_forward</v-icon>
              </v-flex>

              <v-flex xs3 class="subheading redText text-truncate">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on" v-text="universalMap(conquest.conquest[1])" v-bind:alt="snackbar"></span>
                  </template>
                  <span>{{universalMap(conquest.conquest[1])}}</span>
                </v-tooltip>
              </v-flex>

              <v-flex xs3 class="subheading text-truncate">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on" v-text="universalMap(conquest.prev)" v-bind:alt="snackbar"></span>
                  </template>
                  <span>{{universalMap(conquest.prev)}}</span>
                </v-tooltip>
              </v-flex>
            </v-layout>

          </v-container>
          <v-pagination
            v-model="currentHistoryPagination"
            :length="Math.ceil(history.length/10)">
          </v-pagination>

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
import VLazyImage from "v-lazy-image";

String.prototype.replaceAll = function(search, replace) {
  if (replace === undefined) {
    return this.toString();
  }
  return this.split(search).join(replace);
};

export default {
  components: {
    VLazyImage,
  },
  data: () => ({
    currentRunPagination:1,
    currentHistoryPagination:1,
    isLoading: false,
    valid: false,
    placeholderFlag: "/img/flags/placeholder.svg",
    snackbar: false,
    turnTimer: "00:01",
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
    balance: null,
    account: null,
    history: [],
    bets: [],
    mapStatus: [],
    mapping: mapping,
    intervalId: null
  }),
  firebase: {
    history: db.ref('history').orderByChild('turn'),
    info: db.ref('data'),
    mapStatus: db.ref('countriesMap')
  },
  methods: {
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
  },
  computed: {
    countryStatus: function(){
      this.mapStatus.map((el,index) => el.id = index )
      return this.mapStatus
    },
    sortedArray: function() {
      function compare(a, b) {
        if (a.occupied > b.occupied)
          return -1;
        if (a.occupied < b.occupied)
          return 1;
        return 0;
      }
      let arr = this.countryStatus;
      return arr.sort(compare);
    }
  }
}
</script>
