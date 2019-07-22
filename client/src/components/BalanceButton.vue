<template>
<v-text-field :value="balance" label="Your Balance" :color="color" outline disabled></v-text-field>
</template>

<script>
export default {
  data: () => ({
    color: 'red'
  }),
  computed: {
    balance() {
      let b = this.$store.state.accountBalance
      if (b < 0) {
        return 'log in first'
      } else {
        return b + ' TRX'
      }
    }
  }
}
</script>
