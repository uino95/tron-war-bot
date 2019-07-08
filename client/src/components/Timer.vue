<template>
  <v-text-field v-if="isTurnTimer" :value="timerValue" label="Next Turn" outline disabled></v-text-field>
</template>

<script>
import {
  db
}
from '../plugins/firebase';

export default {
    data: () => ({
      timerValue: "00:01",
      info: {},
    }),
    firebase:{
      info: db.ref('data')
    },
    props: {
      isTurnTimer: Boolean,
      isRunTimer: Boolean,
    },
    methods: {
      setTimer: function() {
        let nextEvent = this.info.nextTurnTime || 0;
        let now = new Date().getTime();
        let minsUntilNextEvent = nextEvent - now + 3600000;
        let timer = new Date(minsUntilNextEvent);
        if (minsUntilNextEvent <= 0) {
          this.timerValue = this.isTurnTimer ? '#' + (this.info.nextTurn || ' loading...') + ` in 00:00` : `00:00`
        } else {
          let min = timer.getMinutes();
          let sec = timer.getSeconds();
          sec = sec < 10 ? `0${sec}` : sec;
          min = min < 10 ? `0${min}` : min;
          this.timerValue = this.isTurnTimer ? '#' + (this.info.nextTurn || ' loading...') + ` in ${min}:${sec}` : `${min}:${sec}`
        }
      },
      startTimer: function() {
        this.intervalId = setInterval(() => {
          this.setTimer();
        }, 1000);
      },
    },
}
</script>

<style>
</style>
