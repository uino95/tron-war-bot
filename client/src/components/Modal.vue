<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-layout row justify-center>
        <v-dialog v-model="isVisible" max-width="500">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

                <!--<v-card-text v-if="headerTile !== 'Login With Tronlink'">
                    {{bodyTile}}<br/><br/>{{footerTile}}
                </v-card-text>-->

                <v-card-text v-if="headerTile === 'Login With Tronlink' && this.isLoggedIn()">
                    Already logged in with TronLink.<br/><br/>{{footerTile}}
                </v-card-text>

                <v-card-text v-if="headerTile === 'Login With Tronlink' && !this.isLoggedIn()">
                    Please, login to your TRONLink wallet.<br />
                    If you do not have TRONLink wallet installed, please visit
                    <a href="http://u6.gg/gmc5D">http://u6.gg/gmc5D</a> and download the Chrome extension.<br /><br />

                    <v-alert :value="true" type="warning">
                        Tron War Bot is only available on Google Chrome for the time being.
                    </v-alert>
                </v-card-text>

                <v-card-text v-if="headerTile === 'How To Play'">
                    The game is based on WorldWarBot 2020
                    (<a href="https://www.facebook.com/worldwarbot/">https://www.facebook.com/worldwarbot/</a>).<br />
                    TronWarBot is not the owner of the WorldWarBot that runs the game, so it can’t control in any way
                    the events.<br />
                    In order to play, you must own TRX: the underlying cryptocurrency of TRON’s network.<br>
                    Make sure you have a TronLink Wallet. For more information on how to create one,
                    <a href="http://u6.gg/gmc5D" target="_blank">click here</a>. To play on mobile devices, please use
                    <a href="https://www.tronwallet.me/" target="_blank">TronWallet</a>. Note that the user
                    experience isn’t optimized on mobile devices yet.

                    <ol style="text-align: justify" class="mt-2">
                        <li>Choose the country and place the bet (there is no limit of bets per-turn)</li>
                        <li>The BET AMOUNT is set to 50 TRX/1 WAR.</li>
                        <li>
                            There is a turn every 15 minutes past an hour (e.g. 13:15 or 14:15), and it is won by
                            whoever placed the bet on the conqueror state
                        </li>
                        <li>
                            There is a timer which indicates as long as is possible betting.
                            It stops 2 minutes before the draw of the country
                        </li>
                        <li>Few seconds after the draw, awards will be paid to winners</li>
                    </ol>

                    <h2 class="headline mt-4">How to get TRX</h2>
                    Are you running out of your skin to start gaming?<br />
                    Here's a rapid getting started guide!<br />
                    Prepare your
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span v-on="on">identity document <v-icon small>fa-info-circle</v-icon></span>
                        </template>
                        <span>i.e. ID card, passport or driver’s license</span>
                    </v-tooltip>
                    and your credit card &dash; you'll only need 10 minutes!<br /><br />
                    There are two ways to obtain TRX: the first method is faster, the second one has less fee cost.
                    <v-expansion-panel class="mt-2 mb-2">
                        <v-expansion-panel-content>
                            <template v-slot:header data-icon="fa-info-circle">
                                <div>Method A <v-chip color="green" text-color="white">Faster, more fees</v-chip></div>
                            </template>
                            <v-card>
                                <v-card-text>
                                    <ol>
                                        <li>
                                            Register on <a href="https://www.binance.com/en/" target="_blank">Binance</a>
                                            and get TRX directly from there (3.5% fees)
                                        </li>
                                        <li>Move your TRX on your TRX Wallet and get ready for the game!</li>
                                    </ol>
                                </v-card-text>
                            </v-card>
                        </v-expansion-panel-content>
                        <v-expansion-panel-content>
                            <template v-slot:header>
                                <div>
                                    Method B <v-chip color="secondary" text-color="white">Slower, fewer fees</v-chip>
                                </div>
                            </template>
                            <v-card>
                                <v-card-text>
                                    <ol>
                                        <li>
                                            Register on <a href="https://coinbase.com" target="_blank">Coinbase</a>
                                            and get ETH
                                        </li>
                                        <li>
                                            Register on <a href="https://www.binance.com/en/" target="_blank">Binance</a>
                                            and move your ETH there
                                        </li>
                                        <li>Exchange ETH to TRX on Binance</li>
                                        <li>Move your TRX on your TRXWallet and get ready for the game!</li>
                                    </ol>
                                </v-card-text>
                            </v-card>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    Once you start playing, your TRX are safe because you don’t move them on our website. They
                    remain in your secure wallet and moved out whenever you place a bet. Transactions are safe since
                    they are written on the blockchain!
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

                    <v-btn color="green darken-1" flat="flat" @click.stop="isVisible = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
    export default {
        name: 'Modal',
        props: {
            value: Boolean,
            headerTile: String,
            footerTile: String,
            bodyTile: String
        },

        methods: {
            isLoggedIn() {
                return window.tronWeb && window.tronWeb.ready
            },
            // async fetchAccount() {
            //     const account = await window.tronWeb.trx.getAccount();
            //     const accountAddress = account.address; // HexString(Ascii)
            //     const accountAddressInBase58 = window.tronWeb.address.fromHex(
            //         accountAddress
            //     ); // Base58

            //     return accountAddressInBase58
            // },
        },
        computed: {
            isVisible: {
                get() {
                    return this.value
                },
                set(value) {
                    this.$emit('input', value)
                }
            }
        },
        data: () => ({
            faq: [
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
                }
            ]
        })
    };
</script>