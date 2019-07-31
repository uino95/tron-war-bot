<template>
  <v-text-field :value="timerValue" label="Current Turn" outline readonly></v-text-field>
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
        if(this.info.turn == null) return "loading..."
        else return "# " + this.info.turn;
      }
    }
  }
</script>

<style>
</style>
