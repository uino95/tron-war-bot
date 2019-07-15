<template>
<v-text-field :value="balance" label="Your Balance" :color="color" outline disabled></v-text-field>
</template>

<script>
export default {
  data: () => ({
    text: '',
    color: 'red'
  }),
  computed: {
    balance() {
      let b = this.$store.state.accountBalance
      if (b < 0) {
        this.text = 'log in first'
      } else {
        this.text = b + ' TRX'
      }
    }
  }
}
</script>
