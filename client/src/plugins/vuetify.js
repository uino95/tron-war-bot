import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#263238',
    primary_dark: '#000a12',
    primary_light: '#4f5b62',
    text_primary: "#ffffff",

    background: "#455a64",

    secondary: '#eceff1',
    secondary_dark: '#babdbe',
    secondary_light: '#ffffff',
    text_secondary: "#000000",
    
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
