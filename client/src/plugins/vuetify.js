import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#4b636e',
    secondary: '#001537',
    accent: '#FFF15C',
    error: '#ff5252',
    warning: '#AAAAAA',
    info: '#0090f9',
    success: '#4caf50'
  }
});
