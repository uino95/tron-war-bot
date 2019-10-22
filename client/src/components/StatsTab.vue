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
            <v-data-table :search="searchStats" :headers="headersStats" :items="countryStatus" :item-key="'idx'"
              class="elevation-1" :pagination.sync="paginationStats" :rows-per-page-items="[10,20,50]">
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
                <td class="text-xs-right ">
                  <v-btn class="white--text" color="primary_final_tab"
                    v-on:click="goToBet('betfinal',universalMap(props.item.idx, 'numberId'))">
                    {{ (props.item.finalQuote + ' TRX')}}
                  </v-btn>
                </td>
                <td class="text-xs-right ">
                  <v-btn class="white--text" color="primary_next_tab"
                    v-on:click="goToBet('betnext',universalMap(props.item.idx, 'numberId'))">
                    {{ (props.item.probability * 100).toFixed(2) + ' %'}}
                  </v-btn>
                </td>
                <td class="text-xs-right ">
                  <v-btn color="facebook" class="white--text"
                    v-on:click="openModal(universalMap(props.item.idx, 'numberId'))">
                    Support
                    <v-icon class="ml-2" small color="white">
                      fab fa-facebook-square
                    </v-icon>
                  </v-btn>
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
      <v-flex sm12 md12 lg12 shrink>
        <v-card>
          <v-toolbar color="primary_stats_tab" dark>
            <v-toolbar-title>Recent History</v-toolbar-title>
            <v-spacer />
            <v-text-field class="pa-2" v-model="searchHistory" append-icon="search" label="Search" single-line
              hide-details></v-text-field>
          </v-toolbar>
          <v-container grid-list-md text-xs-center class="font-weight-regular gameTab">
            <v-data-table :search="searchHistory" :headers="headersHistory" :items="history" :item-key="'turn'"
              class="elevation-1" :pagination.sync="paginationHistory">
              <template v-slot:items="props">
                <td class="text-xs-center">{{ props.item.turn }}</td>
                <td class="text-xs-center">
                  <div v-if="props.item.battle.civilWar">
                    <b>{{universalMap(props.item.battle.o)}}</b> has insurrected
                  </div>
                  <div v-else>
                    <v-container>
                      <v-layout align-center justify-space-around row fill-height>
                        <v-tooltip open-delay="600" top>
                          <template v-slot:activator="{ on }">
                            <v-flex xs5 class="greenText text-truncate" v-on="on"> {{universalMap(props.item.battle.o)}} {{props.item.battle.cohesion.o | cohesion}} </v-flex> 
                          </template>
                          <span>
                            {{universalMap(props.item.battle.o)}} {{props.item.battle.cohesion.o | cohesion}} 
                          </span>
                        </v-tooltip>
                        <v-flex xs2><b> VS </b></v-flex>
                        <v-tooltip open-delay="600" top>
                          <template v-slot:activator="{ on }">
                            <v-flex xs5 class="redText text-truncate" v-on="on">{{universalMap(props.item.battle.d)}} {{props.item.battle.cohesion.d | cohesion}}</v-flex> 
                          </template>
                          <span>
                            {{universalMap(props.item.battle.d)}} {{props.item.battle.cohesion.d | cohesion}} 
                          </span>
                        </v-tooltip>
                      </v-layout>
                    </v-container>
                  </div>
                </td>
                <td class="text-xs-center">{{ props.item.battle.result | result}}</td>
                <td v-if="!isMobile" class="text-xs-right">
                  <div v-html="computeWinnerPhrase(props.item.battle)"/>
                </td>
              </template>
              <template v-if="!loaded" v-slot:actions-append > 
               <v-btn round flat dark color="primary_stats_tab" v-on:click="loadAll"> Load all data </v-btn>
              </template>  
            </v-data-table>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row justify-center>
      <v-dialog max-width="800" v-model="isVisible">
        <v-card>
          <v-card-title class="headline grey lighten-2"> Support Your Country </v-card-title>
          <v-card-text>
            <div class="title">
              Big news!
              You can now support your country and help it winning the Tron World War!!
            </div>
            <br>
            <div>
              All you have to do is to engage with <b>Tron War Bot's </b><a
                href="https://www.facebook.com/TronWarBot/">Facebook page</a> and mention your favorite
              <b>country</b> in either a <i>post, a comment, a review or a share</i> of a page's post and encourage your
              <b>country's
                army</b> into doing its best with a great motivational message.
              <br>
              <br>
              As an example you can use this message, copy it and post it on <b>Tron War Bot's page feed</b> using the
              share button below!
            </div>
            <br>
            <v-flex>
              <v-text-field ref='phrase' :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'" :value="chosePhrase" readonly>
              </v-text-field>
            </v-flex>
            <br>
            <div>
              <b> TronWarBot </b> will automatically read your post/comment and update the <b>cohesion</b> of the
              mentioned country
              based on the energy of your message, which will drastically increase the winning odds for that country in
              the <b>Tron World War!</b>
              <br>
              Be creative now!!
            </div>
            <br>
            <v-expansion-panel>
              <v-expansion-panel-content v-for="(item,i) in 1" :key="i">
                <template v-slot:header>
                  <div> <b>Rules</b></div>
                </template>
                <v-card>
                  <v-card-text>
                    <div>

                      The message, if valid, will update the cohesion of the mentioned country with the following
                      criteria:
                      <br>
                      <ul>
                        <li><b>COMMENT</b> is worth <span style="color: green"><b>+/- 0.1%</b></span> cohesion point for
                          the mentioned country </li>
                        <li><b>VISITOR POST</b> on page's feed is worth <span style="color: green"><b>+/-
                              0.2%</b></span> cohesion point for the mentioned country (or
                          anything in
                          between based on the message energy) </li>
                        <li><b>REVIEW</b> is worth <span style="color: green"><b>+/- 0.5%</b></span> cohesion point for
                          the mentioned country (or anything in between
                          based on
                          the
                          message energy)</li>
                        <li><b>SHARE</b> of a page's post is worth <span style="color: green"><b>+/- 1.0%</b></span>
                          cohesion point for the mentioned country (or
                          anything in
                          between based on the message energy)</li>
                      </ul>
                      <br>
                      Beware that a negative message, will also make a country lose its cohesion!
                      <v-spacer />
                      <br>
                      <i>P.S: Each facebook user is entitled to only one motivational comment plus one post and one
                        share
                        per
                        day
                        (UTC time), and a single page's review.</i>
                    </div>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="white--text" color="facebook" v-on:click="shareOnFb">
              <v-icon class="mr-2"> fab fa-facebook-square </v-icon>
              Share on facebook
            </v-btn>
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
      phrases: [
        '<placeholder> is best country ever',
        'I love <placeholder> and all of its super cute penguins',
        'I think nothing is stronger than <placeholder> with all of its wonderful yet explosive nuclear bombs!!!',
        'I am in love with <placeholder>\'s army and all the strong and charming soldiers'
      ],
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
          text: '',
          value: 'battlefield',
          sortable: false,
          align: 'right',
          class: 'title'
        },
      ],
      headersStats: [{
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
        {
          text: 'Final Conquer Quote',
          value: 'finalQuote',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        {
          text: 'Next Conquer %',
          value: 'probability',
          sortable: true,
          align: 'right',
          class: 'title'
        },
        {
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left',
          class: 'title'
        }
      ],
      paginationStats: {
        sortBy: 'territories',
        descending: true,
      },
      paginationHistory: {
        sortBy: 'turn',
        descending: true,
        rowsPerPage: 10
      },
      isVisible: false,
      searchStats: '',
      searchHistory: '',
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      history: [],
      mapStatus: [],
      limit: 30,
      loaded: false
    }),
    firebase: function () {
      return {
        history: db.ref('public/history').orderByChild('turn').limitToLast(this.limit),
        mapStatus: db.ref('public/countriesMap').orderByChild('territories')
      }
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
      // loadMore() {
      //   this.limit = this.limit + 10
      //   this.$rtdbBind('history', db.ref('public/history').orderByChild('turn').limitToLast(this.limit))
      //   this.paginationHistory.page = this.paginationHistory.page + 1
      // },
      loadAll(){
        this.loaded = true
        this.$rtdbBind('history', db.ref('public/history').orderByChild('turn'))
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
      },
      computeWinnerPhrase(item) {
        //TODO understand in case of civilWar what is the correct battlefield but also the correct outcome in general also for cohesionTab
        if (item.civilWar) {
          return this.universalMap(item.o) + ' has rebelled against ' + this.universalMap(item.d)
        }
        switch (item.result) {
          case 0:
            return 'The battle has been solved peacefully without a winner';
          case 1:
            return '<span class="greenText">' + this.universalMap(item.o) + '</span>' + ' has conquered ' + '<span class="redText">' +  this.universalMap(item.dt) + '</span>';
          case 2:
            return '<span class="redText">' + this.universalMap(item.d) + '</span>' + ' has conquered ' + '<span class="greenText">' +  this.universalMap(item.ot) + '</span>';
        }
      }
    },
    computed: {
      countryStatus: function () {
        return this.mapStatus.map(country => {
          country.idx = this.universalMap(country.idx)
          return country
        })
      },
      chosePhrase() {
        let random = Math.floor(Math.random() * this.phrases.length);
        return this.phrases[random].replace("<placeholder>", this.universalMap(this.$store.state.selectedCountry));
      },
      text: function () {
        return "<b> " + this.universalMap(this.$store.state.selectedCountry) + "</b>"
      },
      isMobile: function(){
        return this.$store.state.isMobile
      }
    },
    filters: {
      result(battle) {
        return battle != 0 ? battle : 'X'
      },
      cohesion(c){
        return ' (' + (c * 100).toFixed(1) + ' %)'
      }
    }
  }
</script>