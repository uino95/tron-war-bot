<template>
  <v-container grid-list-md text-xs-center class="outerTabContainer">
    <!-- Countries -->
    <v-flex sm12 md12 lg12 shrink>
      <v-card>
        <v-toolbar color="secondary_light" class="text_secondary--text" light>
          <v-toolbar-title>Current Status</v-toolbar-title>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon color="text_secondary" light v-on="on">info</v-icon>
            </template>
            <span>Here you can see some interisting insight</span>
          </v-tooltip>
          <v-spacer />
          <v-text-field
            class="pa-2"
            v-model="searchStats"
            append-icon="search"
            label="Search for a country"
            single-line
            hide-details
          ></v-text-field>
        </v-toolbar>

        <v-data-table
          :search="searchStats"
          :headers="headersStats"
          :items="countryStatus"
          :item-key="'name'"
          class="elevation-1"
          :pagination.sync="paginationStats"
          :rows-per-page-items="[10,20,50]"
        >
          <template v-slot:headers="props">
            <th
              v-for="header in props.headers"
              :key="header.id"
              :align="header.align"
              :class="[header.class, 'column sortable', paginationStats.descending ? 'desc' : 'asc', header.value === paginationStats.sortBy ? 'active' : '']"
              @click="header.sortable ? changeSort(header.value) : ''"
            >
              <v-tooltip bottom v-if="header.description != null">
                <template v-slot:activator="{ on }">
                  <v-container v-on="on" class="pa-0">
                    {{header.text}}
                    <v-icon  v-if="header.sortable" small>arrow_upward</v-icon>
                  </v-container>
                </template>
                <span>{{header.description}}</span>
              </v-tooltip>
              <v-container v-else class="pa-0">
                {{ header.text }}
                <v-icon v-if="header.sortable" small>arrow_upward</v-icon>
              </v-container>
            </th>
            <!-- <th class="hidden-sm-and-up pa-0" align="left">
              <v-btn
                fab
                small
                :style="visButton.possibilities[visButton.count] == 'support' ? 'font-size: 8px' : 'font-size:10px'"
                class="white--text"
                :color="visButton.color[visButton.count]"
                @click="toggleButton()"
              >{{visButton.possibilities[visButton.count]}}</v-btn>
            </th>-->
          </template>
          <template v-slot:items="props">
            <td class="text-xs-center pa-0 pl-2 pr-2">
              <v-tooltip class="hidden-sm-and-up" right>
                <template v-slot:activator="{ on }">
                  <v-avatar size="40" v-on="on">
                    <v-img
                      class="ma-2"
                      :lazy-src="placeholderFlag"
                      ref="img"
                      :src="getFlagString(universalMap(props.item['.key']))"
                      :alt="universalMap(props.item['.key'])"
                    />
                  </v-avatar>
                </template>
                <span>{{universalMap(props.item['.key'])}}</span>
              </v-tooltip>
            </td>
            <!-- <td class="text-xs-left pa-0">
              <v-tooltip v-if="props.item.ambassador" close-delay="1000" bottom>
                <template v-slot:activator="{ on }">
                  <div class="text-left title" v-on="on">🎖</div>
                </template>
                <span>
                  The ambassador of {{props.item.name}} is
                  <br />
                  <b>
                    <a
                      style="color: white"
                      :href="props.item.ambassador.link"
                      target="blank"
                    >{{props.item.ambassador.name}}</a>
                  </b>
                </span>
                <br />
                <i>
                  If you would like to become an ambassador of your country,
                  <br />check out the rules in the
                  <i>Ambassador</i> section in the menu.
                </i>
              </v-tooltip>
            </td>-->
            <td
              class="text-xs-left && font-weight-bold pr-2 pl-2 hidden-sm-and-down"
              v-bind:style="{'max-width': ((windowSize.x / 12) * 3)  + 'px'}"
            >
              <div>{{props.item.name}}</div>
            </td>
            <td class="text-xs-left pa-0">
              <v-layout row>
                {{ props.item.active | NUMBER }}
                <div class="ml-2 hidden-xs-only">{{'(' + ((props.item.active / props.item.population) * 100).toFixed(2)  + ' %)' }}</div>
              </v-layout>
            </td>
            <td class="text-xs-left pa-0 pr-2">
              <v-layout row>
              {{ props.item.deaths | NUMBER}}
              <div class="ml-2 redText hidden-xs-only">{{data.turnData.battle.stats[props.item['.key']].deaths | NUMBER_WITH_PLUS }}</div>
              </v-layout>
            </td>
            <td class="text-xs-left pa-0 pr-2">
              <v-layout row>
              {{props.item.infected | NUMBER}}
              <div class="ml-2 redText hidden-xs-only"> {{data.turnData.battle.stats[props.item['.key']].infected | NUMBER_WITH_PLUS}} </div>
              </v-layout>
            </td>
            <td class="greenText text-xs-left pa-0">{{ data.turnData.battle.stats[props.item['.key']].recovered | NUMBER }}</td>
            <!-- <td class="text-xs-left hidden-xs-only pa-0">
              <v-btn
                class="white--text"
                color="primary_final_tab"
                v-on:click="goToBet('betfinal',universalMap(props.item.name, 'numberId'))"
              >{{ (props.item.finalQuote + ' TRX')}}</v-btn>
            </td> 
            <td class="text-xs-left hidden-xs-only pa-0">
              <v-btn
                class="white--text"
                color="primary_next_tab"
                v-on:click="goToBet('betnext',universalMap(props.item.name, 'numberId'))"
              >{{ (props.item.probability * 100).toFixed(2) + ' %'}}</v-btn>
            </td>
            <td class="text-xs-left hidden-xs-only pa-0">
              <v-btn
                color="facebook"
                class="white--text"
                v-on:click="openModal(universalMap(props.item.name, 'numberId'))"
              >
                <v-icon class="mr-2" small color="white">fab fa-facebook-square</v-icon>Support
              </v-btn>
            </td> 
            <td class="text-xs-left hidden-sm-and-up pa-0">
              <v-btn
                v-if="visButton.possibilities[visButton.count] === 'support'"
                fab
                small
                color="facebook"
                class="white--text very-small-button"
                v-on:click="openModal(universalMap(props.item.name, 'numberId'))"
              >
                <v-icon small color="white">fab fa-facebook-square</v-icon>
              </v-btn>
              <v-btn
                fab
                small
                v-else-if="visButton.possibilities[visButton.count] === 'final'"
                class="white--text very-small-button"
                color="primary_final_tab"
                v-on:click="goToBet('betfinal',universalMap(props.item.name, 'numberId'))"
              >{{ (props.item.finalQuote)}}</v-btn>
              <v-btn
                fab
                small
                v-else
                class="white--text very-small-button"
                color="primary_next_tab"
                v-on:click="goToBet('betnext',universalMap(props.item.name, 'numberId'))"
              >{{ (props.item.probability * 100).toFixed(2) + ' %'}}</v-btn>
            </td>-->
          </template>
          <template v-slot:no-results>
            <v-alert
              :value="true"
              color="error"
              icon="warning"
            >Your search for "{{ searchStats }}" found no results.</v-alert>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
    <!-- <v-layout row justify-center>
      <v-dialog max-width="800" v-model="isVisible">
        <v-card>
          <v-card-title class="headline grey lighten-2">Support Your Country</v-card-title>
          <v-card-text>
            <div class="title">
              Big news!
              You can now help your country win the Tron World War!
            </div>
            <br />
            <div>
              <h4>How?</h4>Simply engage on Facebook,
              <u>specifying your favorite country</u>,
              in either a
              <i>visitor post</i>, a
              <i>comment</i> or writing a
              <i>page review</i> on the official Tron War Bot's
              <a
                href="https://www.facebook.com/TronWarBot/"
              >Facebook page</a>, or
              <i>mention</i> &nbsp
              <b>@Tron War Bot</b> in a post on your timeline and encourage your
              country into doing its best with a great motivational message.
              <br />
              <br />For example you can use the message below, copy it and post it mentioning
              <b>@Tron War Bot</b> on your timeline
              or on Tron War Bot's page feed using the share button.
            </div>
            <br />
            <v-flex>
              <v-text-field
                ref="phrase"
                :append-icon="'content_copy'"
                @click:append="copyToClipBoard(universalMap($store.state.selectedCountry), 'phrase')"
                :label="'Sample Phrase'"
                :value="chosePhrase"
                readonly
              ></v-text-field>
            </v-flex>
            <br />
            <div>
              TronWarBot will read your post/comment and update the cohesion of the
              mentioned country based on the energy of your message,
              which will in turn drastically affect the winning odds for that country in the
              <i>Tron War.</i>
              <br />
              <br />
              <h4>It's your turn now! Be creative!</h4>
            </div>
            <br />
            <v-expansion-panel>
              <v-expansion-panel-content v-for="(item,i) in 1" :key="i">
                <template v-slot:header>
                  <div>
                    <b>Exact rules</b>
                  </div>
                </template>
                <v-card>
                  <v-card-text>
                    <div>
                      The message, to be valid, must contain a reference as explicit as possible to the country
                      and it will be scored by our sentiment analysis engine which will assess its positivity/negativity.
                      <br />If the message is valid and non neutral it will update the cohesion of the mentioned country with the following
                      criteria:
                      <br />
                      <br />
                      <ul>
                        <li>
                          up to
                          <span style="color: green">
                            <b>+/-0.1%</b>
                          </span>
                          for a
                          <b>comment</b> on any post of Tron War Bot's FB page.
                        </li>
                        <li>
                          up to
                          <span style="color: green">
                            <b>+/-0.2%</b>
                          </span>
                          for a
                          <b>visitor post</b> on the FB page's feed
                        </li>
                        <li>
                          up to
                          <span style="color: green">
                            <b>+/-0.5%</b>
                          </span>
                          for a
                          <b>page review</b> of Tron War Bot's FB page
                        </li>
                        <li>
                          up to
                          <span style="color: green">
                            <b>+/-1.0%</b>
                          </span>
                          for a
                          <b>mention</b> of
                          <b>@Tron War Bot</b> in a post on the user timeline
                        </li>
                      </ul>
                      <br />Beware that a negative message, will also make a country lose its cohesion!
                      <v-spacer />
                      <br />
                      <i>
                        <u>
                          P.S: Each facebook user is entitled to a single motivational comment and a single post or
                          mention
                          <b>per day</b> (UTC time), and an overall single page's review.
                        </u>
                      </i>
                    </div>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="white--text" color="facebook" v-on:click="shareOnFb">
              <v-icon class="mr-2">fab fa-facebook-square</v-icon>Share
            </v-btn>
            <v-btn color="success" @click.stop="isVisible = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>-->
    <v-snackbar v-model="snackbar" :color="'info'" :timeout="3000" vertical bottom>
      <span class="title">Copied to clipboard</span>
    </v-snackbar>
  </v-container>
</template>

<script>
import { db } from "../plugins/firebase";
import {format} from "../utils/NumberUtils";

String.prototype.replaceAll = function(search, replace) {
  if (replace === undefined) {
    return this.toString();
  }
  return this.split(search).join(replace);
};

export default {
  data: () => ({
    windowSize: {
      x: window.innerWidth,
      y: window.innerHeight
    },
    headersStats: [
      {
        text: "",
        value: "flag",
        id: 0,
        sortable: false,
        align: "left",
        class: "pa-0",
        description: null
      },
      {
        text: "Country",
        value: "name",
        id: 1,
        sortable: false,
        align: "left",
        class: "body-1 pa-0 hidden-sm-and-down",
        description: null
      },
      {
        text: "Remaining Population",
        value: "population",
        id: 4,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-xs-only",
        description:
          "Remaining Population: \n It represents the remaining population of a country."
      },
      {
        text: "Total Deaths",
        value: "deaths",
        id: 5,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-xs-only",
        description:
          "Deaths: \n It represents the number of Deaths of a country. The first country whose deaths is equal to its population wins "
      },
      // {
      //   text: "New Deaths",
      //   value: "new_deaths",
      //   id: 6,
      //   sortable: true,
      //   align: "left",
      //   class: "body-1 pa-0 hidden-xs-only",
      //   description:
      //     "New Deaths: \n It represents the new number of Deaths of a country."
      // },
      {
        text: "Infected",
        value: "infected",
        id: 7,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-xs-only",
        description:
          "Infected:\n It represents the number of people infected by the virus"
      },
      // {
      //   text: "New Infected",
      //   value: "new_infected",
      //   id: 8,
      //   sortable: true,
      //   align: "left",
      //   class: "body-1 pa-0 hidden-xs-only",
      //   description:
      //     "New Infected: \n It represents the new number of Infected of a country."
      // },
      {
        text: "Recovered",
        value: "recovered",
        id: 9,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-xs-only",
        description:
          "Recovered: \n It represents the number of Recovered from the virus."
      },
      {
        text: "P",
        value: "active_population",
        id: 11,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-sm-and-up",
        icon: "fa-user-friends",
        description:
          "Active Population: \n It represents the remaining population of a country."
      },
      {
        text: "D",
        value: "deaths",
        id: 12,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-sm-and-up",
        icon: "fa-skull-crossbones",
        description:
          "Deaths: \n It represents the number of Deaths of a country. The first country whose deaths is equal to its population wins "
      },
      // {
      //   text: "d",
      //   value: "new_deaths",
      //   id: 13,
      //   sortable: true,
      //   align: "left",
      //   class: "body-1 pa-0 hidden-sm-and-up",
      //   icon: "fa-plus",
      //   description:
      //     "New Deaths: \n It represents the new number of Deaths of a country."
      // },
      {
        text: "I",
        value: "infected",
        id: 14,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-sm-and-up",
        icon: "fa-dna",
        description:
          "Infected:\n It represents the number of people infected by the virus"
      },
      // {
      //   text: "i",
      //   value: "new_infected",
      //   id: 15,
      //   sortable: true,
      //   align: "left",
      //   class: "body-1 pa-0 hidden-sm-and-up",
      //   icon: "fa-plus",
      //   description:
      //     "New Infected: \n It represents the new number of Infected of a country."
      // },
      {
        text: "R",
        value: "recovered",
        id: 16,
        sortable: true,
        align: "left",
        class: "body-1 pa-0 hidden-sm-and-up",
        icon: "fa-heart",
        description:
          "Recovered: \n It represents the number of Recovered from the virus."
      }
    ],
    paginationStats: {
      sortBy: "deaths",
      descending: true
    },
    isVisible: false,
    searchStats: "",
    placeholderFlag: "/img/flags/placeholder.svg",
    snackbar: false,
    snackbarText: "",
    snackbarColor: "",
    snackbarTimeout: 6000,
    mapStatus: [],
    visButton: {
      possibilities: ["support", "next", "final"],
      count: 0,
      color: ["facebook", "primary_next_tab", "primary_final_tab"]
    }
  }),
  firebase: function() {
    return {
      mapStatus: db.ref("public/countriesMap").orderByChild("deaths"),
      data: db.ref("public/data")
    };
  },
  filters:{
    NUMBER(n){
      return format(n);
    },
    NUMBER_WITH_PLUS(n){
      return '(+ ' + format(n) + ')';
    }
  },
  methods: {
    // err(e) {

    //   // console.log(this.$refs.img.src);
    //   // console.log("HEY, you got: ", e);
    // },
    changeSort(column) {
      if (this.paginationStats.sortBy === column) {
        this.paginationStats.descending = !this.paginationStats.descending;
      } else {
        this.paginationStats.sortBy = column;
        this.paginationStats.descending = false;
      }
    },
    toggleButton() {
      if (this.visButton.count >= 2) {
        this.visButton.count = 0;
        return;
      }
      this.visButton.count = this.visButton.count + 1;
    },
    // goToBet(path, country) {
    //   this.$store.commit("setSelectedCountry", country);
    //   this.$router.push(path);
    // },
    openModal(country) {
      this.$store.commit("setSelectedCountry", country);
      this.isVisible = true;
    },
    copyToClipBoard(value, ref) {
      const input = this.$refs[ref];
      input.focus();
      document.execCommand("selectAll");
      this.copied = document.execCommand("copy");
      this.snackbar = true;
    }
    // shareOnFb: async function() {
    //   if (!this.$store.state.isMobile) {
    //     window.open("https://www.facebook.com/TronWarBot/", "_blank");
    //   } else {
    //     let app_id = 1165517713645322;
    //     let display = "popup";
    //     let link = this.$store.state.redirect_uri;
    //     let redirect_uri = this.$store.state.redirect_uri;
    //     let to = 423138885180430;
    //     window.open(
    //       `https://www.facebook.com/dialog/feed?app_id=${app_id}&display=${display}&link=${link}&redirect_uri=${redirect_uri}&to=${to}`,
    //       "_self"
    //     );
    //   }
    // }
  },
  computed: {
    countryStatus: function() {
      return this.mapStatus.map(country => {
        country.name = this.universalMap(country[".key"]);
        return country;
      }).filter(c => c.population > 1);
    },
    chosePhrase() {
      let random = Math.floor(Math.random() * this.phrases.length);
      return this.phrases[random].replace(
        "<placeholder>",
        this.universalMap(this.$store.state.selectedCountry)
      );
    }
  },
  mounted() {
    db.ref("public/countriesMap")
      .orderByChild("deaths")
      .once("value", () => {
        this.$root.$emit("loaded", true);
      });
    window.addEventListener("resize", () => {
      this.windowSize.x = window.innerWidth;
      this.windowSize.y = window.innerHeight;
    });
  }
};
</script>

<style>
.very-small-button {
  font-size: 10px;
}
</style>
