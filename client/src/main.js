import Vue from 'vue'

import './plugins/firebase'
import './plugins/vuetify'
import './plugins/vueAsync'
import mapping from './assets/mapping.js'

import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false;

Vue.mixin({
    methods: {
        universalMap(id, to) {
            switch (to) {
                case 'name':
                    return mapping[id]['name'];
                case 'charId':
                    return mapping[id]['charId'];
                case 'numberId':
                    for (var i = mapping.length - 1; i >= 0; i--) {
                        if (mapping[i]['charId'] === id) {
                            return i
                        }
                    }
                    break;
                default:
                    return mapping[id]['name'];
            }
        }
    }
});

new Vue({
    render: h => h(App),
    iconfont: 'fab'
}).$mount('#app');
