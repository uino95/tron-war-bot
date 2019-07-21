<template>
  <v-layout row justify-center>
    <v-dialog v-model="isVisible" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

        <v-card-text v-if="headerTile === 'Login With Tronlink'">
          <div v-if="this.$store.state.loggedInAccount!=null">
            Already logged in with account address: {{this.$store.state.loggedInAccount}}
            <br /><br />{{footerTile}}
          </div>
          <div v-else>
            Please, login to your TRONLink wallet.<br />
            If you do not have TRONLink wallet installed, please visit
            <a href="http://u6.gg/gmc5D">http://u6.gg/gmc5D</a> and download the Chrome extension.<br /><br />
            <v-alert :value="true" type="warning">
              Tron War Bot is only available on Google Chrome or on TronLink mobile app for the time being.
            </v-alert>
          </div>
        </v-card-text>

        <v-card-text v-if="headerTile === 'Referral'">
          Refer a friend by sharing your referral link with him.<br>
          Here is your referral link:
          <v-chip v-if="this.$store.state.loggedInAccount != null" label outline color="primary">
            https://tronwarbot.com/ref={{this.$store.state.loggedInAccount}}</v-chip>
          <v-chip v-else label outline color="red">Login First</v-chip>
          <br><br>
          You'll earn <b>1%</b> out of each of his bets <b>forever</b>!<br><br>
          Once an address starts using a referral link, that can't change and it will always provide you that
          1%.<br>
          Every 50TRX piled up you will automatically receive the earned TRX. Below you can see how much your
          referred links are earning you
          <v-container grid-list-md style="padding: 0px;" mt-2>
            <v-layout row>
              <v-flex xs12 style="text-align: center">
                <v-card color="primary" dark>
                  <v-card-text class="title">Your Referrals</v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
            <v-layout row wrap style="padding: 16px 16px 0 16px;">
              <v-flex xs6 class="title">
                Address
              </v-flex>
              <v-flex xs6 class="title" style="text-align: end;">
                Amount
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <v-container v-if="myReferrals.length > 0" style="max-height: 200px; overflow-y: auto; overflow-x: hidden;">
              <v-layout row wrap v-for="referral in myReferrals" :key="referral.user_addr">
                <v-flex xs6 class="subheading">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <div class="text-truncate" v-on="on">
                        {{referral.user_addr}}
                      </div>
                    </template>
                    <span> {{referral.user_addr}} </span>
                  </v-tooltip>
                </v-flex>
                <v-flex xs6 class="subheading" style="text-align: end">
                  {{referral.amount.toFixed(3)}}
                </v-flex>
              </v-layout>
            </v-container>
            <v-container v-else class="text-md-center">
              <v-chip label outline color="red">Still no one played with your link... :(</v-chip>
            </v-container>
          </v-container>
        </v-card-text>

        <v-card-text v-if="headerTile === 'Dividends'">

          100% of TronWarBot profits are shared back to token holders! (..but yes we detain around 50% of the current
          token supply). After every stage you will need 50 more TRX to mine one WAR. Dividend payout will happen at the
          end of the run.
          <br><br>
          <v-divider mt-3 />
          <br>
          <span class="headling">We are in stage 1 of 10. You need to play 50 TRX to mine 1 WAR</span>
          <v-progress-linear color="primary" height="15" v-model="dividendStage"></v-progress-linear>
          <v-divider mt-8 />
          <br>
          <v-layout row wrap>
            <v-flex xs12 sm5>
              <v-text-field :value="availableTRX + '  TRX'" label="Available Dividends" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="https://cdn.coinranking.com/behejNqQs/trx.svg">
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>

            <v-spacer />

            <v-flex xs12 sm5>
              <v-text-field :value="totalWARSupply + '  WAR'" label="Total War mined" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png">
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>
          </v-layout>

          <v-layout>
            <v-spacer />
            <v-flex xs12 sm5>
              <v-text-field :value="myWAR + '  WAR'" label="You have mined" outline readonly>
                <template v-slot:append>
                  <v-avatar class="pb-2" tile size="40">
                    <img src="/img/logo.png">
                  </v-avatar>
                </template>
              </v-text-field>
            </v-flex>
            <v-spacer />
          </v-layout>
          <!-- <v-layout row wrap>
            <v-flex xs4>
              <span class="display-3"> Available Dividends: </span>
              <span class="display-1">{{availableTRX}}</span>
            </v-flex>
            <v-flex xs3>
              <v-avatar class="xs3" tile size="40">
                <img src="https://cdn.coinranking.com/behejNqQs/trx.svg">
              </v-avatar>
              <span class="display-1 xs1">TRX </span>
            </v-flex>
          </v-layout>

          <v-divider mt-3 />

          Total Mined:
          <v-layout row wrap>
            <v-flex xs9>
              <span class="display-1">{{totalWARSupply}}</span>
            </v-flex>
            <v-flex xs3>
              <v-avatar class="xs3" tile size="42">
                <img src="/img/logo.png">
              </v-avatar>
              <span class="display-1 xs1">WAR </span>
            </v-flex>
          </v-layout>

          You have:
          <v-layout row wrap>
            <v-flex xs9>
              <span class="display-1">{{myWAR}}</span>
            </v-flex>
            <v-flex xs3>
              <v-avatar class="xs3" tile size="42">
                <img src="/img/logo.png">
              </v-avatar>
              <span class="display-1 xs1">WAR </span>
            </v-flex>
          </v-layout> -->

          <v-divider mt-3 />
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-text-area v-on="on"> At the end of the run by clicking the button "Claim your dividends" you will get 100 TRX every 10 WAR: {{100 * (myWAR/10)}} </v-text-area>
            </template>
            <span> 100 TRX every 10 WAR </span>
          </v-tooltip>
          
          <!-- There is a total of 104 WAR eligible for dividen sharing. Every 10 WAR you'll get 100 TRX at dividend payout
          (end of the run) -->
        </v-card-text>


        <v-card-text v-if="headerTile === 'How To Play'">
          The game is based on WorldWarBot 2020 <a href="https://www.facebook.com/worldwarbot/" target="_blank">Facebook
            Page</a>.<br />
          The bot simulates a world war: every turn,one per hour, a country (randomly chosen) conquers another
          country. The conquest probability is proportional to the number of conquered countries (see Stats
          panel for current status).
          <br /><br>
          In the game each gamer can bet that a country will conquer another country during the next turn. The
          bet prize is 50TRX.
          Example: I think Japan will conquer another country in the next turn (doesn’t matter which one, you
          only care about the conqueror) so I choose Japan in the box “select country” and then I click “bet
          50 TRX”.
          <br><br>
          The potential win is the 80% of the Jackpot and it is equally divided among the winners, the ones
          that have betted on the same country that has won in the turn.
          The Jackpot consists in the total amount of bets and is divided in this way: 80% to the winners, 10%
          is the starting jackpot of the next round and the 10% is taken by the team.
          When there isn’t a winner the 90% of the Jackpot will be the starting jackpot of the next round.
          <br><br>
          TronWarBot is not the owner of the WorldWarBot that runs the game, so it can’t control in any way
          the events.
          <br>
          Examples of the game:
          Example 1:
          10 people bet on Spain, Spain conquers England. The winners receive 0.8*(JACKPOT)/10.
          Example 2:
          Spain conquers England, but nobody bets on Spain. 0.9*(JACKPOT) will be the starting Jackpot of the
          next round (the 10% of jackpot is taken by the developers).
          <br><br>
          What do I need to play?<br>
          In order to play, you must own TRX: the underlying cryptocurrency of TRON’s network.<br>
          Make sure you have a TronLink Wallet. For more information on how to create one,
          <a href="http://u6.gg/gmc5D" target="_blank">click here</a>. To play on mobile devices, please use
          <a href="https://www.tronwallet.me/" target="_blank">TronWallet</a>. Note that the user
          experience isn’t optimized on mobile devices yet.

          <ol style="text-align: justify" class="mt-2">
            <li>Choose the country and place the bet (there is no limit of bets per-turn)</li>
            <li>The BET AMOUNT is set to 50 TRX</li>
            <li>
              There is a turn every 15 minutes past an hour (e.g. 8:15 or 10:15), and it is won by
              whoever placed the bet on the conqueror state
            </li>
            <li>
              There is a timer which indicates as long as is possible betting.
              It stops 2 minutes before the draw of the country
            </li>
            <li>Few seconds after the draw, awards will be paid to winners</li>
          </ol>

          <h2 class="headline mt-4">How to get TRX</h2>
          Are you running out of your skin to start gaming?<br /> Jump into the crypto world now!<br />
          <br>
          <v-btn round color="primary" href="https://changelly.com/" target="_blank" dark pa-2>BUY TRX</v-btn>
          <br><br>

          Once you start playing, your TRX are safe because you don’t move them on our website. They
          remain in your secure wallet and moved out whenever you place a bet. So no need to trust us or anyone, you
          control your crypto assets. That's one of the nice things about using the blockchain.
        </v-card-text>

        <v-card-text v-if="headerTile === 'FAQ'">
          <v-expansion-panel>
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


        <v-card-actions>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-if="headerTile === 'Dividends'" color="blue darken-1" flat="flat" v-on="on">
                Claim your Dividends
              </v-btn>
            </template>
            <span> It will be available when the run is finished </span>
          </v-tooltip>
          <v-btn color="green darken-1" flat="flat" @click.stop="isVisible = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import {
    db
  } from '../plugins/firebase';
  export default {
    name: 'Modal',
    props: {
      value: Boolean,
      headerTile: String,
      footerTile: String,
      bodyTile: String,
    },
    computed: {
      isVisible: {
        get() {
          return this.value
        },
        set(value) {
          this.$emit('input', value)
        }
      },
      myReferrals: function () {
        let keys = Object.keys(this.referrals)
        let myReferrals = []
        for (var i = keys.length - 1; i >= 0; i--) {
          if (this.account != null && this.referrals[keys[i]].referrer_addr === this.account) {
            myReferrals.push({
              user_addr: keys[i],
              amount: this.referrals[keys[i]].amount
            })
          }
        }
        return myReferrals
      },
      account() {
        return this.$store.state.loggedInAccount
      },
      availableTRX() {
        return this.$store.state.availableDividends
      },
      myWAR() {
        return this.$store.state.currentAddressWarBalance
      },
      totalWARSupply() {
        return this.$store.state.totalWARSupply
      }
    },
    firebase: {
      referrals: db.ref('referral/map')
    },
    data: () => ({
      dividendStage: 30,
      faq: [{
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
        }
      ]
    }),
  };
</script>