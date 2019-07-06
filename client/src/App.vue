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
        <v-list-tile v-else-if="!item.link" :key="i" @click.stop="showModal(i)">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">
              <span v-if="item.login && $store.state.loggedInAccount!=null">
                {{($store.state.loggedInAccount).substring(0,10)}}...
              </span>
              <span v-else>
                {{ item.text }}
              </span>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-else :key="i" @click="openLink(item.body)">
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
      <img src="/img/logo.png">
    </v-avatar>

    <span class="headline ml-3 mr-5">Tron<span class="font-weight-light">WarBot</span></span>
    <v-spacer></v-spacer>
  </v-toolbar>
  <v-content>
    <v-container fluid fill-height fill-width class="grey pa-0 ma-0">
      <v-layout justify-center align-center>
        <v-flex>
          <core-game-map @select="selectedCountryChild" />
          <core-game-controls v-bind:current-country="selected_country" @showModal="showModal(1)" />
          <core-modal v-model="isModalVisible" v-bind:header-tile="items[itemClicked].text" v-bind:body-tile="items[itemClicked].body" />
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</v-app>
</template>
<script>
/////////////////////// import component //////////////////////////
export default {
  name: 'App',
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
        icon: 'assignment',
        text: 'Whitepaper',
        link: true,
        body: '/files/WhitePaper.pdf'
      },
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
        body: "https://twitter.com/tronwarbot"
      }
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
    selectedCountryChild(country) {

      this.selected_country = country;
    },
    openLink(link) {
      window.open(link, "_blank")
    },
    track() {
      this.$ga.page('/')
    },
    display() {
      this.toDisplay = "flex"
      this.toDisplay1 = 'none'
    },
    async fetchAccount() {
      const account = await window.tronWeb.trx.getAccount();
      const accountAddress = account.address; // HexString(Ascii)
      const accountAddressInBase58 = window.tronWeb.address.fromHex(accountAddress); // Base58
      this.$store.commit('setLoggedInAccount', {
        accountAddress: accountAddressInBase58
      })
    },
    async fetchBalance() {
      const balanceInSun = await window.tronWeb.trx.getBalance(); //number
      const balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
      // const changeBackToSun = window.tronWeb.toSun(balanceInTRX); //string
      this.$store.commit('setAccountBalance', {
        accountBalance: balanceInTRX
      })
    }
  },
  mounted() {
    this.track()
    setTimeout(() => {
      this.loading = false
      this.toDisplay = "flex"
      console.log("ok now display it ")
    }, 4000)
    window.onmessage = (event) => {
      // Waiting for that message.
      if (event.data.message && event.data.message.action === 'setAccount') {
        this.fetchBalance();
        this.fetchAccount();
      }
    };
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
}
</style>
