<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <!-- History -->
    <v-flex sm12 md12 lg12 >
      <v-card>
        <v-toolbar color="primary_history_tab" dark>
          <v-toolbar-title>Recent History</v-toolbar-title>
          <v-spacer />
          <v-text-field class="pa-2" v-model="searchHistory" append-icon="search" label="Search for a turn" single-line
            hide-details></v-text-field>
        </v-toolbar>
        
          <v-data-table :search="searchHistory" :headers="headersHistory" :items="history" :item-key="'turn'"
            class="elevation-1" :pagination.sync="paginationHistory">
            <template v-slot:items="props">
              <td class="text-xs-center">{{ props.item.turn }}</td>
              <td class="text-xs-center">
                    <v-layout align-center justify-space-around row >
                      <v-tooltip open-delay="600" top>
                        <template v-slot:activator="{ on }">
                          <v-flex xs5 class="greenText text-truncate" v-on="on"> {{universalMap(props.item.battle.o)}}
                            {{props.item.battle.cohesion.o | cohesion}} </v-flex>
                        </template>
                        <span>
                          {{universalMap(props.item.battle.o)}} {{props.item.battle.cohesion.o | cohesion}}
                        </span>
                      </v-tooltip>
                      <v-flex xs2 v-if="props.item.battle.civilWar == 0"><b> VS </b></v-flex>
                      <v-flex xs2 v-else><b> raised against </b></v-flex>
                      <v-tooltip open-delay="600" top>
                        <template v-slot:activator="{ on }">
                          <v-flex xs5 class="redText text-truncate" v-on="on">{{universalMap(props.item.battle.d)}}
                            {{props.item.battle.cohesion.d | cohesion}}</v-flex>
                        </template>
                        <span>
                          {{universalMap(props.item.battle.d)}} {{props.item.battle.cohesion.d | cohesion}}
                        </span>
                      </v-tooltip>
                    </v-layout>
              </td>
              <td class="text-xs-center">{{ props.item.battle.result | result}}</td>
              <td class="text-xs-right hidden-xs-only">
                <div class="text-truncate" v-html="computeWinnerPhrase(props.item.battle)" />
              </td>
            </template>
            <template v-if="!loaded" v-slot:actions-append>
              <v-btn round flat dark color="primary_history_tab" v-on:click="loadAll"> Load all data </v-btn>
            </template>
          </v-data-table>

      </v-card>
    </v-flex>

  </v-container>
</template>

<script>
  import {
    db
  }
  from '../plugins/firebase';
  import mapping from '../assets/mapping';

  export default {
    data: () => ({
      headersHistory: [{
          text: 'Turn',
          value: 'turn',
          sortable: true,
          align: 'center',
          class: 'title'
        },
        {
          text: 'Battle',
          value: 'battle',
          sortable: false,
          align: 'center',
          class: 'title'
        },
        {
          text: 'Result',
          value: 'result',
          sortable: true,
          align: 'center',
          class: 'title'
        },
        {
          text: 'Description',
          value: 'battlefield',
          sortable: false,
          align: 'right',
          class: 'title hidden-xs-only'
        },
      ],
      paginationHistory: {
        sortBy: 'turn',
        descending: true,
        rowsPerPage: 10
      },
      searchHistory: '',
      limit: 30,
      history: [],
      loaded: false
    }),
    firebase: function () {
      return {
        history: db.ref('public/history').orderByChild('turn').limitToLast(this.limit)
      }
    },
    methods: {
      // loadMore() {
      //   this.limit = this.limit + 10
      //   this.$rtdbBind('history', db.ref('public/history').orderByChild('turn').limitToLast(this.limit))
      //   this.paginationHistory.page = this.paginationHistory.page + 1
      // },
      loadAll() {
        this.loaded = true
        this.$rtdbBind('history', db.ref('public/history').orderByChild('turn'))
      },
      computeWinnerPhrase(item) {
        //TODO understand in case of civilWar what is the correct battlefield but also the correct outcome in general also for cohesionTab
        if (item.civilWar) {
          if(item.result == 1){
            return '<span class="greenText">' + this.universalMap(item.o) + '</span>' + ' has rebelled against ' + '<span class="redText">' + this.universalMap(item.d) + '</span>'
          }
          return '<span class="greenText">' + this.universalMap(item.d) + '</span>' + ' has stop the rebellion of ' + '<span class="redText">' + this.universalMap(item.o) + '</span>'
        }
        switch (item.result) {
          case 0:
            return 'The battle has been solved peacefully without a winner';
          case 1:
            return '<span class="greenText">' + this.universalMap(item.o) + '</span>' + ' has conquered ' +
              '<span class="redText">' + this.universalMap(item.dt) + '</span>';
          case 2:
            return '<span class="redText">' + this.universalMap(item.d) + '</span>' + ' has conquered ' +
              '<span class="greenText">' + this.universalMap(item.ot) + '</span>';
        }
      }
    },
    computed: {
      isMobile: function () {
        return this.$store.state.isMobile
      }
    },
    filters: {
      result(battle) {
        return battle != 0 ? battle : 'X'
      },
      cohesion(c) {
        return ' (' + (c * 100).toFixed(1) + ' %)'
      }
    }
  }
</script>