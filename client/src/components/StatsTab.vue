<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
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
          <v-text-field class="pa-2" v-model="searchStats" append-icon="search" label="Search" single-line hide-details>
          </v-text-field>
        </v-toolbar>


        <v-data-table :search="searchStats" :headers="headersStats" :items="countryStatus" :item-key="'name'"
          class="elevation-1" :pagination.sync="paginationStats" :rows-per-page-items="[10,20,50]">
          <template v-slot:items="props">
            <td class="text-xs-right">
              <v-avatar>
                <v-lazy-image class="pa-1" :src-placeholder="placeholderFlag" @error="src = placeholderFlag"
                  :src="getFlagString(universalMap(props.item['.key']))" :alt="universalMap(props.item['.key'])" />
              </v-avatar>
            </td>
            <td class="text-xs-right && font-weight-bold text-truncate">
              <v-layout row>
                <div> {{props.item.name}} </div>
                <v-tooltip v-if="props.item.ambassador" bottom>
                  <template v-slot:activator="{ on }">
                    <div class="ml-2 " v-on="on">🎖</div>
                  </template>
                  <span>The ambassador of this country it is <a :href="props.item.ambassador.link" target="blank" v-on="on"> {{props.item.ambassador.name}}</a></span>. If you want to become an ambassador of your country, check the instructions in the become an ambassador menu on the left!
                </v-tooltip>
              </v-layout>
            </td>
            <td class="text-xs-right">{{ props.item.territories }}</td>
            <td class="text-xs-right text-truncate">{{ (props.item.cohesion * 100).toFixed(1) + ' %'}}</td>
            <td class="text-xs-right hidden-xs-only">
              <v-btn class="white--text" color="primary_final_tab"
                v-on:click="goToBet('betfinal',universalMap(props.item.name, 'numberId'))">
                {{ (props.item.finalQuote + ' TRX')}}
              </v-btn>
            </td>
            <td class="text-xs-right hidden-xs-only">
              <v-btn class="white--text" color="primary_next_tab"
                v-on:click="goToBet('betnext',universalMap(props.item.name, 'numberId'))">
                {{ (props.item.probability * 100).toFixed(2) + ' %'}}
              </v-btn>
            </td>
            <td class="text-xs-right ">
              <v-btn color="facebook" class="white--text"
                v-on:click="openModal(universalMap(props.item.name, 'numberId'))">
                <v-icon class="mr-2" small color="white">
                  fab fa-facebook-square
                </v-icon>
                Support
              </v-btn>
            </td>
          </template>
          <template v-slot:no-results>
            <v-alert :value="true" color="error" icon="warning">
              Your search for "{{ searchStats }}" found no results.
            </v-alert>
          </template>
        </v-data-table>

      </v-card>
    </v-flex>
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
      headersStats: [{
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Country',
          value: 'name',
          sortable: false,
          align: 'right',
          class: 'body-1'
        }, {
          text: 'Owned',
          value: 'territories',
          sortable: true,
          align: 'right',
          class: 'body-1'
        }, {
          text: 'Cohesion',
          value: 'cohesion',
          sortable: true,
          align: 'right',
          class: 'body-1'
        },
        {
          text: 'Final Conquer Quote',
          value: 'finalQuote',
          sortable: true,
          align: 'right',
          class: 'body-1 hidden-xs-only'
        },
        {
          text: 'Next Conquer %',
          value: 'probability',
          sortable: true,
          align: 'right',
          class: 'body-1 hidden-xs-only'
        },
        {
          text: '',
          value: 'no-value',
          sortable: false,
          align: 'left',
          class: 'body-1'
        }
      ],
      paginationStats: {
        sortBy: 'territories',
        descending: true,
      },
      isVisible: false,
      searchStats: '',
      placeholderFlag: "/img/flags/placeholder.svg",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      mapStatus: [],
    }),
    firebase: function () {
      return {
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
      shareOnFb: async function () {
        await FB.getLoginStatus((response) => {
          if (response.status != 'connected') {
            FB.login((response) => {
              if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', (response) => {
                  console.log('Good to see you, ' + response.name + '.');
                  this.$store.commit('setFbUserName', response.name)
                });
                this.$store.commit('setFbAcessToken', response.authResponse.accessToken)
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
          country.name = this.universalMap(country['.key'])
          return country
        })
      },
      chosePhrase() {
        let random = Math.floor(Math.random() * this.phrases.length);
        return this.phrases[random].replace("<placeholder>", this.universalMap(this.$store.state.selectedCountry));
      },
    },
    mounted() {
      db.ref('public/mapStatus').orderByChild('territories').once('value', snap => {
        this.$root.$emit('stats_loaded', true);
      })
    }
  }
</script>