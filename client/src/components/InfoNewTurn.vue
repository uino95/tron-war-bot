<template>
  <v-flex>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text " v-if="infoNewTurn != null && data.serverStatus == 200"
      transition="scale-transition" color="#2c3e50">
      <v-card-text class="pa-0 text-xs-center ">
        <core-timer />
      </v-card-text>
      <v-card-text class="pa-0 text-xs-center "> Latest conquest: Turn {{infoNewTurn.turn}} -
        <b>{{universalMap(infoNewTurn.conquest[0])}}</b> has conquered
        <b>{{universalMap(infoNewTurn.conquest[1])}}</b>
        previously owned by <b>{{universalMap(infoNewTurn.prev)}}</b></v-card-text>
    </v-card>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text" v-else-if="infoNewTurn != null && data.serverStatus == 300"
      transition="scale-transition" color="error">
      <v-card-text class="pa-0 text-xs-center">
        <b>Battle in Progress</b>
      </v-card-text>
    </v-card>
    <v-card class="mt-0 ml-2 mr-2 pb-2 pt-2 card-rounded white--text" v-else-if="infoNewTurn != null && data.serverStatus == 500"
      transition="scale-transition" color="blue">
      <v-card-text class="pa-0 text-xs-center">
        Battle in Progress
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
      history: db.ref('public/history').orderByChild('turn'),
      data: db.ref('public/data')
    },
    computed: {
      infoNewTurn: function () {
        let infoTurn = this.history.slice().reverse()[0]
        return infoTurn
      }
    },
  }
</script>

<style scoped>
  .card-rounded {
    border-bottom-left-radius: 40px;
    border-bottom-right-radius: 40px;
  }
</style>