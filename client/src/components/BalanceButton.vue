<template>
  <v-text-field :value="balance" label="Your Balance" :background-color="borderColor" outline readonly></v-text-field>
</template>

<script>
export default {
  computed: {
    balance() {
      let b = this.$store.state.accountBalance;
      if (b < 0) {
        return "log in first";
      } else {
        return b + " TRX";
      }
    },
    borderColor() {
      let b = this.$store.state.accountBalance;
      if (b < 0) {
        return "red";
      } else {
        return "default";
      }
    }
  }
};
</script>
