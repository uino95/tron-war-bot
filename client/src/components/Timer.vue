<template>
  <v-text-field v-if="isTurnTimer" :value="timerValue" label="Next Turn" outline readonly></v-text-field>
  <v-chip disabled dark v-else-if="isRunTimer">{{this.timerValue}}</v-chip>
  <div class="title " v-else> Next Turn: <b>{{this.timerValue}} </b></div>

</template>

<script>
  import {
    db
  }
  from '../plugins/firebase';

  export default {
    data: () => ({
      timerValue: "00:00",
      info: {},
    }),
    firebase: {
      info: db.ref('public/data')
    },
    props: {
      isTurnTimer: Boolean,
      isRunTimer: Boolean,
    },
    methods: {

      updateTurnTimer: function () {
        var now = new Date().getTime();

        if (this.info) {
          // Find the distance between now and the count down date
          var distance = this.info.turnTime - now;

          var days = Math.floor(distance / (1000 * 60 * 60 * 24));
          var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);

          minutes = minutes < 10 ? `0${minutes}` : minutes
          seconds = seconds < 10 ? `0${seconds}` : seconds

          // If the count down is finished, write some text
          console.log(distance)
          if (distance < 0) {
            this.timerValue = '#' + (this.info.turn || ' loading...') + ` in 00:00`
          } 
          else if(days > 0){
            this.timerValue = '#' + (this.info.turn || ' loading...') + ` in ${days} days, ${hours} hours, and ${minutes}:${seconds}`
          }
          else if(hours > 0){
            this.timerValue = '#' + (this.info.turn || ' loading...') + ` in ${hours} hours and ${minutes}:${seconds} `
          } else {
            this.timerValue = '#' + (this.info.turn || ' loading...') + ` in ${minutes}:${seconds}`
          }
        }
        setTimeout(() => {
          this.updateTurnTimer();
        }, 1000);
      },

      startTimer: function () {
        this.intervalId = setTimeout(() => {
          this.updateTurnTimer();
        }, 1000);
      },
    },
    mounted() {
      this.startTimer();
    }

  }
</script>

<style>
</style>