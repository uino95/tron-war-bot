import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#b71c1c',
    primary_dark: '#7f0000',
    primary_light: '#f05545',
    text_primary: "#ffa726",

    secondary: '#fff176',
    secondary_dark: '#cabf45',
    secondary_light: '#ffffa8',
    text_secondary: "#212121",
    
    accent: '#FFF15C',
    error: '#ff5252',
    warning: '#AAAAAA',
    info: '#0090f9',
    success: '#4caf50',

    // primary_final_tab: "#27ae60",
    // secondary_final_tab: "#FFFFFF",
    // primary_next_tab: "#5d4037",
    // secondary_next_tab: "#FFFFFF",
    // primary_stats_tab: "#e67e22",
    // secondary_stats_tab: "#FFFFFF",
    // primary_battle_tab: "#2980b9",
    // secondary_battle_tab: "#001542",
    // primary_cohesion_tab: "#d84315",
    // secondary_cohesion_tab: "#FFFFFF",
    // primary_history_tab: "#ffd54f",
    // secondary_history_tab: "#FFFFFF",
    facebook: "#4267b2"
  }
});
