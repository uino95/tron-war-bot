<template>
  <v-layout row justify-center>
    <v-dialog v-model="isVisible" max-width="750" min-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

        <!--/////////////////////////////////////////// Wallet Login //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'walletLogin'">
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
            <v-alert :value="true" type="warning">Tron War Bot guarantees full proper functioning only with Google
              Chrome and TronLink/TronWallet mobile app.
            </v-alert>
          </div>
        </v-card-text>

        <!--/////////////////////////////////////////// Referral //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'referral'">
          Refer a friend by sharing your referral link with him.
          <br />Here is your referral link:
          <v-text-field v-if="account != null" ref='referralLink' append-icon="content_copy"
            @click:append="copyToClipBoard(`https://tronwarbot.com/ref=${account}`, 'referralLink')"
            :value="`https://tronwarbot.com/ref=${account}`" label="Referral Link" outline
            readonly class="mb-0">
          </v-text-field>
          <v-chip v-else label outline color="red">Login First</v-chip>
          <v-spacer/>
          You'll earn
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

            <v-container v-else class="pt-2 pl-0 pb-2 pr-0 ma-0 justify-start">
              <v-chip label outline color="red">Still no one played with your link... :(</v-chip>
            </v-container>
          </v-container>
        </v-card-text>

        <!--/////////////////////////////////////////// Dividends //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'dividends'">
          <h4 class="text-xs-center">We don't simply want to build a game, but an ecosystem of passionate players and stakeholders,
          <br/>and that's why <u>we share our profits!</u></h4>
          <br/>
          Profits are shared among WAR token holders at the end of each war and
          distributed proportionally to the amount of tokens hold by each user
          within a snapshot taken at the end of the war.
          <br/>
          <br/>
          Check your estimate share using the following data:
          <br/>
          <v-layout row wrap justify-center mt-2>
            <v-flex xs12 sm5>
              <v-text-field :value="availableTRX | TRX" label=" Total Available Dividends" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="https://cdn.coinranking.com/behejNqQs/trx.svg" />
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>

            <v-spacer />

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
          </v-layout>

          <v-layout row wrap justify-center>
            <v-flex xs12 sm5>
              <v-text-field :value="totalWARSupply | WAR" label="Total WAR supply" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png" />
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>
          </v-layout>
          <v-layout align-center column >
            <div v-if="account != null" class="text-xs-center">
              <i>At present, with your current WAR balance you would be entitled to
              <b>{{availableTRX.times(myWAR.div(totalWARSupply).toString()) | TRX }}</b> of dividends </i>
            </div>
          </v-layout>
          <br/>
          <v-expansion-panel >
            <v-expansion-panel-content>
              <template v-slot:header>
                <b>What is the WAR token and how is it mined?</b>
              </template>
              <v-card>
                <v-card-text>
                  The WAR is our purposefully crafted <b>TRC20</b> token.
                  <br/>
                  <br/>
                  It is entirely mined by the players through any type of bets they put on TronWarBot platform.
                  The mining rate starts at <b>1 WAR</b> mined for every <b>500 TRX</b> played on bets and it
                  will gradually decrease over time, passing through several stages.
                  After every stage you will need 50 TRX more to play on bet to mine 1 WAR.
                  <br />
                  <br />
                  <span class="headling">We are in stage <b>1</b> of <b>100</b>. You need to play 500 TRX to mine 1 WAR</span>
                  <v-progress-linear color="primary" height="30" v-model="dividendStage"></v-progress-linear>
                  <br />
                  <i>At the moment the WAR is only used to claim TronWarBot's dividends,
                  but very soon the WAR will be integrated in our amazing game.</i>
                  <br/>
                  <b>Stay tuned to find out the details!</b>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- There is a total of 104 WAR eligible for dividen sharing. Every 10 WAR you'll get 100 TRX at dividend payout
                    (end of the run)-->
        </v-card-text>

        <!--/////////////////////////////////////////// How To Play //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'howToPlay'">
          <h4 class="text-xs-center">
            Inspired by a popular Facebook page, the game is a world war simulation<br/>
            driven by a bot, in a provably fair manner, where users engagement affects the outcome of the war.
          </h4>
          <br/>
          Each turn, the bot select a country to attack a foreign territory and the battle might result
          in a win <b>1</b>, loss <b>2</b> or a peaceful resolution <b>X</b>, with a probability
          which depends on the number of conquered territories and on the cohesion index of that country.
          <small><i>(Check 'Probabilities' section in FAQ)</i></small>
          <br/>
          The cohesion index is a very important factor in the game as it heavily affects war probabilities and it is almost
          entirely controlled by users through their engagement on social media platforms.
          <small><i>(Check 'Social media rules' section in FAQ)</i></small>
          <br/>
          <br/>
          <h4 class="text-xs-center">
            <b>The game ends when the entire map has been conquered by a single country.</b>
          </h4>
          <br/>
          An average World War simulation usually lasts about 40 days,
          however no precise estimate can be given upfront as the war is in large part
          controlled by users and their resiliency.

          <br/>
          <br/>
          <br/>
          <h3>How can I play?</h3>
          Well... there exist different gaming modes:
          <br/>
          <br/>
          <v-expansion-panel>
            <v-expansion-panel-content>
              <template v-slot:header>
                <b>Entertainment</b>
              </template>
              <v-card>
                <v-card-text>
                  <b>As simple as that!</b>
                  <br/>
                  TronWarBot is in first place a show and entertainment website.
                  Check out our social media pages and groups on
                  <a href="https://t.me/Tron_WarBot" target="_blank">Telegram</a>,
                  <a href="https://www.facebook.com/TronWarBot/" target="_blank">Facebook</a>,
                  <a href="https://twitter.com/TronWarBot_" target="_blank">Twitter</a>
                  and <a href="https://www.instagram.com/tronwarbot/" target="_blank">Instagram</a>
                  to be always up-to-date with the war status as well as with our brilliant fun facts and memes.
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <template v-slot:header>
                <b>Social gaming</b>
              </template>
              <v-card>
                <v-card-text>
                  <b>From TronWarBot 2.0 you can finally be active part in the war!</b>
                  <br/>
                  All you need to do is support your favorite country (or discourage your most hated one)
                  by interacting through our pages or groups on our supported social media platforms,
                  <a href="https://t.me/Tron_WarBot" target="_blank">Telegram</a>,
                  <a href="https://www.facebook.com/TronWarBot/" target="_blank">Facebook</a>,
                  <a href="https://twitter.com/TronWarBot_" target="_blank">Twitter</a>
                  and <a href="https://www.instagram.com/tronwarbot/" target="_blank">Instagram</a>.
                  And you might even <b><a href="/ambassador">become a country's ambassador</a></b>!
                  <br/>
                  <br/>
                  We use a sentiment analysis engine which evaluates the mood positive/negative of messages and we attribute
                  a cohesion reward (or penalty) to the mentioned country.
                  However on every social media different rules apply.
                  <br/>
                  <br/>
                  <i>Check them out in the 'Social Media Rules' section in FAQ.</i>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <template v-slot:header>
                <b>Betting</b>
              </template>
              <v-card>
                <v-card-text>
                  <b>Yes! And you can bet on who will conquer the world!</b>
                  <br>
                  <i>We support cryptocurrencies as they allow us to run this game in a fully provably fair manner while
                  preserving the users' anonimity and identity,
                  otherwise impossible if we were using traditional fiat currencies.</i>
                  <br/>
                  <br/>
                  At the moment, we only support TRX, the underlying cryptocurrency of TRON’s network.
                  <br/>
                  Thus, in order to bet you must ensure you have a Tron Wallet installed, with a few bucks (TRX) on it.
                  <br/>
                  Check
                  <a target="_blank"
                    href="https://chrome.google.com/webstore/detail/tronlink%EF%BC%88%E6%B3%A2%E5%AE%9D%E9%92%B1%E5%8C%85%EF%BC%89/ibnejdfjmmkpcnlpebklmnkoeoihofec">here</a>
                    on how to create one or, if you are playing from a mobile device, you can use <a target="_blank" href="https://www.tronwallet.me/">TronWallet</a>.
                  <br>
                  <br>
                  <b>How to get TRX?</b>
                  <br />Jump into the crypto world now!
                  <br />
                  <br />
                  <v-btn round color="primary" href="https://changelly.com/" target="_blank" dark pa-2>BUY TRX</v-btn>
                  <br />
                  <br />
                  Once you start playing, your TRX are safe with you as you don’t send them blindly to our website. Instead, they
                  remain in your secure wallet and are sent to us exclusively and in the exact amount of the bet whenever it is placed,
                  and you will be promptly asked confirmation by your own Tron wallet.
                  <br/>So no need to trust us or anyone... <b>you own your assets</b>!
                  That's a great thing about cryptocurrencies!
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>

        <!--/////////////////////////////////////////// FAQ //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'faq'">
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
                  1. The bot will reveal the current map state (a.k.a. countriesMap) at the beginning of each turn that
                  also takes into account of the cohesion values.
                  2. The bot will generate a magic number which will be used as the first seed for the next turn and
                  reveal its hash (a.k.a. Magic Hash) using sha256 algorithm.
                  3. The bot will reveal the future block number of TRON blockchain whose blockhash will be used as the
                  second source of entropy for the next turn.
                  Once the TRON block approaches the timer runs out, the magic number will be revealed and the battle
                  will take place.
                  Both the battle result and the next conqueror will be revealed.
                  Now you will be able to find all the revealed data under the Previous Turn section.
                  <br /><br />
                  At this point you can verify that data did not change and you can test this data against our <a
                    href="https://jsfiddle.net/tronwarbot/d82915un/" target="_blank">open source war engine</a>
                  to verify that the declared battle result and next conqueror area effectively the result of:
                  - The previous turn's map state
                  - The revealed Magic Number
                  - The declared Block Hash
                  <br />
                  <br />
                  <v-divider mt-3 />
                  <br />
                  <span v-if="info.previous" class="title">Previous Turn: {{info.turn - 1}} </span>
                  <br />
                  <v-container  v-if="info.previous" fluid grid-list-sm>
                    <v-flex sm 16>
                      <v-text-field ref='previousCountriesMap' append-icon="content_copy"
                        @click:append="copyToClipBoard(fairness.previous.mapState, 'previousCountriesMap')"
                        :value="fairness.previous.mapState" label="Countries Map" outline readonly>
                      </v-text-field>
                    </v-flex>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='previousMagicNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.magic, 'previousMagicNumber')"
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
                          @click:append="copyToClipBoard(fairness.previous.nextTurnBlock, 'previousNextBlockNumber')"
                          :value="fairness.previous.nextTurnBlock" label="Block Number" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex sm6>
                        <v-text-field ref='betNext' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.next, 'betNext')"
                          :value="fairness.previous.next" label="Bet Next" outline readonly>
                        </v-text-field>
                      </v-flex>
                      <v-flex sm6>
                        <v-text-field ref='previousBattle' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.previous.battle, 'previousBattle')"
                          :value="fairness.previous.battle" label="Bet Battle" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-divider />
                  <br />
                  <span class="title">Next Turn: {{info.turn}} </span>
                  <br />

                  <v-container fluid grid-list-sm>
                    <v-flex sm 16>
                      <v-text-field ref='nextCountriesMap' append-icon="content_copy"
                        @click:append="copyToClipBoard(fairness.next.mapState, 'nextCountriesMap')"
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
                        <v-text-field ref='nextBlockNumber' append-icon="content_copy"
                          @click:append="copyToClipBoard(fairness.next.nextTurnBlock, 'nextBlockNumber')"
                          :value="fairness.next.nextTurnBlock" label="Block Number" outline readonly>
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-card sm12>
                    <v-card-title text-xs-centered>
                      If you want to check the correctness of the TronWarBot, we suggest you to copy the data in the
                      'Next Turn' section and verify they are consistent with the 'Previous Turn' section as the turn
                      changes.
                      After that use the <i>Countries Map</i>, <i>Magic Number</i> and the <i>Block Hash</i> in our War
                      Engine.
                      And if you are brave enough, we even challenge you to hack it to get better chances at winning the
                      jackpot!
                    </v-card-title>
                    <v-layout justify-center>
                      <v-card-actions>
                        <v-chip label outline color="primary">
                          <a href="https://jsfiddle.net/tronwarbot/d82915un/" target="_blank">Check out our War
                            Engine</a>
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
        <v-card-text v-if="path === 'partners'">
          <v-carousel v-if="partners.length !== 0">
            <v-carousel-item v-for="partner in partners" :key="partner.name" :height="windowSize.y*0.7"
              src="/img/partners/background.jpg">
              <div class="text-xs-center pt-3">
                <a class="title text-truncate white--text" :href="partner.link" target="_blank"
                  style="text-decoration: none;">{{partner.name}}
                  <v-img :src="partner.img" class="image" :alt="partner.name" :height="windowSize.y*0.7" contain>
                  </v-img>
                </a>
              </div>
            </v-carousel-item>
          </v-carousel>
          <!-- <v-container fluid grid-list-xl>
            <v-layout wrap>
              <v-flex v-for="partner in partners" :key="partner.name" sm6>
                <v-card>
                  <v-img :src="partner.img" class="image" :alt="partner.name" height="150px" contain>
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
          </v-container> -->
        </v-card-text>

        <!--/////////////////////////////////////////// Ambassador //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'ambassador'">
          <div class="title" v-if="isLoggedIn">
            Hi <b>{{this.fbUserName}}</b>
          </div>
          <br v-if="isLoggedIn">
          <div class="mb-2">
            <h4 class=" text-xs-center">
              <i>Have you ever dreamt of becoming the leader of your favorite country and guide it to conquer the world?</i>
              <br /> <b>Now you can!</b>
            </h4>
            <br />
            <br />
            If you succeed and your country wins the war, you will <b>win 10K TRX</b> and <b>20 WAR</b>.
            All you have to do is register through the steps below, and support your country in winning the game.
            <br />
            <br />
            <h4>How?</h4>
            Motivate your cadets to engage through social media so that your country gain cohesion points and increase
            the odds of winning the war.
          </div>
          <v-stepper v-model="ambStep" vertical>
            <v-stepper-step :complete="ambStep > 1" step="1">
              Login with a wallet
            </v-stepper-step>

            <v-stepper-content step="1">
              <div>
                Please, login to your TRONLink wallet.
                <br />If you do not have it installed, please download it from
                <a target="blank" href="https://www.tronlink.org/">TronLink</a> or get the <a target="blank"
                  href="http://u6.gg/gmc5D">Chrome extension</a> or make sure to have any alternative proper Tron wallet
                unlocked.
                <br />
                <br />
                <v-alert :value="true" type="warning">Tron War Bot can only be used with an active Tron wallet at the
                  moment.
                </v-alert>
              </div>
            </v-stepper-content>

            <v-stepper-step :complete="ambStep > 2" step="2">Login to Facebook</v-stepper-step>

            <v-stepper-content step="2">
              <v-btn small color="facebook" class="white--text" @click="loginToFb('ambassador')">Facebook Login</v-btn>
            </v-stepper-content>

            <v-stepper-step :complete="ambStep > 3" step="3">Pick a country</v-stepper-step>

            <v-stepper-content step="3">
              <div class="my-2">
                Select the country you want to support. If you can't find it below it means it already has an
                outstanding ambassador.
                You can find out who the person is in the Standings tab, hovering on the 🎖 symbol.
              </div>
              <v-autocomplete outline v-model="currentCountry" :items="computedMapping" item-text="name"
                item-value="numberId" hide-no-data hide-selected label="Select Country"
                placeholder="Type in to select a country">
              </v-autocomplete>
              <v-checkbox color="primary" class="ml-2" v-model="terms"
                :label="'By checking this box you accept to publicly disclose your social media identity and profile on TronWarBot website and all of its related social media channels'">
              </v-checkbox>
              <v-btn small color="primary" :disabled="(!terms) || (currentCountry == null)" @click="becomeAnAmbassador">
                Confirm</v-btn>
            </v-stepper-content>

            <v-stepper-step :complete="ambStep >= 4" step="4">Wait for your approval</v-stepper-step>

            <v-stepper-content step="4">
              <div> <b>Your request has been sent successfully!</b>
                <br />
                For security reasons, our team will review your request and approve it within 12 hours.
                You will be notified about the approval of your request on our <b><a target="_blank"
                    href="https://t.me/Tron_WarBot">telegram channel here!</a></b> </div>
            </v-stepper-content>

          </v-stepper>
        </v-card-text>

        <!--/////////////////////////////////////////// News //////////////////////////////////////////////////////////////////-->
        <v-card-text v-if="path === 'news'">
          <v-carousel v-if="news.length !== 0" height="375px">
            <v-carousel-item v-for="(n,i) in news" :key="i" :src="n.src" contain>
              <!-- <v-img :src="n.src" class="image" :alt="i.toString()" :aspect-ratio="windowSize.x/(windowSize.y)">
              </v-img> -->
            </v-carousel-item>
          </v-carousel>
          <v-text-field v-else value="There're no recent news" outline readonly></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-if="path === 'dividends'" color="blue darken-1" flat="flat" v-on="on">Claim
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
    startPolling
  } from '../utils/pollForUpdate'

  export default {
    name: "Modal",
    props: {
      value: Boolean,
      path: String,
      headerTile: String,
      footerTile: String,
      bodyTile: String
    },

    filters: {
      TRX: (amount) => {
        let result = tronweb.fromSun(amount).toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return result + ' TRX'
      },
      WAR: (amount) => {
        return amount != null ? amount.div("1000000000000000000").toFixed(3) + ' WAR' : 0 + ' WAR'
      }
    },
    mounted() {
      window.addEventListener('resize', () => {
        this.windowSize.x = window.innerWidth
        this.windowSize.y = window.innerHeight
      })
    },
    watch: {
      news: function () {
        this.$store.commit("updateNewsCount", this.news.length)
      },
      isVisible: function () {
        if (this.isVisible) {
          if (this.path != 'dividends') this.$store.commit("setPollDivs", true);
          if (this.path == 'dividends') {
            this.$store.commit("setPollDivs", false)
            startPolling(1000)
          }
          if (this.path == 'faq') this.$rtdbBind('fairness', db.ref('public/fairness'))
        } else {
          this.$store.commit("setPollDivs", true);
        }
      }
    },

    computed: {
      ambStep: {
        get() {
          if (this.allDone) return 4;
          if (this.$store.state.fbStatus.loggedIn && this.$store.state.loggedInAccount != null) return 3;
          if (this.$store.state.loggedInAccount != null) return 2;
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
      availableTRX() {
        if (this.$store.state.availableDividends == null) {
          return tronweb.BigNumber('0')
        }
        if (this.$store.state.availableDividends != null) {
          // BetFinal Jackpot + max((BetNext - deposit),0)
          const BetFinal = this.$store.state.jackpot.times(tronweb.BigNumber((this.$store.state.gameParams
            .finalBetParams.houseEdge)))
          console.log("BetFinal ", tronweb.fromSun(BetFinal).toString())
          const BetNext = this.$store.state.availableDividends
          console.log("betNext: ", tronweb.fromSun(BetNext).toString())
          const deposit = tronweb.toSun(this.info.deposit)
          console.log('deposit ',tronweb.fromSun(deposit).toString())
          const availableTRX = BetFinal.plus(tronweb.BigNumber.maximum(BetNext.minus(deposit), tronweb.BigNumber('0')));
          console.log(tronweb.fromSun(availableTRX).toFixed(3).toString())
          return availableTRX
        }
      },
      myWAR() {
        return this.$store.state.currentAddressWarBalance != null ? this.$store.state.currentAddressWarBalance : tronweb
          .BigNumber('0')
      },
      totalWARSupply() {
        return this.$store.state.totalWARSupply != null ? this.$store.state.totalWARSupply : tronweb.BigNumber('0');
      },
      dividendStage() {
        return this.totalWARSupply != null ? parseInt(this.totalWARSupply.div("1000000000000000000").mod(1000000)
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
        return this.$store.state.fbStatus.fbUserName
      },
      isLoggedIn() {
        return this.$store.state.fbStatus.loggedIn
      }
    },
    firebase: {
      referrals: db.ref("public/referral"),
      info: db.ref("public/data"),
      mapStatus: db.ref("public/countriesMap"),
      news: db.ref("public/news"),
      partners: db.ref("public/partners")
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
        if (!this.isLoggedIn) {
          this.snackbarText = "Login to facebook First";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
          return
        }
        if (this.$store.state.loggedInAccount == null) {
          this.snackbarText = "Login to your wallet first";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
          return
        }
        if (this.currentCountry == null) {
          this.snackbarText = "Select a country first";
          this.snackbarColor = "error";
          this.snackbar = true;
          this.isWaitingForConfirm = false
          return
        }
        try {
          let msg = {
            access_token: this.$store.state.fbStatus.fbAcessToken,
            country: this.currentCountry,
            address: this.$store.state.loggedInAccount,
            name: this.$store.state.fbStatus.fbUserName,
            id: this.$store.state.fbStatus.fbId,
            link: this.$store.state.fbStatus.fbLink
          }
          await axios.post(`https://api.tronwarbot.com/ambassador`, msg)
          this.allDone = true
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
      fairness: {},
      terms: false,
      allDone: false,
      htmlText: false,
      info: null,
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
          question: "How are probabilities calculated?",
          answer: "You can bet that a state will attempt to conquer another country during the next turn. You choose how much to bet and your reward will be according to the probability of that country to be the actual conqueror next.\n" +
          "<br><b>Example</b>: I think Japan will conquer another country in the next turn (doesn’t matter which one, you only care about the conqueror) so I choose Japan in the box “select country”, I choose how much to bet, then I place the bet.<br> Let’s say you bet 100TRX and the percentage of Japan to conquer next was 50%, if you win you’ll take away 190TRX! What about those missing 10TRX for a fair payout? Well, we put that in the Dividends Pool and at the end of the run they will be shared back to token holders!\n"
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
          question: "How can be used the WAR token?\n",
          answer: "At the moment the WAR is only used to claim TronWarBot's dividends, but very soon the WAR will be integrated in our amazing game.\n"
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
          question: "What are the social media rules?",
          answer: "Please reach us out on our offical <a href=\"https://t.me/Tron_WarBot\" target=\"_blank\">telegram group </a>! We would be very happy to answer your questions :)"
        },
        {
          question: "Couldn't find your answer?",
          answer: "Please reach us out on our offical <a href=\"https://t.me/Tron_WarBot\" target=\"_blank\">telegram group </a>! We would be very happy to answer your questions :)"
        },
        {
          question: "Is there a whitepaper?",
          answer: "<a href=\"/files/WhitePaper.pdf\" target=\"_blank\">Click here to view the whitepaper<a/>"
        },
        {
          question: "Is there a Privacy Policy?",
          answer: "<a href=\"/files/PrivacyPolicy.html\" target=\"_blank\">Click here to view our privacy policy<a/>"
        }
      ],
      partners: [],
      news: [],
      windowSize: {
        x: window.innerWidth,
        y: window.innerHeight
      }
    })
  };
</script>
