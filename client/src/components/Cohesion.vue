<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>

      <!-- Data Table -->
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
            <v-data-table :search="searchCohesion" :headers="headers" :items="cohesionHistory" :item-key="'date'"
              :custom-sort="customSort" class="elevation-1" :pagination.sync="pagination"
              :rows-per-page-items="[10,20,50]">
              <template v-slot:items="props">
                <!-- Update type -->
                <td class="text-xs-center">
                  <v-avatar size="32">
                    <v-img :src="getInteractionImg(props.item.update_type)" />
                  </v-avatar>
                </td>
                <!-- Content -->
                <td class="text-xs-left">
                  <div v-if="props.item.update_type == 'BATTLE'">
                    {{universalMap(props.item.battle.o)}}
                    <b> VS </b>
                    {{universalMap(props.item.battle.d)}}
                  </div>
                  <div v-else>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <a :href="props.item.link" target="blank" v-on="on"> {{props.item.text | truncate}}</a>
                      </template>
                      <span> {{props.item.text }}
                      </span>
                    </v-tooltip>
                  </div>
                </td>
                <!-- Flag -->
                <td class="text-xs-left">
                  <v-tooltip right>
                    <template v-slot:activator="{ on }">
                      <v-avatar size="40" v-on="on">
                        <v-img class="ma-2" :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                          :src="getFlagString(universalMap(props.item.country))"
                          :alt="universalMap(props.item.country)" />
                      </v-avatar>
                    </template>
                    <span> {{universalMap(props.item.country)}}</span>
                  </v-tooltip>
                </td>
                <!-- Cohesion -->
                <td class="text-xs-center">
                  <v-layout row>
                    <v-flex xs5 v-bind:class="{greenText: props.item.delta > 0, redText: props.item.delta <= 0}">
                      <b>{{ (props.item.delta * 100).toFixed(2) | cohesionSign }} </b> </v-flex>
                    <v-flex xs2>
                      <v-icon small> keyboard_arrow_right </v-icon>
                    </v-flex>
                    <v-flex xs5> {{(props.item.old * 100).toFixed(2) + '%'}} </v-flex>
                  </v-layout>
                </td>
                <!-- Turn -->
                <td class="text-xs-right">{{ props.item.turn }}</td>
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
      headers: [
        {
          text: 'Update',
          value: 'update_type',
          sortable: true,
          align: 'center',
          class: 'title'
        },
        {
          text: 'Content',
          value: 'content',
          sortable: false,
          align: 'left',
          class: 'title'
        },
        {
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left',
        },
        {
          text: 'Cohesion',
          value: 'cohesion',
          sortable: true,
          align: 'center',
          class: 'title'
        },
        {
          text: 'Turn',
          value: 'turn',
          sortable: true,
          align: 'right',
          class: 'title'
        }
      ],
      pagination: {
        sortBy: 'turn',
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
      getInteractionImg(str) {
        switch (str) {
          case 'BATTLE':
            return "/img/interactions/battle.svg"
          case 'ROULETTE':
            return "/img/interactions/telegram.svg"
          default:
            return "/img/interactions/facebook.svg"
        }
      },
      goToBet(path, country) {
        this.$store.commit('setSelectedCountry', country)
        this.$router.push(path)
      },
      customSort(items, index, isDesc) {
        items.sort((a, b) => {
          if (index === "cohesion") {
            if (!isDesc) {
              return a.delta < b.delta ? -1 : 1;
            } else {
              return b.delta < a.delta ? -1 : 1;
            }
          } else {
            if (!isDesc) {
              return a[index] < b[index] ? -1 : 1;
            } else {
              return b[index] < a[index] ? -1 : 1;
            }
          }
        });
        return items;
      }
    },
    filters: {
      cohesionSign(delta) {
        return delta >= 0 ? '+' + delta + '%' : delta + '%'
      },
      truncate(text) {
        return text.length > 50 ? text.substring(0, 49) + '...' : text
      }
    }
  }
</script>