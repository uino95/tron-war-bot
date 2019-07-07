<template>
<v-card flat>
  <v-toolbar color="secondary" dark flat>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn flat replace to="/betnext">
        <v-icon>attach_money</v-icon> Bet Next
      </v-btn>
      <v-btn flat replace to="/betfinal">
        <v-icon>public</v-icon> Bet Final
      </v-btn>
      <v-btn flat replace to="/stats">
        <v-icon>poll</v-icon> Stats
      </v-btn>
    </v-toolbar-items>
    <v-spacer></v-spacer>
  </v-toolbar>
  <v-card class="card--flex-toolbar">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-card>
</v-card>
</template>

<script>
export default {

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
