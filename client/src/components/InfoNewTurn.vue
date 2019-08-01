<template>
  <v-layout v-if="infoNewTurn != null" style="background-color:rgb(158, 158, 158);">
    <v-alert
      v-model="showAlert"
      dismissible
      transition="scale-transition"
      color="#2c3e50"
    >
      {{"New conquest: Turn " + infoNewTurn.turn + " - " + universalMap(infoNewTurn.conquest[0]) + " has conquered " + universalMap(infoNewTurn.conquest[1])}}
    </v-alert>
  </v-layout>
</template>

<script>
  import {
    db
  }
    from '../plugins/firebase';

  export default {
    data: () => ({
      showAlert: false,
      history: []
    }),
    firebase: {
      history: db.ref('history').orderByChild('turn')
    },
    computed: {
      infoNewTurn: function () {
        let infoTurn = this.history.slice().reverse()[0]
        if(infoTurn != null){
          this.showAlert = true
          return infoTurn
        }
      }
    }
  }
</script>

<style scoped>

</style>