<template>
  <v-card flat>
    <v-toolbar color="secondary" dark flat >
      <!-- <v-tabs  dark color="secondary" show-arrows fixed-tabs slider-color="primary" v-model="activeMainTab">
        <v-tab v-for="tab of tabs" :key="tab.name" flat replace :to="tab.path">
          <v-icon :color="tab.color">{{tab.symbol}}</v-icon> {{tab.name}}
        </v-tab>
      </v-tabs> -->
      <v-tabs dark color="secondary" show-arrows fixed-tabs slider-color="primary"  >
        <v-tab flat replace to="/cohesion">
          <v-icon color="primary_cohesion_tab">control_point</v-icon> Cohesion
        </v-tab>
        <v-tab flat replace to="/stats">
          <v-icon color="primary_stats_tab">poll</v-icon> Standings
        </v-tab>
        <v-tab flat replace to="/history">
          <v-icon color="primary_history_tab">history</v-icon> History
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <!-- <v-tabs hide-slider v-else dark color="light_secondary"  show-arrows fixed-tabs >
      <v-tab flat replace to="/betfinal">
        <v-icon color="primary_final_tab">public</v-icon> Final
      </v-tab>
      <v-tab flat replace to="/betbattle">
        <v-icon color="primary_battle_tab">games</v-icon> Battle
      </v-tab>
      <v-tab flat replace to="/betnext">
        <v-icon color="primary_next_tab">skip_next</v-icon> Next
      </v-tab>
    </v-tabs> -->

    <v-card style="background-color:rgb(158, 158, 158);">
      <core-info-new-turn></core-info-new-turn>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-card>
  </v-card>
</template>

<script>
  export default {
    data: () => ({
      // tabs:[
      //   {
      //     name: 'stats',
      //     path: 'stats',
      //     color: 'primary_stats_tab',
      //     symbol: 'poll'
      //   },
      //   {
      //     name: 'bets',
      //     path: 'betbattle',
      //     color: 'primary_battle_tab',
      //     symbol: 'attach_money'
      //   }
      // ],
    }),
    // computed:{
    //   activeMainTab:{
    //     get(){
    //       if (this.$route.name == "home" || this.$route.name == 'stats' || this.$route.name == 'cohesion' || this.$route.name == 'history') return this.tabs[0].path
    //       return this.tabs[1].path
    //     },
    //     set(value){
    //     }
    //   }
    // }
  }
</script>

<style>
  .outerTabContainer {
    max-width: 1200px;
  }

  .gameTab {
    padding: 0px;
  }

  .gameTabHeader {
    padding: 16px 16px 0 16px;
  }

  .gameTabDivider {
    margin: 0px 16px 0px 16px;
  }

  .gameTabContent {
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .greenText {
    color: #558b2f;
  }

  .redText {
    color: #b71c1c;
  }
</style>