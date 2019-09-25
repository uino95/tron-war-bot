<template>
<v-card flat>
  <v-toolbar color="secondary" dark flat>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <!-- <v-btn flat replace to="/betfinal">
        <v-icon color="primary_final_tab">public</v-icon> Bet Final
      </v-btn> -->
      <v-btn flat replace to="/stats">
        <v-icon color="primary_stats_tab">poll</v-icon> Stats
      </v-btn>
      <v-btn flat replace to="/cohesion">
        <v-icon color="primary_next_tab">public</v-icon> Cohesion
      </v-btn>
      <!-- <v-btn flat replace to="/betnext">
        <v-icon color="primary_next_tab">attach_money</v-icon> Bet Next
      </v-btn>
      <v-btn flat replace to="/betbattle">
        <v-icon color="primary_next_tab">attach_money</v-icon> Bet Battle
      </v-btn> -->
    </v-toolbar-items>
    <v-spacer></v-spacer>
  </v-toolbar>
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
  components: {}
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
