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
      info: db.ref('public/data')
    },
    computed:{
      timerValue: function() {
        if(this.info.turn == null) return "loading..."
        else{
          let turn = this.info.turn - 1
          return "# " + turn;
        }
      }
    }
  }
</script>

<style>
</style>
