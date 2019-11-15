<template>
  <v-layout row justify-center>
    <v-dialog v-model="isVisible" max-width="750" min-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

        <!--/////////////////////////////////////////// Login //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'Login With Tronlink'">
          <div v-if="this.$store.state.loggedInAccount!=null">
            Already logged in with account address: {{this.$store.state.loggedInAccount}}
            <br />
            <br />
            {{footerTile}}
          </div>
          <div v-else>
            Please, login to your Tron wallet.
            <br />If you do not have a Tron wallet installed, please visit
            <a target="blank" href="https://www.tronlink.org/">TronLink</a> and download the Chrome extension.
            <br />
            <br />
            <v-alert :value="true" type="warning">Tron War Bot guarantees full proper functioning only with Google Chrome and
              TronLink/TronWallet mobile app.
            </v-alert>
          </div>
        </v-card-text>

        <!--/////////////////////////////////////////// Referral //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'Referral'">
          Refer a friend by sharing your referral link with him.
          <br />Here is your referral link:
          <v-chip v-if="this.$store.state.loggedInAccount != null" label outline color="primary">
            https://tronwarbot.com/ref={{this.$store.state.loggedInAccount}}
          </v-chip>
          <v-chip v-else label outline color="red">Login First</v-chip>
          <br />
          <br />You'll earn
          <b>{{percentage}} % </b> out of each of his bets
          <b>forever</b>!
          <br />
          <br />Once an address starts using a referral link, that can't change and it will always provide you
          that
          {{percentage}} %
          <br />Every 50TRX piled up you will automatically receive the earned TRX. Below you can see how much
          your
          referred links are earning you
          <v-container grid-list-md style="padding: 0px;" mt-2>
            <v-layout row>
              <v-flex xs12 style="text-align: center">
                <v-card color="primary" dark>
                  <v-card-text class="title">Your Referrals</v-card-text>
                </v-card>
              </v-flex>
            </v-layout>

            <v-container v-if="this.$store.state.loggedInAccount == null" class="text-md-center">
              <v-chip label outline color="red">Login First</v-chip>
            </v-container>

            <v-container v-else-if="myReferrals.length > 0">
              <v-layout row wrap style="padding: 16px 16px 0 16px;">
                <v-flex xs6 class="title">Address</v-flex>
                <v-flex xs6 class="title" style="text-align: end;">Amount</v-flex>
              </v-layout>

              <v-divider></v-divider>
              <v-container style="max-height: 200px; overflow-y: auto; overflow-x: hidden;">
                <v-layout row wrap v-for="referral in myReferrals" :key="referral.user_addr">
                  <v-flex xs6 class="subheading">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <div class="text-truncate" v-on="on">{{referral.user_addr}}</div>
                      </template>
                      <span>{{referral.user_addr}}</span>
                    </v-tooltip>
                  </v-flex>
                  <v-flex xs6 class="subheading" style="text-align: end">
                    {{referral.amount.toFixed(3)}} TRX
                  </v-flex>
                </v-layout>
              </v-container>
            </v-container>

            <v-container v-else class="text-md-center">
              <v-chip label outline color="red">Still no one played with your link... :(</v-chip>
            </v-container> -->
          </v-container>
        </v-card-text>

        <!--/////////////////////////////////////////// WAR //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'WAR Supply'">
          We want to build this game together with our users, and that's why 100% of TronWarBot profits are
          shared back
          to token holders! (..but yes we detain around 50% of the current
          token supply). After every stage you will need 50 more TRX to mine one WAR. WAR will be used in the
          future runs.
          <br />
          <v-divider mt-3 />
          <br />
          <span class="headling">We are in stage 1 of 100. You need to play 500 TRX to mine 1 WAR</span>
          <v-progress-linear color="primary" height="30" v-model="dividendStage"></v-progress-linear>
          <v-divider mt-8 />
          <br />
          <v-layout row wrap>
            <v-flex xs12 sm5>
              <v-text-field v-if="account == null" :value="'Login First'" background-color="red" label="You have mined"
                outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png" />
                  </v-avatar>
                </template>
              </v-text-field>

              <v-text-field v-else :value="myWAR | WAR" label="You have mined" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png" />
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>
            <!-- <v-flex xs12 sm5>
                            <v-text-field :value="availableTRX | TRX" label=" Estimate Available Dividends" outline
                                          readonly>
                                <template v-slot:append>
                                    <v-avatar class="pb-2" tile size="40">
                                        <img src="https://cdn.coinranking.com/behejNqQs/trx.svg"/>
                                    </v-avatar>
                                </template>
                            </v-text-field>
                        </v-flex> -->

            <v-spacer />

            <v-flex xs12 sm5>
              <v-text-field :value="totalWARSupply | WAR" label="Total WAR mined" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png" />
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>
          </v-layout>

          <v-divider />

          <!-- <v-card mt-3>
                        <v-card-text style="text-align:center;">
                            At the end of the run you will be eligible to get your share of dividends by clicking the
                            button "Claim
                            your dividends".
                            <br/>Currently, for every
                            <b>100 WAR you get
                                {{availableTRX.div(totalWARSupply.div("1000000000000000000")).times('100') | TRX}}</b>
                        </v-card-text>
                        <v-chip v-if="account != null" label outline color="primary" style="margin-left:4.5em;">
                            With your current WARs you will receive:
                            {{availableTRX.times(myWAR.div(totalWARSupply).toString()) | TRX }}
                        </v-chip>
                    </v-card> -->

          <!-- There is a total of 104 WAR eligible for dividen sharing. Every 10 WAR you'll get 100 TRX at dividend payout
                    (end of the run)-->
        </v-card-text>

        <!--/////////////////////////////////////////// How To Play //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'How To Play'">
          Inspired by a popular Facebook page, named WorldWarBot2020, the game is a world war simulation
          driven by a bot where users engagement affects the outcome of the war.
          <br />
          Each turn (5 minutes), the bot picks a country (in a provably fair manner)
          and make it attack a foreign territory.
          The probability of being chosen and the success of the attack
          depends on the number of conquered territories and on the cohesion index of that country (check FAQ for details).
          The cohesion index is the most important factor in the game as it is entirely controlled by users through
          their engagement on social media platforms (different rules apply on each platform).
          <br />
          <i>The game ends when the entire map has been conquered by a single country.</i>
          <br />
          An average World War simulation usually lasts about 40 days,
          however no precise estimate can be given upfront as the war is in large part
          controlled by users and their resiliency.

          <br />
          <br>
          <b>What do I need to play?</b>
          <br>There exists different game modes:
          - Entertainment
          - Social gaming
          - Betting
          - Value gaming
          <br>In order to play, you must own TRX, the underlying cryptocurrency of TRON’s network. Make sure
          you have a Tron Wallet.
          For more information on how to create one, <a target="_blank"
            href="https://chrome.google.com/webstore/detail/tronlink%EF%BC%88%E6%B3%A2%E5%AE%9D%E9%92%B1%E5%8C%85%EF%BC%89/ibnejdfjmmkpcnlpebklmnkoeoihofec">
            click here </a>
          <br>To play on mobile devices, please use <a target="_blank" href="https://www.tronwallet.me/">TronWallet</a>.

          <br>
          <br>

          <b>How to get TRX</b>
          <br>Are you running out of your skin to start gaming?
          <br />Jump into the crypto world now!
          <br />
          <br />
          <v-btn round color="primary" href="https://changelly.com/" target="_blank" dark pa-2>BUY TRX</v-btn>
          <br />
          <br />Once you start playing, your TRX are safe because you don’t move them on our website. They
          remain in your secure wallet and moved out whenever you place a bet. So no need to trust us or
          anyone, you
          control your crypto assets. That's one of the nice things about using the blockchain.
        </v-card-text>

        <!--/////////////////////////////////////////// FAQ //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'FAQ'">
          <v-expansion-panel>
            <!--Fairness-->
            <v-expansion-panel-content>
              <template v-slot:header>
                <div>How are we PROVABLY FAIR?</div>
              </template>
              <v-card>
                <v-card-text>
                  We are crystal clear. We care about making things right. Here is how we provide the
                  details to check that we are <a href="https://en.wikipedia.org/wiki/Provably_fair"
                    targte="_blank">provably fair</a>.
                  <br /><br />
                  At the very beginning of a turn the Bot decides which country will conquer next.
                  1. The bot will reveal the current map state (a.k.a. countriesMap) at the beginning of each turn that also takes into account of the cohesion values.
                  2. The bot will generate a magic number which will be used as the first seed for the next turn and reveal its hash (a.k.a. Magic Hash) using sha256 algorithm.
                  3. The bot will reveal the future block number of TRON blockchain whose blockhash will be used as the second source of entropy for the next turn.
                  Once the TRON block approaches the timer runs out, the magic number will be revealed and the battle will take place.
                  Both the battle result and the next conqueror will be revealed.
                  Now you will be able to find all the revealed data under the Previous Turn section.
                  <br /><br />
                  At this point you can verify that data did not change and you can test this data against our <a href="https://jsfiddle.net/tronwarbot/d82915un/" target="_blank">open source war engine</a>
                  to verify that the declared battle result and next conqueror area effectively the result of:
                  - The previous turn's map state
                  - The revealed Magic Number
                  - The declared Block Hash
                  <br />
                  <br />
                  <v-divider mt-3 />
                  <br />
                  <span class="title">Previous Turn: {{data.turn - 1}} </span>
                  <br />
                  <v-container fluid grid-list-sm>
                    <v-flex sm 16>
                      <v-text-field ref='previousCountriesMap' append-icon="content_copy"
                        @click:append="copyToClipBoard(fairness.previous.mapState, 'previousMapState')"
                        :value="fairness.previous.mapState" label="Countries Map" outline readonly>
                      </v-text-field>
                    </v-flex>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='previousMagicNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.magic, 'previousMagic')"
                          :value="fairness.previous.magic" label="Magic Number" outline readonly>
                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='previousMagicHash' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.magicHash, 'previousMagicHash')"
                          :value="fairness.previous.magicHash" label="Magic Hash" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='previousBlockHash' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previousBlockHash, 'previousBlockHash')"
                          :value="fairness.previous.blockHash" label="Block Hash" outline readonly>
                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='previousNextBlockNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.nextTurnBlock, 'nextTurnBlock')"
                          :value="fairness.previous.nextTurnBlock" label="Block Number" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='betNext' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.next, 'previousBetNext')" :value="fairness.previous.next" label="Bet Next"
                          outline readonly>
                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='previousNextBlockNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.battle, 'previousBattle')" :value="fairness.previous.battle" label="Bet Battle"
                          outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-divider />
                  <br />
                  <span class="title">Next Turn: {{data.turn}} </span>
                  <br />

                  <v-container fluid grid-list-sm>
                    <v-flex sm 16>
                      <v-text-field ref='nextCountriesMap' append-icon="content_copy"
                        @click:append="copyToClipBoard(fairness.next.mapState, 'nextMapState')"
                        :value="fairness.next.mapState" label="Countries Map" outline readonly>
                      </v-text-field>
                    </v-flex>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='nextMagicNumber' value="*Hidden*" label="Magic Number" outline readonly>
                          <v-tooltip slot="append" bottom>
                            <v-icon slot="activator" color="primary" dark>info</v-icon>
                            <span>This will be revealed when current turn is ended</span>
                          </v-tooltip>

                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='nextMagicHash' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.next.magicHash, 'nextMagicHash')"
                          :value="fairness.next.magicHash" label="Magic Hash" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='nextBlockHash' append-icon="info" value="*Hidden*" label="Block Hash" outline
                          readonly>
                          <v-tooltip slot="append" bottom>
                            <v-icon slot="activator" color="primary" dark>info</v-icon>
                            <span>This will be revealed when current turn is ended</span>
                          </v-tooltip>
                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='nextNextBlockNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.next.nextTurnBlock, 'nextTurnBlock')"
                          :value="fairness.next.nextTurnBlock" label="Block Number" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-card sm12>
                    <v-card-title text-xs-centered>
                      If you want to check the correctness of the TronWarBot, we suggest you to copy the data in the 'Next Turn' section and verify they are consistent with the 'Previous Turn' section as the turn changes.
                      After that use the <i>Countries Map</i>, <i>Magic Number</i> and the <i>Block Hash</i> in our War Engine.
                      And if you are brave enough, we even challenge you to hack it to get better chances at winning the jackpot!
                    </v-card-title>
                    <v-layout justify-center>
                      <v-card-actions>
                        <v-chip label outline color="primary">
                          <a href="https://jsfiddle.net/tronwarbot/d82915un/" target="_blank">Check out our War Engine</a>
                        </v-chip>
                      </v-card-actions>
                    </v-layout>

                  </v-card>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content v-for="question in faq" :key="question.question">
              <template v-slot:header>
                <div>{{question.question}}</div>
              </template>
              <v-card>
                <v-card-text v-html="question.answer"></v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>

        <!--/////////////////////////////////////////// Partners //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'Partners'">
          <v-container fluid grid-list-xl>
            <v-layout wrap>
              <v-flex v-for="partner in partners" :key="partner.name" sm6>
                <v-card>
                  <v-img :src="'/img/partners/'+partner.img" class="image" :alt="partner.name" height="150px" contain>
                  </v-img>
                  <v-card-title primary-title>
                    <div>
                      <a class="title text-truncate" :href="partner.link" target="_blank"
                        style="text-decoration: none;">{{partner.name}}</a>
                    </div>
                  </v-card-title>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <!--/////////////////////////////////////////// Ambassador //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === '🎖 Become an Ambassador 🎖'">
          <div class="title" v-if="fbUserName != null">
            Hi <b>{{this.fbUserName}}</b>
          </div>
          <br v-if="fbUserName != null">
          <div class="mb-2">
            <h4 class=" text-xs-center">
              <i>Have you ever dreamt of becoming the leader of your home country and guide it to conquer the world?</i>
              <br /> <b >Now you can!</b>
            </h4>
            <br />
            <br />
            If you succeed and your country wins the war, you will <b>win 10K TRX</b> and <b>20 WAR</b>.
            All you have to do is register through the steps below, and support your country in winning the game.
            <br />
            <br />
            <b>How?</b>
            Motivate your cadets to engage through social media so that your country gain cohesion points and increase the odds of winning the war.
          </div>
          <v-stepper v-model="ambStep" vertical>
            <!-- <v-stepper-step :complete="ambStep > 1" step="1">
              Login with a wallet
            </v-stepper-step>

            <v-stepper-content step="1">
              <div>
                Please, login to your TRONLink wallet.
                <br />If you do not have it installed, please download it from
                <a target="blank" href="https://www.tronlink.org/">TronLink</a> or get the <a target="blank" href="http://u6.gg/gmc5D">Chrome extension</a> or make sure to have any alternative proper Tron wallet unlocked.
                <br />
                <br />
                <v-alert :value="true" type="warning">Tron War Bot can only be used with an active Tron wallet at the moment.
                </v-alert>
              </div>
            </v-stepper-content> -->

            <v-stepper-step :complete="ambStep > 1" step="1">Login to Facebook</v-stepper-step>

            <v-stepper-content step="1">

              <v-btn color="facebook" class="white--text" @click="loginToFb">Login with Facebook</v-btn>
            </v-stepper-content>

            <v-stepper-step :complete="ambStep > 2" step="2">Pick a country</v-stepper-step>

            <v-stepper-content step="2">
              <div class="my-2">
                Select the country you want to support. If you can't find it below it means it already has an outstanding ambassador.
                You can find out who the person is in the Standings tab, hovering on the 🎖 symbol.
              </div>
              <v-autocomplete outline v-model="currentCountry" :items="computedMapping" item-text="name"
                item-value="numberId" hide-no-data hide-selected label="Select Country"
                placeholder="Type in to select a country">
              </v-autocomplete>
              <v-checkbox
                color="primary"
                class="ml-2"
                v-model="terms"
                :label="'By checking this box you accept to publicly disclose your social media identity and profile on TronWarBot website and all of its related social media channels'" >
              </v-checkbox>
              <v-btn color="primary" :disabled="(!terms) || (currentCountry == null)" @click="becomeAnAmbassador">Become an ambassador</v-btn>
            </v-stepper-content>

            <v-stepper-step :complete="ambStep > 3" step="3">Wait for your approval</v-stepper-step>

            <v-stepper-content step="3">
              <div> <b>Your request has been sent successfully!</b>
                <br />
                For security reasons, our team will review your request and approve it within 12 hours.
                You will be notified about the approval of your request on our <b><a target="_blank" href="https://t.me/Tron_WarBot">telegram channel here!</a></b> </div>
            </v-stepper-content>

          </v-stepper>
        </v-card-text>

        <!--/////////////////////////////////////////// News //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="headerTile === 'News'">
          <v-carousel v-if="news.length !== 0">
            <v-carousel-item v-for="(n,i) in news" :key="i" :src="n.src">
            </v-carousel-item>
          </v-carousel>
          <v-text-field v-else value="There're no recent news" outline readonly></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-if="headerTile === 'Dividends'" color="blue darken-1" flat="flat" v-on="on">Claim
                your Dividends
              </v-btn>
            </template>
            <span>It will be available when the run is finished</span>
          </v-tooltip>
          <v-btn color="success" @click.stop="isVisible = false">Close</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="this.snackbarColor" :timeout="this.snackbarTimeout" vertical bottom>
      <span v-if="htmlText" class="title" v-html="this.snackbarText"> </span>
      <span v-else class="title"> {{this.snackbarText}} </span>
      <v-btn dark flat @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
  import {
    db
  } from "../plugins/firebase";
  import tronweb from 'tronweb'
  import mapping from '../assets/mapping'
  import axios from 'axios'
  import {
    pollMyWar
  } from '../utils/pollForUpdate'

  export default {
    name: "Modal",
    props: {
      value: Boolean,
      headerTile: String,
      footerTile: String,
      bodyTile: String
    },

    filters: {
      TRX: (amount) => {
        return tronweb.fromSun(amount).toFixed(3) + ' TRX'
      },
      WAR: (amount) => {
        return amount != 0 ? amount.div("1000000000000000000").toFixed(3) + ' WAR' : 0 + ' WAR'
      }
    },

    watch: {
      isVisible: function () {
        if (this.isVisible && this.headerTile == "WAR Supply") {
          this.$store.commit("setPollWar", false)
          pollMyWar(1000)
        } else {
          this.$store.commit("setPollWar", true)
        }
        if (this.isVisible && this.headerTile == "FAQ") {
          this.$rtdbBind('fairness', db.ref('public/fairness'))
        }
      }
    },

    computed: {
      ambStep: {
        get() {
          if (this.allDone) return 3;
          if (this.$store.state.fbAcessToken != null /*&& this.$store.state.loggedInAccount != null*/) return 2;
          // if (this.$store.state.loggedInAccount != null) return 1;
          return 1;
        },
        set() {

        }
      },
      computedMapping() {
        return this.mapping.filter((el, index) => {
          return !this.mapStatus[index].hasOwnProperty('ambassador')
        })
      },
      percentage: function () {
        if (this.referrals.percentages[this.$store.state.loggedInAccount]) {
          return this.referrals.percentages[this.$store.state.loggedInAccount] * 100
        }
        return this.referrals.percentages.default * 100
      },
      isVisible: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit("input", value);
        }
      },
      myReferrals: function () {
        let keys = Object.keys(this.referrals.map);
        let myReferrals = [];
        for (var i = keys.length - 1; i >= 0; i--) {
          if (
            this.account != null &&
            this.referrals.map[keys[i]].referrer_addr === this.account
          ) {
            myReferrals.push({
              user_addr: keys[i],
              amount: this.referrals.map[keys[i]].amount
            });
          }
        }
        return myReferrals;
      },
      account() {
        return this.$store.state.loggedInAccount;
      },
      // availableTRX() {
      //     // BetFinal Jackpot + max((BetNext - deposit),0)
      //     const BetFinal = tronweb.BigNumber(tronweb.toSun(this.data.jackpot * this.$store.state.gameParams.finalBetParams.houseEdge))
      //     const BetNext = this.$store.state.availableDividends
      //     const deposit = tronweb.toSun(this.data.deposit)
      //     return BetFinal.plus(tronweb.BigNumber.maximum(BetNext.minus(deposit), tronweb.BigNumber('0')));
      // },
      myWAR() {
        return this.$store.state.currentAddressWarBalance;
      },
      totalWARSupply() {
        return this.$store.state.totalWARSupply;
      },
      dividendStage() {
        return this.totalWARSupply != 0 ? parseInt(this.totalWARSupply.div("1000000000000000000").mod(1000000)
          .div(100).toString()) : 0
      },
      currentCountry: {
        get() {
          return this.$store.state.selectedCountry
        },
        set(value) {
          this.$store.commit('setSelectedCountry', value)
        }
      },
      fbUserName() {
        return this.$store.state.fbUserName
      }
    },
    firebase: {
      referrals: db.ref("public/referral"),
      data: db.ref("public/data"),
      mapStatus: db.ref("public/countriesMap"),
    },
    methods: {
      copyToClipBoard(value, ref) {
        const input = this.$refs[ref];
        input.focus();
        document.execCommand('selectAll');
        this.copied = document.execCommand('copy');
        this.snackbarText = 'Copied to Clipboard'
        this.snackbarColor = "info";
        this.snackbarTimeout = 3000;
        this.snackbar = true
      },
      async becomeAnAmbassador() {
        if(this.$store.state.fbAcessToken == null){
          this.snackbarText = "Login to facebook First";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
          return
        }
        // if (this.$store.state.loggedInAccount == null) {
        //   this.snackbarText = "Login to your wallet first";
        //   this.snackbarColor = "error";
        //   this.snackbar = true;
        //   this.isWaitingForConfirm = false
        //   return
        // }
        if (this.currentCountry == null) {
          this.snackbarText = "Select a country first";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
          return
        }
        try {
          let msg = {
              access_token: this.$store.state.fbAcessToken,
              country: this.currentCountry,
              address: 'TPisPeMpZALp41Urg6un6S4kJJSZdtw6Kw',
              name: this.$store.state.fbUserName,
              id: this.$store.state.fbId
            }
          await axios.post(`https://api.tronwarbot.com/ambassador`,msg )
          this.allDone=true
        } catch (e) {
          console.log(e)
          console.log(e.response)
          try {
            this.htmlText = true
            this.snackbarText = e.response.data
            this.snackbarColor = "error";
            this.snackbarTimeout = 10000;
            this.snackbar = true;
          } catch (err) {
            console.log(err)
            this.snackbarText =
              "Connection error. Ambassador not registered"
            this.snackbarColor = "error";
            this.snackbarTimeout = 10000;
            this.snackbar = true;
          }
        }
      }
    },
    data: () => ({
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      mapping: mapping,
      mapStatus: [],
      fairness:{},
      terms: false,
      allDone: false,
      htmlText: false,
      faq: [{
          question: "What even is TronWarBot?",
          answer: "A DApp (Decentralized Application, having part of its backend on the blockchain) based on the TRON blockchain created by a bunch of fans of the popular <a target=\"_blank\" href='https://www.facebook.com/worldwarbot/'>WorldWarBot2020 game on Facebook</a>.\n" +
            "<br><br>Basically we have a bot which decides one country every to conquer another country. It goes on like that until one country takes the whole world. It’s super addictive to keep an eye on the updates, we tried it on our own skin!!\n" +
            "You can also place bets on different events! We bet using cryptocurrencies, TRX. Please read further if you wanna know more."
        },
        {
          question: "Bets? How?",
          answer: "Glad you asked! We currently support three types of bets.\n" +
            "<br><b>BetFinal</b>: you can bet on the final winner. It’s you vs the others.\n" +
            "<br><b>BetNext</b>: you can bet on which country will attempt to make a conquer in the following turn. It’s you against us!\n" +
            "<br><b>BetBattle</b>: looks like a football bet. Will the war outcome be 1 X or 2?\n" +
            "You need a Tron wallet filled in with some TRX in order to bet.\n" +
            "To know more read further.\n"
        },
        {
          question: "How does BetFinal work?",
          answer: "You can try to forecast the winner of the whole run, the country which will conquer the whole world.<br> 80% of the Final Jackpot is split among those who believed in that country and placed a bet on it, the remaining 20% goes into the Dividend Pool. The betting amount varies each turn depending on the probability a country has to win, so first movers have a huge advantage! We start with a fixed 20TRX at the beginning, then it keeps increasing as the run goes on! Please refer to the FAQ in you wanna have more details.\n"
        },
        {
          question: "How does BetNext work?",
          answer: "You can bet that a state will attempt to conquer another country during the next turn. You choose how much to bet and your reward will be according to the probability of that country to be the actual conqueror next.\n" +
            "<br><b>Example</b>: I think Japan will conquer another country in the next turn (doesn’t matter which one, you only care about the conqueror) so I choose Japan in the box “select country”, I choose how much to bet, then I place the bet.<br> Let’s say you bet 100TRX and the percentage of Japan to conquer next was 50%, if you win you’ll take away 190TRX! What about those missing 10TRX for a fair payout? Well, we put that in the Dividends Pool and at the end of the run they will be shared back to token holders!\n"
        },
        {
          question: "How does BetBattle work?",
          answer: "We know which battle is ongoing. You can either bet on: <br>- The attacker wins (1)<br>- We have a draw (X)<br>-The defender wins (2)<br>You choose how much to bet and your reward will be according to the probability of that event to happen."
        },
        {
          question: "How does the Bot work?",
          answer: "It uses a probability density function (PDF) to determine next conqueror state.\n" +
            "PDF for a country is based on number of the conquered territories and its cohesion index.\nTo put it simply the formula looks similar to this:\n\n" +
            "<br><br><code>PDF = (NUMBER OF TERRITORIES CONQUERED ON THE BORDER) * (COHESION INDEX + PROBABILITY OF INSURRECTION BY THE FOREIGN STATE)</code>\n" +
            "<br>However, if you wanna check the full algorithm we'd like to invite you to have a look at our <a href=\"https://jsfiddle.net/tronwarbot/d82915un/\" target=\"_blank\">open source war engine<\a>.\n\nCan you do something about it? Yes! Read more onto 'Modify the outcome of the War'"
        },
        {
          question: "What is the cohesion index?",
          answer: "It indicates the welfare and the feeling good together of the people. It runs from 0, which means anarchy, to 1, which means patriotic state, with people which want to defend their identity.\n"
        },
        {
          question: "When the cohesion index is updated?",
          answer: "It is updated mainly through social media engagement!" +
            "In addition to that there is also a cohesion update as a result of the battle: when the result is 1 the attacking country loses 0.1% of cohesion, when it is 2 the defending country gains 0.2% of cohesion.\n" +
            "<br>Starting from TWB2.0 there is also another way cohesion can be modified, and that is by YOUR actions!"
        },
        {
          question: "How long is a World War?\n",
          answer: "It has not a fixed deadline, it depends on the development of the war itself. On average it takes 40 days having one turn every 5 minutes.\n"
        },
        {
          question: "What do I do if I'm not able to place the bet?",
          answer: "Check if you have got enough Energy and Bandwidth. If you have no issue with your wallet you might be sending inconsistent transaction. Make sure you always generate transactions from our official website and make sure to have a good connection to use latest quotes available."
        },
        {
          question: "What are Energy and Bandwidth?",
          answer: `<b>Bandwidth:</b> For each byte array, the network consumes an equal amount of bandwidth
                            points depending on the length of the array. So, if you are transmitting a transaction with
                            a byte array length of 200, you need to have 200 Bandwidth points. This prevents malicious
                            spam transactions from clogging the network and causing delayed transaction confirmations.
                            Tron network provides 5000 free Bandwidth points for every account every 24 hours. This
                            allows you to perform approximately 25 free transactions. A transaction on the Tron
                            blockchain costs approximately 200 bandwidth points.<br><br><br>
                            <b>Energy:</b> The Tron Protocol is a platform for Dapps using smart contracts. Each smart
                            contract that is executed will consume CPU resources. It also takes time for each smart
                            contract to execute. This time has been classified as Energy, where 1 unit of energy equals
                            1 microsecond of computing time. If you run a complex smart contract that takes more time
                            to execute, more energy will be needed. To gain energy, you essentially freeze your TRX and
                            select Energy instead of Bandwidth. If you are not going to be executing smart contracts,
                            there is no reason why you should select Energy. Those who are just TRX investors or users
                            should always select Bandwidth and not Energy when freezing their tokens.`
        },
        {
          question: "Couldn't find your answer?",
          answer: "Please reach us out on our offical <a href=\"https://t.me/Tron_WarBot\" target=\"_blank\">telegram group </a>! We would be very happy to answer your questions :)"
        },
        {
          question: "Is there a whitepaper?",
          answer: "<a href=\"/files/WhitePaper.pdf\" target=\"_blank\">Click here to view the whitepaper<a/>"
        }
      ],
      partners: [{
          name: 'CHIPS Token',
          link: 'https://chipstoken.io/',
          img: 'chips.png'
        },
        {
          name: 'Tron Game Center',
          link: 'https://trongamecenter.org/',
          img: 'tgc.png'
        },
        {
          name: 'ECONEUARK',
          link: 'http://www.ecoearthcoin.com',
          img: 'econeuark.png'
        },
        {
          name: 'Cryptopress Casa',
          link: 'http://www.cryptopress.casa/',
          img: 'crypropress_casa.jpg'
        }
        /*
        {
            name: 'BingTron',
            link: '',
            img: 'bingtron.jpg'
        }*/
      ],
      news: [{
          src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg'
        },
        {
          src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg'
        },
        {
          src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg'
        },
        {
          src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg'
        }
      ]
    })
  };
</script>
