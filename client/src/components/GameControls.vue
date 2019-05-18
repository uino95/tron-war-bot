<template>
<v-tabs centered color="grey lighten-1" dark icons-and-text>
  <v-tabs-slider color="red lighten-4"></v-tabs-slider>

  <v-tab href="#tab-1">
    Recents
    <v-icon>phone</v-icon>
  </v-tab>

  <v-tab href="#tab-2">
    Favorites
    <v-icon>favorite</v-icon>
  </v-tab>

  <v-tab href="#tab-3">
    Nearby
    <v-icon>account_box</v-icon>
  </v-tab>

  <v-tab-item v-for="i in 3" :key="i" :value="'tab-' + i">
    <v-card flat>
      <v-card-text>{{ text }}</v-card-text>
    </v-card>
  </v-tab-item>
  
</v-tabs>
</template>

<script>
export default {
  data: () => ({
    text: "ciaooooooooooo nsakfdjed skndlej deandnlnd jdnew",
    ecosystem: [{
        text: 'vuetify-loader',
        href: 'https://github.com/vuetifyjs/vuetify-loader'
      },
      {
        text: 'github',
        href: 'https://github.com/vuetifyjs/vuetify'
      },
      {
        text: 'awesome-vuetify',
        href: 'https://github.com/vuetifyjs/awesome-vuetify'
      }
    ]
  })
}
</script>

<style>

</style>
