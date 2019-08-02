<template>
  <v-container v-if="infoNewTurn != null && showAlert==true">
    <v-alert
      v-model="showAlert"
      transition="scale-transition"
      color="primary_next_tab"
    >
      {{"New conquest: Turn " + infoNewTurn.turn + " - " + universalMap(infoNewTurn.conquest[0]) + " has conquered " + universalMap(infoNewTurn.conquest[1]) + " previuously owned by " + universalMap(infoNewTurn.prev)}}
    </v-alert>
  </v-container>
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
        return infoTurn
      }
    },
    watch:{
      history: function() {
        this.showAlert = true
      }
    }
  }
</script>

<style scoped>

</style>