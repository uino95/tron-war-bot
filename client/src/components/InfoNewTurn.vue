<template>
    <v-alert class="mt-0 card-rounded" v-if="infoNewTurn != null && showAlert==true"
      v-model="showAlert"
      transition="scale-transition"
      color="#2c3e50"
    >
      <div class="text-xs-center"> Latest conquest: Turn  {{infoNewTurn.turn}}  - <b>{{universalMap(infoNewTurn.conquest[0])}}</b> has conquered  <b>{{universalMap(infoNewTurn.conquest[1])}}</b> previously owned by <b>{{universalMap(infoNewTurn.prev)}}</b>
      </div>
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
  .card-rounded {
    height: 40%;
    width: 95%;
    border-bottom-left-radius: 40px;
    border-bottom-right-radius: 40px;
  }
</style>