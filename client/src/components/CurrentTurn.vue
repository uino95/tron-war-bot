<template>
  <v-text-field :value="timerValue" label="Current Turn" outline disabled></v-text-field>
</template>

<script>
  import { db } from '../plugins/firebase';

  export default {
    data: () => ({
      info: {},
    }),
    firebase: {
      info: db.ref('data')
    },
    computed:{
      timerValue: function() {
        if(this.info.currentTurn == null) return "# loading..."
        else return "# " + this.info.turn;
      }
    }
  }
</script>

<style>
</style>
