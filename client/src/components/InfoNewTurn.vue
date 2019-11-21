<template>
  <v-flex>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text " v-if="history != null && data.serverStatus == 200"
      transition="scale-transition" color="#2c3e50">
      <v-card-text class="pa-0 mb-2 text-xs-center ">
        <core-timer />
      </v-card-text>
      <!-- <v-card-text class="pa-0 text-xs-center "> Latest conquest: Turn {{history[0].turn}} -
        <b>{{universalMap(history[0].battle.o)}}</b> has conquered
        <b>{{universalMap(history[0].battle.dt)}}</b>
        previously owned by <b>{{universalMap(history[0].battle.d)}}</b></v-card-text> -->
      <v-container v-if="currentBattle != null">
        <v-card-text v-if="currentBattle.civilWar == 1" class=" pa-0 text-xs-center ">
          Current Battle: Turn {{history[0].turn}} -
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
      </v-container>

    </v-card>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text" v-else-if="history != null && data.serverStatus == 300"
      transition="scale-transition" color="error">
      <v-card-text class="pa-0 text-xs-center">
        <b>Battle in Progress</b>
      </v-card-text>
    </v-card>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text" v-else-if="history != null && data.serverStatus == 500"
      transition="scale-transition" color="#2c3e50">
      <v-card-text class="pa-0 title text-xs-center">
        Next run will start on 30/11
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import {
    db
  }
  from '../plugins/firebase';

  export default {
    data: () => ({
      data:{},
      history: [],
    }),
    firebase: {
      history: db.ref('public/history').orderByChild('turn').limitToLast(1),
      data: db.ref('public/data')
    },
    methods:{
      goToBet(country, choice) {
        this.$store.commit('setSelectedCountry', country)
        this.$store.commit('setBattleChoice', choice)
        this.$router.push('/betBattle')
      },
    },
    computed:{
      currentBattle: function(){
        if(this.history[0]) return this.history[0].next
        return null
      }
    }
  }
</script>

<style scoped>
  .card-rounded {
    border-bottom-left-radius: 40px;
    border-bottom-right-radius: 40px;
  }
</style>
