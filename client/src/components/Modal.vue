<template>
  <v-layout row justify-center>
    <v-dialog v-model="isVisible" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

        <v-card-text v-if="headerTile === 'Login With Tronlink'">
          <div v-if="this.$store.state.loggedInAccount!=null">
            Already logged in with account address: {{this.$store.state.loggedInAccount}}
            <br />
            <br />
            {{footerTile}}
          </div>
          <div v-else>
            Please, login to your TRONLink wallet.
            <br />If you do not have TRONLink wallet installed, please visit
            <a href="http://u6.gg/gmc5D">http://u6.gg/gmc5D</a> and download the Chrome extension.
            <br />
            <br />
            <v-alert :value="true" type="warning">Tron War Bot is only available on Google Chrome or on TronLink mobile
              app for the time being.</v-alert>
          </div>
        </v-card-text>

        <v-card-text v-if="headerTile === 'Referral'">
          Refer a friend by sharing your referral link with him.
          <br />Here is your referral link:
          <v-chip v-if="this.$store.state.loggedInAccount != null" label outline color="primary">
            https://tronwarbot.com/ref={{this.$store.state.loggedInAccount}}</v-chip>
          <v-chip v-else label outline color="red">Login First</v-chip>
          <br />
          <br />You'll earn
          <b>{{percentage}} % </b> out of each of his bets
          <b>forever</b>!
          <br />
          <br />Once an address starts using a referral link, that can't change and it will always provide you that
          {{percentage}} %
          <br />Every 50TRX piled up you will automatically receive the earned TRX. Below you can see how much your
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
                  <v-flex xs6 class="subheading" style="text-align: end">{{referral.amount.toFixed(3)}} TRX</v-flex>
                </v-layout>
              </v-container>
            </v-container>

            <v-container v-else class="text-md-center">
              <v-chip label outline color="red">Still no one played with your link... :(</v-chip>
            </v-container>
          </v-container>
        </v-card-text>

        <v-card-text v-if="headerTile === 'Dividends'">
          We want to build this game together with our users, and that's why 100% of TronWarBot profits are shared back
          to token holders! (..but yes we detain around 50% of the current
          token supply). After every stage you will need 50 more TRX to mine one WAR. Dividend payout will happen at the
          end of the run.
          <br />
          <v-divider mt-3 />
          <br />
          <span class="headling">We are in stage 1 of 100. You need to play 500 TRX to mine 1 WAR</span>
          <v-progress-linear color="primary" height="30" v-model="dividendStage"></v-progress-linear>
          <v-divider mt-8 />
          <br />
          <v-layout row wrap>
            <v-flex xs12 sm5>
              <v-text-field :value="availableTRX | TRX" label=" Estimate Available Dividends" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="https://cdn.coinranking.com/behejNqQs/trx.svg" />
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>

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

          <v-layout>
            <v-spacer />
            <v-flex xs12 sm5>
              <v-text-field v-if="account == null" :value="'Login First'" background-color="red" label="You have mined" outline readonly>
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
            <v-spacer />
          </v-layout>

          <v-divider />

          <v-card mt-3>
            <v-card-text style="text-align:center;">
              At the end of the run you will be eligible to get your share of dividends by clicking the button "Claim
              your dividends".
              <br />Currently, for every
              <b>100 WAR you get {{availableTRX.div(totalWARSupply.div("1000000000000000000")).times('100') | TRX}}</b>
            </v-card-text>
            <v-chip v-if="account != null" label outline color="primary" style="margin-left:4.5em;">
              With your current WARs you will receive:
              {{availableTRX.times(myWAR.div(totalWARSupply).toString()) | TRX }}
            </v-chip>
          </v-card>

          <!-- There is a total of 104 WAR eligible for dividen sharing. Every 10 WAR you'll get 100 TRX at dividend payout
          (end of the run)-->
        </v-card-text>




        <v-card-text v-if="headerTile === 'How To Play'">
          The game is inspired from the popular WorldWarBot 2020
          <a href="https://www.facebook.com/worldwarbot/" target="_blank">Facebook Game</a>
          <br />The bot simulates a world war: every turn, one every 5 minutes, a state (randomly chosen) conquers
          another country.
          The conquest probability is proportional to the number of conquered countries and the cohesion index of that
          country.
          A World War run lasts on average 40 days.

          <br />
          <br>
          <b>What do I need to play?</b>
          <br>In order to play, you must own TRX, the underlying cryptocurrency of TRON’s network. Make sure you have a
          TronLink Wallet.
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
          remain in your secure wallet and moved out whenever you place a bet. So no need to trust us or anyone, you
          control your crypto assets. That's one of the nice things about using the blockchain.
        </v-card-text>

        <v-card-text v-if="headerTile === 'FAQ'">
          <v-expansion-panel>
            <v-expansion-panel-content>
              <template v-slot:header>
                <div>How are we PROVABLY FAIR?</div>
              </template>
              <v-card>
                <v-card-text>
                  We are crystal clear. We care about making things right. Here is how we provide the details to check that we are <a href="https://en.wikipedia.org/wiki/Provably_fair" targte="_blank">provably fair</a>.
                  <br /><br />
                  At the very beginning of a turn the Bot decides which country will conquer next. The Bot will hash (sha256) the name of the winner + a random string (called seed or salt in cryptography). You can find that hash in the box under Next Turn.<br>
                  Once the timer runs out, the battle takes place and the conqueror is revelead alogside that seed used to compute the hash. You will then find the initial hash and the Conqueror + its seed under Previus Turn.
                  <br/><br/>
                  This way we prove the Bot truly picks the countries in a random manner and doesn't "change its mind" on the way! And this is done in a way you can easily check, that is use any sha256 online tool like the one suggested below.
                  <br />
                  <v-divider mt-3 />
                  <br />
                  <span class="title">Previous Turn: {{data.turn - 1}} </span>
                  <br />
                  
                  <v-flex>
                    <v-text-field ref='previousMagicHash' :append-icon="'content_copy'"
                      @click:append="copyToClipBoard(fairness.previousMagicHash, 'previousMagicHash')" :value="fairness.previousMagicHash"
                      :label="'Hash of WINNER + SEED '" outline readonly>
                    </v-text-field>
                  </v-flex>

                  <v-flex>
                    <v-text-field ref='magicHashRevealed' :append-icon="'content_copy'"
                      @click:append="copyToClipBoard(fairness.magicHashRevealed, 'magicHashRevealed')" :value="fairness.magicHashRevealed"
                      :label="'WINNER + SEED '" outline readonly>
                    </v-text-field>
                  </v-flex>

                  <v-divider />
                  <br />
                  <span class="title">Next Turn: {{data.turn }} </span>
                  <br />
                  <v-flex>
                    <v-text-field ref='nextMagicHash' :append-icon="'content_copy'"
                      @click:append="copyToClipBoard(fairness.nextMagicHash, 'nextMagicHash')" :value="fairness.nextMagicHash"
                      :label="'Hash of WINNER + SEED '" outline readonly>
                    </v-text-field>
                  </v-flex>

                  <v-card mt-3>
                    <v-card-text style="text-align:center;">
                      If you want to check the correcteness of the hash, we suggest you to use the following sha256 online calculator, but you can whatever tool you prefer.
                    </v-card-text>
                    <v-chip label outline color="primary" style="margin-left:4.5em;">
                      <a href="https://emn178.github.io/online-tools/sha256.html" target="_blank">https://emn178.github.io/online-tools/sha256.html</a>
                    </v-chip>
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

        <v-card-text class="display-1" v-if="headerTile === 'Whitepaper'">
          <div>
            We are updating it. It will be available in a few days
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-if="headerTile === 'Dividends'" color="blue darken-1" flat="flat" v-on="on">Claim your Dividends
              </v-btn>
            </template>
            <span>It will be available when the run is finished</span>
          </v-tooltip>
          <v-btn color="success" @click.stop="isVisible = false">Close</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="'info'" :timeout="3000" vertical bottom>
      <span class="title"> Copied to clipboard</span>
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
        return amount.div("1000000000000000000").toFixed(3) + ' WAR'
      }
    },

    computed: {
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
        // BetFinal Jackpot + max((BetNext - deposit),0)
        const BetFinal = tronweb.BigNumber(tronweb.toSun(this.data.jackpot * this.$store.state.gameParams.finalBetParams.houseEdge))
        const BetNext = this.$store.state.availableDividends
        const deposit = tronweb.toSun(this.data.deposit)
        return BetFinal.plus(tronweb.BigNumber.maximum(BetNext.minus(deposit),tronweb.BigNumber('0')));
      },
      myWAR() {
        return this.$store.state.currentAddressWarBalance;
      },
      totalWARSupply() {
        return this.$store.state.totalWARSupply;
      },
      dividendStage() {
        return parseInt(this.totalWARSupply.div("1000000000000000000").mod(1000000).div(100).toString());
      }
    },
    firebase: {
      referrals: db.ref("public/referral"),
      data: db.ref("public/data"),
      fairness: db.ref("public/fairness"),
    },
    methods: {
      copyToClipBoard(value, ref) {
        const input = this.$refs[ref];
        input.focus();
        document.execCommand('selectAll');
        this.copied = document.execCommand('copy');
        this.snackbar = true
      },
    },
    data: () => ({
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      snackbarTimeout: 6000,
      faq: [{
          question: "What even is TronWarBot?",
          answer: "A DApp (Distributed application, having part of its backend on the blockchain) based on the TRON blockchain created by a bunch of fans of the popular <a target=\"_blank\" href='https://www.facebook.com/worldwarbot/'>WorldWarBot2020 game on Facebook</a>.\n" +
            "<br><br>Basically we have a bot which decides one country every to conquer another country. It goes on like that until one country takes the whole world. It’s super addictive to keep an eye on the updates, we tried it on our own skin!!\n" +
            "What we do is to allow betting on it! We bet using cryptocurrencies, TRX. Please read further if you wanna know more."
        },
        {
          question: "Bets? How?",
          answer: "Glad you asked! We currently support two types of bets.\n" +
            "<br><b>Final Bet</b>: you can bet on the final winner. It’s you vs the others.\n" +
            "<br><b>Next Conqueror Bet</b>: you can bet on who will conquer next turn. It’s you against us!\n" +
            "You need TronLink wallet filled in with some TRX in order to bet.\n" +
            "To know more read further.\n"
        },
        {
          question: "How does Final Bet work?",
          answer: "You can try to forecast the winner of the whole run, the country which will conquer the whole world.<br> 80% of the Final Jackpot is split among those who believed in that country and placed a bet on it, the remaining 20% goes into the Dividend Pool. The betting amount varies each turn depending on the probability a country has to win, so first movers have a huge advantage! We start with a fixed 50TRX at the beginning, then it keeps increasing as the run goes on! Please refer to the FAQ in you wanna have more details.\n"
        },
        {
          question: "How does Bet Next work?",
          answer: "You can bet that a state will conquer another country during the next turn. You choose how much to bet and your reward will be according to the probability of that country to be the actual conqueror next.\n" +
            "<br><b>Example</b>: I think Japan will conquer another country in the next turn (doesn’t matter which one, you only care about the conqueror) so I choose Japan in the box “select country”, I choose how much to bet, then I place the bet.<br> Let’s say you bet 100TRX and the percentage of Japan to conquer next was 50%, if you win you’ll take away 190TRX! What about those missing 10TRX for a fair payout? Well, we put that in the Dividends Pool and at the end of the run they will be shared back to token holders!\n"
        },
        {
          question: "How does the Bot work?",
          answer: "It uses a probability density function (PDF) to determine next conqueror state.\n" +
            "PDF is based on number of conquered neighbouring countries times the cohesion index.\n\n" +
            "<br><br><code>PDF = (NUMBER OF TERRITORIES CONQUERED ON THE BORDER) * (COHESION INDEX + PROBABILITY OF INSURRECTION BY THE FOREIGN STATE)</code>\n"
        },
        {
          question: "What is the cohesion index?",
          answer: "It indicates the welfare and the feeling good together of the people. It runs from 0, which means anarchy, to 1, which means patriotic state, with people which want to defend their identity.\n"
        },
        {
          question: "When the cohesion index is updated?",
          answer: "It is updated anytime there is a variation in the number of countries belonging to a state, both if conquering or losing a country. It is computed taking care of the cohesion index of the conquered state.\n" +
            "<br><b>Example</b>: France conquers a very patriotic Germany and then France will have a lower cohesion index, due to the German people that want to be independent!\n"
        },
        {
          question: "How long is a World War?\n",
          answer: "It has not a fixed deadline, it depends on the development of the war itself. On average it takes 40 days having one turn every 5 minutes.\n"
        },
        {
          question: "What do I do if I'm not able to place the bet?",
          answer: "Check if you have got enough Energy and Bandwidth."
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
          answer: "<a href=\"/files/WhitePaper.pdf\" target=\"_blank\">Click here to view the whitepaper<a/>"
        },
      ]
    })
  };
</script>