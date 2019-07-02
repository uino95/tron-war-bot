<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
<v-tabs centered color="secondary" dark icons-and-text>
  <v-tabs-slider color="secondary"></v-tabs-slider>
  <v-tab href="#tab-1">
    Bet Panel
    <v-icon>attach_money</v-icon>
  </v-tab>
  <v-tab href="#tab-2">
    Current Run Stats
    <v-icon>bar_chart</v-icon>
  </v-tab>
  <v-tab-item id="tab-1">
    <BetNextTab :current-country="currentCountry" :balance="balance" :account="account"></BetNextTab>
  </v-tab-item>
  <v-tab-item id="tab-2">
    <StatsTab></StatsTab>
  </v-tab-item>
</v-tabs>
</template>

<script>
import BetNextTab from './BetNextTab'
import StatsTab from './StatsTab'

export default {
  components: {
    BetNextTab,
    StatsTab
  },
  props: ['currentCountry', 'balance', 'account'],
  data:() => ({


  })
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
</style>
