<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <v-layout row wrap>

      <!-- Countries -->
      <v-flex sm12 md12 lg12 shrink>
        <v-card>
          <v-toolbar color="primary_stats_tab" dark>
            <v-toolbar-title>Current Run Status</v-toolbar-title>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="secondary-next-tab" dark v-on="on">info</v-icon>
              </template>
              <span>
                - Territories:
                It represents the number of national territories controlled by the conquerer country. There are 241
                countries in the map, once a country controls them all it is declared the winner of the current run.<br>

                - Cohesion:
                It represents the level of welfare and patriotism of a specific national territory. The higher the
                cohesion, the more united is the country and the higher is the chance for that country to keep
                conquering territories. The cohesion gets updated.<br>

                - Final conquer quote:
                It represents the price for a single bet on the final winner which allows to redeem the final jackpot.
                The price varies depending on jackpot size and the probability of the chosen country to win the full
                run. The higher the probability or the jackpot, the higher the cost of a single bet. Prices steadily
                increase over turns, the sooner the bets get placed the higher will be the reward in case of
                victory.<br>

                - Next conquer %:
                It represents the exact likelihood for a country to conquer a territory in the upcoming turn. It is
                calculated considering the size of the conquered borders for a given country times its cohesion index.
                The more cohesive the country is the higher the chance it keeps on conquering territories. Similarly,
                the cohesion index affects also the probability for a given territory to rebel on the dominating
                country.<br></span>
            </v-tooltip>
            <v-spacer />
            <v-text-field class="pa-2" v-model="searchStats" append-icon="search" label="Search" single-line
              hide-details></v-text-field>
          </v-toolbar>

          <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">
            <v-data-table :search="searchStats" :headers="headers" :items="countryStatus" :item-key="'idx'"
              class="elevation-1" :pagination.sync="pagination" :rows-per-page-items="[10,20,50]">
              <template v-slot:items="props">
                <td class="text-xs-right">
                  <v-avatar>
                    <v-lazy-image class="pa-1" :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                      :src="getFlagString(universalMap(props.item['.key']))" :alt="universalMap(props.item['.key'])" />
                  </v-avatar>
                </td>
                <td class="text-xs-right && font-weight-bold">{{props.item.idx}}</td>
                <td class="text-xs-right">{{ props.item.territories }}</td>
                <td class="text-xs-right">{{ (props.item.cohesion * 100).toFixed(2) + ' %'}}</td>
                <!-- <td class="text-xs-right ">
                  <v-btn class="white--text" color="primary_final_tab"
                    v-on:click="goToBet('betfinal',universalMap(props.item.idx, 'numberId'))">
                    {{ (props.item.finalQuote + ' TRX')}}
                  </v-btn>
                </td> -->
                <td class="text-xs-right ">
                  <v-btn class="white--text" color="primary_next_tab"
                    v-on:click="goToBet('betnext',universalMap(props.item.idx, 'numberId'))">
                    {{ (props.item.probability * 100).toFixed(2) + ' %'}}
                  </v-btn>
                </td>
                <td class="text-xs-right ">
                  <v-icon large v-on:click="openModal(universalMap(props.item.idx, 'numberId'))" color="facebook">
                    fab fa-facebook-square</v-icon>
                </td>
              </template>
              <template v-slot:no-results>
                <v-alert :value="true" color="error" icon="warning">
                  Your search for "{{ searchStats }}" found no results.
                </v-alert>
              </template>
            </v-data-table>

          </v-container>
        </v-card>
      </v-flex>

      <!-- History -->
      <v-flex sm12 md12 lg12 grow>
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
    <v-layout row justify-center>
      <v-dialog v-model="isVisible" max-width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2"> Support Your Country </v-card-title>
          <v-card-text>
            <div class="title">
              Big news!
              You can now support your country and help it winning the Tron World War!!
            </div>
            <br>
            <div>
              All you have to do is to engage with Tron War Bot's <a
                href="https://www.facebook.com/TronWarBot/">Facebook page</a> and mention your favorite
              country in either a post, a comment, a review or a share of a page's post and encourage your country's
              army into doing its best with a great motivational message.
              <br>
              As an example you can use this message, copy it and post it on Tron War Bot's page feed using the share
              button below!
            </div>
            <br>
            <v-flex>
              <v-text-field ref='phrase' :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'"
                :value="this.universalMap(this.$store.state.selectedCountry) + ' is best country ever'" readonly>
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field ref='phrase' :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'"
                :value="'I love ' + this.universalMap(this.$store.state.selectedCountry) + ' and all of its super cute penguins'"
                readonly>
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field ref='phrase' :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'"
                :value="'I think nothing is stronger than ' + this.universalMap(this.$store.state.selectedCountry) + ' with all of its wonderful yet explosive nuclear bombs!!!'"
                readonly>
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field ref='phrase' :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'"
                :value="'I am in love with ' + this.universalMap(this.$store.state.selectedCountry) + '\'s army and all the strong and charming soldiers'"
                readonly>
              </v-text-field>
            </v-flex>
            <br>
            <div>
              TronWarBot will automatically read your post/comment and update the cohesion of the mentioned country
              based on the energy of your message, which will drastically increase the winning odds for that country in
              the Tron World War!
              <br>
              Be creative now!!
            </div>
            <br>
            <v-expansion-panel>
              <v-expansion-panel-content v-for="(item,i) in 1" :key="i">
                <template v-slot:header>
                  <div>Rules</div>
                </template>
                <v-card>
                  <v-card-text>
                    <div>

                      The message, if valid, will update the cohesion of the mentioned country with the following
                      criteria:
                      <br>
                      <ul>
                        <li> A COMMENT is worth +-0.1% cohesion point for the mentioned country </li>
                        <li>A VISITOR POST on page's feed is worth +-0.2% cohesion point for the mentioned country (or
                          anything in
                          between based on the message energy) </li>
                        <li>A REVIEW is worth +-0.5% cohesion point for the mentioned country (or anything in between
                          based on
                          the
                          message energy)</li>
                        <li>A SHARE of a page's post is worth +-1.0% cohesion point for the mentioned country (or
                          anything in
                          between based on the message energy)</li>
                      </ul>
                      <br>
                      Beware that a negative message, will also make a country lose its cohesion!
                      <v-spacer />
                      <br>
                      P.S: Each facebook user is entitled to only one motivational comment plus one post and one share
                      per
                      day
                      (UTC time), and a single page's review.
                    </div>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="white--text" color="facebook" v-on:click="shareOnFb"> Share on facebook </v-btn>
            <v-btn color="success" @click.stop="isVisible = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-snackbar v-model="snackbar" :color="'info'" :timeout="3000" vertical bottom>
      <span class="title"> Copied to clipboard</span>
    </v-snackbar>
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
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Country',
          value: 'idx',
          sortable: false,
          align: 'right',
          class: 'title'
        }, {
          text: 'Territories',
          value: 'territories',
          sortable: true,
          align: 'right',
          class: 'title'
        }, {
          text: 'Cohesion',
          value: 'cohesion',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        // {
        //   text: 'Final Conquer Quote',
        //   value: 'finalQuote',
        //   sortable: true,
        //   align: 'right',
        //   class: 'title'
        // },
        {
          text: 'Next Conquer %',
          value: 'probability',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        {
          text: 'Support',
          value: 'no-value',
          sortable: false,
          align: 'left'
        }
      ],
      pagination: {
        sortBy: 'territories',
        descending: true,
      },
      isVisible: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      searchStats: '',
      currentRunPagination: 1,
      currentHistoryPagination: 1,
      reversed: false,
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      history: [],
      mapStatus: [],
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
      goToBet(path, country) {
        this.$store.commit('setSelectedCountry', country)
        //this.$router.push(path)
      },
      openModal(country) {
        this.$store.commit('setSelectedCountry', country)
        this.isVisible = true
      },
      copyToClipBoard(value, ref) {
        const input = this.$refs[ref];
        input.focus();
        document.execCommand('selectAll');
        this.copied = document.execCommand('copy');
        this.snackbar = true
      },
      shareOnFb: async function () {
        // FB.logout(function (response) {
        //   // Person is now logged out
        //   console.log(response)
        // });
        await FB.getLoginStatus(function (response) {
          console.log(response)
          if (response.status != 'connected') {
            FB.login(function (response) {
              if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', function (response) {
                  console.log('Good to see you, ' + response.name + '.');
                });
              } else {
                console.log('User cancelled login or did not fully authorize.');
              }
            });
          }
        });
        await FB.ui({
          method: 'feed',
          link: 'https://tronwarbot.com',
          display: 'touch',
          to: '423138885180430'
        }, function (response) {});
      }
    },
    computed: {
      countryStatus: function () {
        return this.mapStatus.map(country => {
          country.idx = this.universalMap(country.idx)
          return country
        })
      },
      text: function () {
        return "<b> " + this.universalMap(this.$store.state.selectedCountry) + "</b>"
      }
    }
  }
</script>