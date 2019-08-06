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
    success: '#4caf50',
    primary_final_tab: "#27ae60",
    secondary_final_tab: "#FFFFFF",
    primary_next_tab: "#2980b9",
    secondary_next_tab: "#FFFFFF",
    primary_stats_tab: "#e67e22",
    secondary_stats_tab: "#FFFFFF",
  }
});
