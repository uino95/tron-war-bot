<template>
<v-text-field v-if="isTurnTimer" :value="timerValue" label="Next Turn" outline readonly></v-text-field>
<v-chip disabled dark v-else-if="isRunTimer">{{this.timerValue}}</v-chip>
<div v-else>{{this.timerValue}} </div>

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
    info: db.ref('data')
  },
  props: {
    isTurnTimer: Boolean,
    isRunTimer: Boolean,
  },
  methods: {
    updateRunTimer: function() {
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = this.info.turnTime - now;

      // Time calculations for days, hours, minutes and seconds
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      hours = hours < 10 ? `0${hours}` : hours
      minutes = minutes < 10 ? `0${minutes}` : minutes
      seconds = seconds < 10 ? `0${seconds}` : seconds

      // If the count down is finished, write some text
      if (distance < 0) {
        this.timerValue = `00:00:00`
      } else {
        this.timerValue = `${hours}:${minutes}:${seconds}`
      }
      setTimeout(() => {
        this.updateRunTimer();
      }, 1000);
    },

    updateTurnTimer: function() {
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = this.info.turnTime - now;

      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      minutes = minutes < 10 ? `0${minutes}` : minutes
      seconds = seconds < 10 ? `0${seconds}` : seconds

      // If the count down is finished, write some text
      if (distance < 0) {
        this.timerValue = '#' + (this.info.turn || ' loading...') + ` in 00:00`
      } else {
        this.timerValue = '#' + (this.info.turn || ' loading...') + ` in ${minutes}:${seconds}`
      }
      setTimeout(() => {
        this.updateTurnTimer();
      }, 1000);
    },

    startTimer: function() {
      if (this.isTurnTimer) {
        this.intervalId = setTimeout(() => {
          this.updateTurnTimer();
        }, 1000);
      } else {
        this.intervalId = setTimeout(() => {
          this.updateRunTimer();
        }, 1000);
      }
    },
  },
  mounted(){
    this.startTimer();
  }

}
</script>

<style>
</style>
