import Vue from 'vue'

import './plugins/vuetify'
import './plugins/firebase'
import router from './router'
import store from './store'
import mapping from './assets/mapping.js'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App.vue'
import VueAnalytics from 'vue-analytics'

Vue.config.productionTip = false;

// Remember to comment or switch to false before running into production
Vue.config.devtools = true;

Vue.use(VueAnalytics, {
  id: 'UA-141721214-1'
});

Vue.mixin({
  methods: {
    universalMap(id, to) {
      try {
        switch (to) {
          case 'name':
            return mapping[id]['name'];
          case 'charId':
            return mapping[id]['charId'];
          case 'numberId':
            for (var i = mapping.length - 1; i >= 0; i--) {
              if (mapping[i]['name'] === id) {
                return i
              }
            }
            break;
          default:
            return mapping[id]['name'];
        }
      } catch (error) {}
    },

    async loginToFb() {
      await FB.getLoginStatus((response) => {
        if (response.status != 'connected') {
          FB.login((response) => {
            if (response.authResponse) {
              FB.api('/me', (response) => {
                store.commit('setFbId', response.id)
                store.commit('setFbUserName', response.name)
              });
              store.commit('setFbAcessToken', response.authResponse.accessToken)
            } else {
              throw ("User not logged in with facebook")
            }
          },{scope:'public_profile,email,user_link'})
        }
        if (response.status == 'connected') {
          if (response.authResponse && (store.state.fbUserName == null || store.state.fbAcessToken == null)) {
            FB.api('/me', (response) => {
              store.commit('setFbUserName', response.name)
            });
            store.commit('setFbAcessToken', response.authResponse.accessToken)
          }
        }
      })
    },
    logoutFb() {
      console.log("logging out")
      FB.logout(function (response) {
        console.log("logged out")
        store.commit('setFbUserName', null)
        store.commit('setFbAcessToken', null)
      });
    }
  }
});

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App),
  iconfont: 'fab'
}).$mount('#app');