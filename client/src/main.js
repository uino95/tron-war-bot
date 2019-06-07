import Vue from 'vue'

import './plugins/firebase'
import './plugins/vuetify'
import './plugins/vueAsync'

import App from './App.vue'

Vue.config.productionTip = false;

Vue.mixin({
  methods: {
    	universalMap(){
    		
    	}
    }
})

new Vue({
    render: h => h(App),
}).$mount('#app');
