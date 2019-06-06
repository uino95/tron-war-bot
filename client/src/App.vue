<template>
    <v-app id="keep">
        <v-navigation-drawer v-model="drawer" fixed clipped class="secondary" app dark>
            <v-list dense class="secondary" dark>
                <template v-for="(item, i) in items">
                    <v-layout v-if="item.heading" :key="i" row align-center>
                        <v-flex xs6>
                            <v-subheader v-if="item.heading">
                                {{ item.heading }}
                            </v-subheader>
                        </v-flex>
                    </v-layout>
                    <v-divider v-else-if="item.divider" :key="i" dark class="my-3"></v-divider>
                    <v-list-tile v-else :key="i" @click="showModal(i)">
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
        <v-toolbar color="primary" app fixed clipped-left>
            <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
            <v-avatar class="ml-3">
              <img src="/img/logo.jpg">
            </v-avatar>

            <span class="headline ml-3 mr-5">Tron<span class="font-weight-light">WarBot</span></span>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-content>
            <v-container fluid fill-height fill-width class="grey pa-0 ma-0">
                <v-layout justify-center align-center>
                    <v-flex>

                        <GameMap @select="selectedCountryChild"/>
                        <GameControls
                            v-bind:current-country = "selected_country"
                            />
                        <modal
                            @close="closeModal"
                            v-bind:isModalVisible = "isModalVisible"
                            v-bind:header-tile = "items[itemClicked].text"
                            />
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
        <!-- <v-footer fixed class="grey" app>
          <span>&copy; 2019</span>
        </v-footer> -->
    </v-app>
</template>

<script>

    /////////////////////// import component //////////////////////////

    import GameMap from './components/GameMap'
    import GameControls from './components/GameControls'
    import Modal from './components/Modal'

    export default {

        name: 'App',
        components: {
            GameControls,
            GameMap,
            Modal
        },
        data: () => ({
            drawer: null,
            isModalVisible: false,
            itemClicked: 4,
            tronLinkStatus: null,
            selected_country: null,
            items: [{
                heading: 'Wallet Login'
            },
                {
                    icon: 'lightbulb_outline',
                    text: 'Login with Wallet',
                },
                {
                    divider: true
                },
                {
                    heading: 'Help'
                },
                {
                    icon: 'help',
                    text: 'How To Play'
                },
                {
                    icon: 'help',
                    text: 'FAQ'
                },
                {
                    icon: 'add',
                    text: 'Whitepaper'
                },
                {
                    divider: true
                },
                {
                    heading: 'Social'
                },
                {
                    icon: 'archive',
                    text: 'Facebook Page'
                },
                {
                    icon: 'delete',
                    text: 'Telegram'
                }
            ]
        }),
        props: {
            source: String
        },
        methods:{
            showModal(item){
                this.isModalVisible = true;
                this.itemClicked = item;
            },
            closeModal() {
                this.isModalVisible = false;
            },
            selectedCountryChild(country){

                this.selected_country = country;
            }
        },
        mounted(){
        }
    }
</script>

<style lang="stylus">
    #keep .v-navigation-drawer__border {
        display: none;
    }
</style>
