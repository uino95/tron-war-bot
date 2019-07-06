<template>
<!-- <v-tabs centered color="secondary" dark icons-and-text>
  <v-tabs-slider color="secondary"></v-tabs-slider>
  <v-tab href="#tab-1">
    Bet Panel
    <v-icon>attach_money</v-icon>
  </v-tab>
  <v-tab href="#tab-2">
    Current Run Stats
    <v-icon>bar_chart</v-icon>
  </v-tab> -->
<v-card flat>
  <v-toolbar color="secondary" dark extended flat>
    <v-toolbar-items>
      <v-btn flat replace to="/betnext">
        <v-icon>attach_money</v-icon>
        Bet Next
      </v-btn>
      <v-btn flat replace to="/stats">Stats</v-btn>
      <v-btn flat replace to="/betnext">Link Three</v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <v-card class="card--flex-toolbar">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-card>

  </v-card flat>
</template>

<script>
export default {

}
</script>

<style>
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

.card--flex-toolbar {
  margin-top: -32px;
}
</style>
