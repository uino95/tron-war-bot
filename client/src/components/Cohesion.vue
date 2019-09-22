<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>

      <!-- Countries -->
      <v-flex sm12 md12 lg12 shrink>
        <v-card>
          <v-toolbar color="primary_stats_tab" dark>
            <v-toolbar-title>Current Run Cohesion Status</v-toolbar-title>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="secondary-next-tab" dark v-on="on">info</v-icon>
              </template>
              <span> todo:
                Here you can see how the cohesion have been modified during the current run. It can be modified by your
                interaction by posting, sharing or liking a post or it can be moified by the result of a battle itself
              </span>
            </v-tooltip>
            <v-spacer />
            <v-text-field class="pa-2" v-model="searchCohesion" append-icon="search" label="Search" single-line
              hide-details></v-text-field>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">
            <v-data-table :search="searchCohesion" :headers="headers" :items="cohesionWithNames" :item-key="'date'"
              class="elevation-1" :pagination.sync="pagination" :rows-per-page-items="[10,20,50]">
              <template v-slot:items="props">
                <td class="text-xs-left font-weight-bold">{{ props.item.user_name}}</td>
                <td class="text-xs-right">{{ props.item.update_type }}</td>
                <td class="text-xs-right">{{ props.item.countryName}}</td>
                <td class="text-xs-left">
                  <v-avatar>
                    <v-lazy-image class="pa-1" :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                      :src="getFlagString(universalMap(props.item.country))" :alt="universalMap(props.item.country)" />
                  </v-avatar>
                </td>
                <td class="text-xs-right"
                  v-bind:class="{greenText: props.item.delta > 0, redText: props.item.delta <= 0}">
                  {{ props.item.delta.toFixed(5) }}</td>
                <td class="text-xs-right"><a :href="props.item.link" target="blank"> {{props.item.link }}</a></td>
                <td class="text-xs-right">{{ props.item.date | DATE }}</td>
              </template>
              <template v-slot:no-results>
                <v-alert :value="true" color="error" icon="warning">
                  Your search for "{{ searchCohesion }}" found no results.
                </v-alert>
              </template>
            </v-data-table>

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
      headers: [{
          text: 'User',
          value: 'user_name',
          sortable: true,
          align: 'left',
          class: 'title'
        },
        {
          text: 'Interaction',
          value: 'update_type',
          sortable: true,
          align: 'right',
          class: 'title'
        }, 
        {
          text: 'Country',
          value: 'countryName',
          sortable: true,
          align: 'right',
          class: 'title'
        }, 
        {
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left',
        }, 
        {
          text: 'Delta',
          value: 'delta',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        {
          text: 'Link',
          value: 'link',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        {
          text: 'Date',
          value: 'date',
          sortable: true,
          align: 'right',
          class: 'title'
        }
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
      },
      searchCohesion: '',
      placeholderFlag: "/img/flags/placeholder.svg",
      cohesionHistory: []
    }),
    firebase: {
      cohesionHistory: db.ref('public/cohesion').orderByChild('date'),
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
      goToBet(path, country) {
        this.$store.commit('setSelectedCountry', country)
        this.$router.push(path)
      }
    },
    filters: {
      DATE: (date) => {
        var a = new Date(date);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var day = a.getDate() < 10 ? '0' + a.getDate() : a.getDate();
        var hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
        var time = day + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
      }
    },
    computed:{ 
      cohesionWithNames: function () {
        return this.cohesionHistory.map(elem => {
          elem.countryName = this.universalMap(elem.country)
          return elem
        })
      }
    }
  }
</script>