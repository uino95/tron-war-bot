import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#115C22',
    secondary: '#115C22',
    accent: '#FFF15C',
    error: '#ff5252',
    warning: '#AAAAAA',
    info: '#F9F3C5',
    success: '#4caf50'
  }
})
