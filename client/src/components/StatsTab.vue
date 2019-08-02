<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>

      <!-- Countries -->
      <v-flex sm12 md6 lg5 shrink>
        <v-card>
          <v-toolbar color="primary_stats_tab" dark>
            <v-toolbar-title>Current Run Status</v-toolbar-title>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">

            <v-data-table :headers="headers" :items="mapStatus" class="elevation-1" :pagination.sync="pagination" :rows-per-page-items="[5,10]">
              <template v-slot:items="props" >
                <td class="text-xs-right">
                  <v-avatar>
                      <v-lazy-image :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                        :src="getFlagString(universalMap(props.item['.key']))"
                        :alt="universalMap(props.item['.key'])" />
                    </v-avatar>
                </td>  
                <td class="text-xs-right">{{ universalMap(props.item['.key'])}}</td>
                <td class="text-xs-right">{{ props.item.territories }}</td>
                <td class="text-xs-right">{{ props.item.cohesion.toFixed(2) }}</td>
              </template>
            </v-data-table>

            <!-- <v-layout align-center justify-space-between row wrap class="gameTabHeader">
            <v-flex xs3 sm5 md4 style="text-align: start;" class="title">Country</v-flex>
            <v-flex xs4 sm3 md4 style="text-align: center;" class="title">Territories</v-flex>
            <v-flex xs4 sm4 md4 style="text-align: end;" class="title">Cohesion</v-flex>
          </v-layout>

          <v-divider class="gameTabDivider"></v-divider>

          <v-container>
            <v-layout column>
            <v-layout row wrap v-for="(country) in mapStatus.slice().reverse().slice(10 * currentRunPagination - 10, 10 * currentRunPagination )" :key="country['.key']">
              <v-flex xs2>
                <v-avatar size="90%">
                  <v-lazy-image :src-placeholder="placeholderFlag" @error="src = placeholderFlag" :src="getFlagString(universalMap(country['.key']))" :alt="universalMap(country['.key'])" />
                </v-avatar>
              </v-flex>
              <v-flex xs4 style="text-align:start; margin-top:5px;" class="subheading">
                {{universalMap(country['.key'])}}
              </v-flex>
              <v-flex xs2 class="title" style="text-align: end">
                {{country.territories}}
              </v-flex>
              <v-flex xs3 class="title" style="text-align: end">
                {{country.cohesion.toFixed(2)}}
              </v-flex>
            </v-layout>

            <v-pagination
              color="primary_stats_tab"
              v-model="currentRunPagination"
              :length="25"
            >
            </v-pagination>
            </v-layout>
          </v-container> -->

          </v-container>
        </v-card>
      </v-flex>

      <!-- History -->
      <v-flex sm12 md6 lg7 grow>
        <v-card>

          <v-toolbar color="primary_stats_tab" dark>
            <v-toolbar-title>Current Run History</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">

            <v-container v-if="history.length <= 1" class="gameTabContent">
              <v-flex class="subheading">
                <v-chip label outline color="red">Run has not started yet...</v-chip>
              </v-flex>
            </v-container>

            <v-container v-else class="gameTabContent">

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

              <v-layout align-center justify-space-between row wrap
                v-for="conquest in history.slice().reverse().slice(10 * currentHistoryPagination - 10, 10 * currentHistoryPagination)"
                :key="conquest.turn">
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

            <v-pagination v-if="history.length > 1" v-model="currentHistoryPagination" color="primary_stats_tab"
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

  String.prototype.replaceAll = function (search, replace) {
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
      headers: [
      {
        text: '',
        value: '',
        sortable: false,
        align:'left'
      },
      {
        text: 'Country',
        value: 'country',
        sortable: false
      }, {
        text: 'Territories',
        value: 'territories',
        sortable: true,
      }, {
        text: 'Cohesion',
        value: 'cohesion',
        sortable: true
      }],
      pagination:{
        sortBy: 'territories',
        descending: true,
      },
      currentRunPagination: 1,
      currentHistoryPagination: 1,
      reversed: false,
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      history: [],
      mapStatus: []
    }),
    firebase: {
      history: db.ref('public/history').orderByChild('turn'),
      mapStatus: db.ref('public/countriesMap').orderByChild('territories')
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
    // computed: {
    //   countryStatus: function () {
    //     if(this.reversed){
    //       this.reversed = true
    //       return this.mapStatus.reverse()
    //     }
    //     return this.mapStatus
    //   }
    // }
  }
</script>