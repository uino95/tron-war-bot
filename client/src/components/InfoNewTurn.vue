<template>
    <v-alert class="mt-0" v-if="infoNewTurn != null && showAlert==true"
      v-model="showAlert"
      transition="scale-transition"
      color="primary_next_tab"
    >
      New conquest: Turn  <b>{{infoNewTurn.turn}}</b>  - <b>{{universalMap(infoNewTurn.conquest[0])}}</b> has conquered  <b>{{universalMap(infoNewTurn.conquest[1])}}</b> previously owned by <b>{{universalMap(infoNewTurn.prev)}}</b>
    </v-alert>
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
      history: db.ref('public/history').orderByChild('turn')
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