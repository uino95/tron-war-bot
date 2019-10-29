<template>
    <v-app id="keep">
        <loading :active.sync="loading"
                 color="#ffffff"
                 :opacity="1"
                 background-color="#001537"
                 :is-full-page="true">
        </loading>

        <v-navigation-drawer v-model="drawer" fixed clipped class="secondary" app dark>
            <v-list dense class="secondary" dark>
                <template v-for="(item, i) in menuItems">
                    <v-layout v-if="item.heading" :key="i" row align-center>
                        <v-flex xs6>
                            <v-subheader v-if="item.heading">
                                {{ item.heading }}
                            </v-subheader>
                        </v-flex>
                    </v-layout>
                    <v-divider v-else-if="item.divider" :key="i" dark class="my-3"></v-divider>
                    <v-list-tile v-else-if="!item.link && i !== 1" :key="i" @click.stop="showModal(i)">
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title class="grey--text">
                                <span>{{ item.text }}</span>
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile v-else-if="i !== 1" :key="i" @click="openLink(item.body)">
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title class="grey--text">
                                {{ item.text }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </template>
            </v-list>
        </v-navigation-drawer>

        <v-toolbar color="#2c3e50" app fixed clipped-left>
            <v-toolbar-side-icon @click="drawer = !drawer" style="color: white"></v-toolbar-side-icon>

            <v-avatar class="ml-3">
                <img src="/img/logo.png">
            </v-avatar>

            <span class="headline ml-3 mr-5" style="color: white">Tron<span class="font-weight-light"
                                                                            style="color: white">WarBot</span></span>
            <v-spacer></v-spacer>
            <v-toolbar-items v-if="$store.state.loggedInAccount!=null">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }" class="hidden-sm-and-down">
                        <v-btn flat dark v-on="on">
                            Account
                        </v-btn>
                    </template>
                    <v-list class="secondary" dark>
                        <v-list-tile>
                            <v-list-tile-avatar>
                                <v-icon>fa-paper-plane</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-title v-text="this.$store.state.loggedInAccount"></v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-avatar tile>
                                <img src="https://cdn.coinranking.com/behejNqQs/trx.svg" alt="trx">
                            </v-list-tile-avatar>
                            <v-list-tile-title v-text="this.$store.state.accountBalance"></v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-avatar>
                                <img src="/img/logo.png" alt="war"/>
                            </v-list-tile-avatar>
                            <v-list-tile-title v-text="this.$store.state.currentAddressWarBalance"></v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-toolbar-items>
            <v-toolbar-items v-else class="hidden-sm-and-down">
                <v-btn @click.stop="showModal(1)" flat dark>
                    Login
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>


        <v-content>
            <v-container fluid fill-height fill-width class="grey pa-0 ma-0">
                <v-layout justify-center align-center>
                    <v-flex>
                        <div class="btn-mobile" round v-if="this.$store.state.isMobile && noShowMap">
                            <v-btn v-on:click="showMobileMap()"> Load Map</v-btn>
                        </div>
                        <div v-else-if="!noShowMap">
                            <core-game-map v-bind:style="{ display: toDisplay }"></core-game-map>
                        </div>
                        <core-game-controls @showModal="showModal(1)"></core-game-controls>
                        <core-modal v-model="isModalVisible" :header-tile="menuItems[itemClicked].text"
                                    :body-tile="menuItems[itemClicked].body"></core-modal>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>


<script>
    import pollForUpdate from './utils/pollForUpdate'
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';

    export default {
        name: 'App',
        components: {Loading},
        data: () => ({
            loading: true,
            noShowMap: true,
            toDisplay: 'none',
            drawer: null,
            isModalVisible: false,
            itemClicked: 4,
            menuItems: [
                {
                    heading: 'My Info'
                },
                {
                    icon: 'fa-paper-plane',
                    text: 'Login With Tronlink',
                    link: false,
                    login: true
                },
                {
                    icon: 'people',
                    text: 'Referral',
                    link: false,
                    body: 'WIP'
                },
                {
                    icon: 'attach_money',
                    text: 'WAR Supply',
                    link: false,
                    body: 'WIP'
                },
                {
                    divider: true
                },
                {
                    heading: 'Help'
                },
                {
                    icon: 'fa-gamepad',
                    text: 'How To Play',
                    link: false,
                    body: 'WIP'
                },
                {
                    icon: 'help',
                    text: 'FAQ',
                    link: false,
                    body: 'WIP'
                },
                {
                    icon: 'fa-hands-helping',
                    text: 'Partners',
                    link: false,
                    body: 'WIP'
                },
                /*      {
                        icon: 'assignment',
                        text: 'Whitepaper',
                        link: false,
                        body: 'WIP'
                      },*/
                {
                    divider: true
                },
                {
                    heading: 'Social'
                },
                {
                    icon: 'fab fa-facebook-square',
                    text: 'Facebook Page',
                    link: true,
                    body: "https://www.facebook.com/TronWarBot/"
                },
                {
                    icon: 'fab fa-telegram',
                    text: 'Telegram',
                    link: true,
                    body: "https://t.me/joinchat/J8ocIxZoXsD4stn4nxg24A"
                },
                {
                    icon: 'fab fa-twitter',
                    text: 'Twitter',
                    link: true,
                    body: "https://twitter.com/TronWarBot_"
                },
                {
                    icon: 'fab fa-instagram',
                    text: 'Instagram',
                    link: true,
                    body: "https://www.instagram.com/tronwarbot"
                },
                {
                    divider: true
                },
                {
                    heading: 'Social'
                },
                {
                    icon: 'fab fa-facebook-square',
                    text: 'Become an Ambassador',
                    link: false,
                    body: "WIP"
                },


            ]
        }),
        methods: {
            showModal(item) {
                this.isModalVisible = true;
                this.itemClicked = item;
            },
            closeModal() {
                this.isModalVisible = false;
            },
            openLink(link) {
                window.open(link, "_blank")
            },
            track() {
                this.$ga.page('/')
            },
            showMobileMap() {
                this.loading = true
                this.noShowMap = false
                this.startLoading()
            },
            startLoading() {
                setTimeout(() => {
                    this.loading = false;
                    this.toDisplay = "flex"
                }, 4000)
            },
            isMobile() {
                var check = false;
                (function (a) {
                    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw(n|u)|c55\/|capi|ccwa|cdm|cell|chtm|cldc|cmd|co(mp|nd)|craw|da(it|ll|ng)|dbte|dcs|devi|dica|dmob|do(c|p)o|ds(12|d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(|_)|g1 u|g560|gene|gf5|gmo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(a.substr(0, 4))) check = true;
                })(navigator.userAgent || navigator.vendor || window.opera);
                return check;
            }
        },
        beforeCreate() {
            pollForUpdate()
        },
        mounted() {
            this.$store.commit('setIsMobile', this.isMobile());
            this.$root.$on('map_loaded', () => {
                this.loading = false;
                this.toDisplay = "flex"
            });
            if (!this.$store.state.isMobile) {
                this.noShowMap = false
            } 
            if (this.$store.state.isMobile){
                this.$root.$on('stats_loaded', () => {
                    this.loading = false;
                    this.toDisplay = "flex"
                    console.log('all loaded')
                });
            }
            this.track()
        }
    }
</script>
<style lang="stylus">
    #keep .v-navigation-drawer__border {
        display: none;
    }

    .loader-container {
        widht: 100%;
        height: 600px;
        text-align: center;
        vertical-align: middle;
    }

    .loader-container div {
        margin-top: 220px;
    }

    .btn-mobile {
        text-align: center;
    }
</style>
