import axios from 'axios'
import tronweb from 'tronweb'
import {
    db
}
from '../plugins/firebase';

export const betMixin = {
    data: () => ({
        windowSize: {
            x: window.innerWidth,
            y: window.innerHeight
        },
    }),

    mounted() {
        db.ref('public/bets').orderByChild('gameType').equalTo(this.gameType.toString()).limitToLast(30).once('value', () => {
            this.$root.$emit('loaded', true);
        })
        window.addEventListener('resize', () => {
            this.windowSize.x = window.innerWidth
            this.windowSize.y = window.innerHeight
          })
    },

    filters: {
        RESULT: (result) => {
            if (result < 0) {
                return '-'
            } else {
                return tronweb.fromSun(result)
            }
        },
        TRX: (amount) => {
            if(amount == 0) return 0
            return tronweb.fromSun(amount).toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' TRX'
        },
        TRXnotBIG: (amount) => {
            return tronweb.fromSun(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' TRX'
        },
        probability: (p) => {
            let P = p * 100
            return (P <= 0.1 && P > 0) ? 'very low' : P.toFixed(2) + ' %'
        }
    },
    firebase: function () {
        return {
            bets: db.ref('public/bets').orderByChild('gameType').equalTo(this.gameType.toString()).limitToLast(30),
            personalBets: db.ref('public/bets').orderByChild('from').equalTo(this.account),
            info: db.ref('public/data'),
            mapStatus: db.ref('public/countriesMap'),
        }
    },

    methods: {
        compare: function (a, b) {
            return b.turn - a.turn
        },

        async placeBet(userChoice, betAmount) {
            this.isWaitingForConfirm = true
            if (this.$store.state.loggedInAccount == null) {
                this.snackbarText = "Login First";
                this.snackbarColor = "error";
                this.snackbar = true;
                this.isWaitingForConfirm = false
            } else if (userChoice == null) {
                this.snackbarText = "Select a country first";
                this.snackbarColor = "error";
                this.snackbar = true;
                this.isWaitingForConfirm = false
            } else {
                this.snackbarText = "The blockchain is processing your bet. Please wait...";
                this.snackbarColor = "info";
                this.snackbar = true;
                try {
                    this.currentTxId = await this.$store.state.contracts.TronWarBotInstance.bet(this.gameType, userChoice, this.info.turn).send({
                        callValue: window.tronWeb.toSun(betAmount)
                    })
                } catch (err) {
                    this.isWaitingForConfirm = false;
                    this.snackbarColor = "error";
                    this.snackbar = true;
                    this.snackbarText = "Failed to sign transaction: " + err
                }
            }
        },
        async postReferral(txId) {
            try {
                await axios.post(this.$store.state.test ? `http://localhost:3000/referral` :
                    `https://api.tronwarbot.com/referral`, {
                        user_addr: this.account,
                        txId: txId,
                        referrer_addr: window.location.pathname.slice(5)
                    })
            } catch (e) {
                // console.log(e)
                try {
                    this.snackbarText = "[REFERRAL] " + e.response.data.message
                    this.snackbarColor = "error";
                    this.snackbarTimeout = 10000;
                    this.snackbar = true;
                } catch (err) {
                    // console.log(err)
                    this.snackbarText = "[REFERRAL] Connection error. Referral not done"
                    this.snackbarColor = "error";
                    this.snackbarTimeout = 10000;
                    this.snackbar = true;
                }
            }
        },
        battleInProgress() {
            this.snackbarText = "Battle in progress! Please wait...";
            this.snackbarColor = "info";
            this.snackbarTimeout = 2000;
            this.snackbar = true;
        },
        payoutInProgress() {
            this.snackbarText = "Payout in progress. Please wait a few more seconds...";
            this.snackbarColor = "info";
            this.snackbarTimeout = 2000;
            this.snackbar = true;
        },
        gameOver() {
            this.snackbarText = "Game over. Be ready for the next run";
            this.snackbarColor = "info";
            this.snackbarTimeout = 2000;
            this.snackbar = true;
        },
    },
    computed: {
        myBets: function () {
            let pBets = this.personalBets.sort(this.compare)
            return pBets.filter((bet) => bet.gameType == this.gameType)
        },
        latestBets: function () {
            return this.bets.sort(this.compare)
        },
        currentCountry: {
            get() {
                return this.$store.state.selectedCountry
            },
            set(value) {
                this.$store.commit('setSelectedCountry', value)
            }
        },
        account() {
            this.$rtdbBind('personalBets', db.ref('public/bets').orderByChild('from').equalTo(this.$store.state.loggedInAccount))
            return this.$store.state.loggedInAccount
        },
        isMobile: function () {
            return this.$store.state.isMobile
        },
    },
    watch: {
        myBets: function () {
            let _this = this
            if (this.currentTxId !== null) {
                const txId = this.currentTxId
                window.tronWeb.trx.getTransaction(txId).then((tx) => {
                    if (tx.ret[0].contractRet == "SUCCESS") {
                        _this.snackbarColor = "success";
                        _this.snackbarText =
                            `Successfully placed a bet on ${_this.universalMap(_this.currentCountry)}!`;
                        if (window.location.pathname.startsWith('/ref')) {
                            _this.postReferral(txId)
                        }
                    } else {
                        _this.snackbarText = tx.ret[0].contractRet;
                        _this.snackbarColor = "error";
                    }
                    _this.snackbar = true
                    _this.isWaitingForConfirm = false
                })
                this.currentTxId = null
            }
        }
    },
}