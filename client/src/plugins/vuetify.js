import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#001537',
    secondary: '#4b636e',
    accent: '#FFF15C',
    error: '#ff5252',
    warning: '#AAAAAA',
    info: '#F9F3C5',
    success: '#4caf50'
  }
})
