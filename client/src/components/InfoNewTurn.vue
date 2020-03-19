<template>
  <v-flex>
    <v-card
      class="mt-0 pb-2 pt-2 white--text"
      v-if="data.serverStatus == 200"
      transition="scale-transition"
      color="secondary"
      light
    >
      <v-card-text class="pa-0 mb-2 text-xs-center ">
        <core-timer></core-timer>
      </v-card-text>
      <!-- <v-container v-if="currentBattle != null">
        <v-card-text v-if="currentBattle.civilWar == 1" class=" pa-0 text-xs-center ">
          Current Turn: {{history[0].turn}} -
          <b>{{universalMap(currentBattle.o)}}</b> Raise Against
          <b>{{universalMap(currentBattle.d)}}</b>
          <br>
          <v-btn class="mt-0 mb-0" color="primary_battle_tab" fab  dark small v-on:click="goToBet(currentBattle.o,1)"> 1 </v-btn>
          <v-btn class="mt-0 mb-0" color="primary_battle_tab" fab  dark small v-on:click="goToBet(241, 0)"> X </v-btn>
        </v-card-text>
        <v-card-text v-else class=" pa-0 text-xs-center "> Current Battle: <br />
          <b>{{universalMap(currentBattle.o)}}</b> VS
          <b>{{universalMap(currentBattle.d)}}</b>
          <br>
          <v-btn class="mt-0 mb-0" color="primary_battle_tab" fab dark small v-on:click="goToBet(currentBattle.o,1)"> 1 </v-btn>
          <v-btn class="mt-0 mb-0" color="primary_battle_tab" fab dark small v-on:click="goToBet(241, 0)"> X </v-btn>
          <v-btn class="mt-0 mb-0"  color="primary_battle_tab" fab  dark small v-on:click="goToBet(currentBattle.d,2)"> 2 </v-btn>
        </v-card-text>
      </v-container>-->

      <v-card-text class="pa-0 text-xs-center">
        <!-- Current Turn: {{turnData.turn}} - --->
        <b >
          <i>{{turnData.next.description}}</i>
        </b>
        <br />
        <v-layout class="mt-2 align-center justify-space-around row">
          <p class="mb-0 mr-2">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-icon class="mr-2" small dark>fa-skull-crossbones</v-icon>
                  <b class="hidden-xs-only">Fatality rate:</b>
                  {{(turnData.battle.fatality * 100).toFixed(2) + ' %'}}
                </div>
              </template>
              <span>Fatality Rate</span>
            </v-tooltip>
          </p>
          <p class="mb-0 mr-2">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-icon class="mr-2" small dark>fa-heart</v-icon>
                  <b class="hidden-xs-only">Recovery rate:</b>
                  {{(turnData.battle.recovery  * 100).toFixed(2) + ' %'}}
                </div>
              </template>
              <span>Recovery Rate</span>
            </v-tooltip>
          </p>
          <p class="mb-0 mr-2">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-icon class="mr-2" small dark>fa-random</v-icon>
                  <b class="hidden-xs-only">Trassmission rate:</b>
                  {{turnData.battle.transmission.toFixed(2)}}
                </div>
              </template>
              <span>Trasmission Rate</span>
            </v-tooltip>
          </p>
        </v-layout>
      </v-card-text>
    </v-card>
    <v-card
      class="mt-0 pb-2 pt-2  white--text"
      v-else-if="data.serverStatus == 300"
      transition="scale-transition"
      color="error"
    >
      <v-card-text class="pa-0 text-xs-center">
        <b>Contamination in Progress</b>
      </v-card-text>
    </v-card>
    <v-card
      class="mt-0 pb-2 pt-2  white--text"
      v-else-if="data.serverStatus == 500"
      transition="scale-transition"
      color="#2c3e50"
    >
      <v-card-text class="pa-0 title text-xs-center">Game Over</v-card-text>
      <v-card-text
        class="pa-0 pt-2 text-xs-center"
      >🎉 Winner of Covid Olympics is {{data.turnData.winner}} 🇱🇸 🎉</v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import { db } from "../plugins/firebase";

export default {
  data: () => ({
    data: {}
    // history: [],
  }),
  firebase: {
    // history: db.ref('public/history').orderByChild('turn').limitToLast(1),
    data: db.ref("public/data")
  },
  methods: {
    // goToBet(country, choice) {
    //   this.$store.commit('setSelectedCountry', country)
    //   this.$store.commit('setBattleChoice', choice)
    //   this.$router.push('/betBattle')
    // },
  },
  computed: {
    //   currentBattle: function(){
    //     if(this.history[0]) return this.history[0].next
    //     return null
    //   }
    turnData: function() {
      return this.data.turnData;
    }
  }
};
</script>

<style scoped>
.card-rounded {
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
}
</style>
