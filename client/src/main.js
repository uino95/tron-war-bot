import Vue from 'vue'

import './plugins/vuetify'
import './plugins/firebase'
import router from './router'
import store from './store'
import mapping from './assets/mapping.js'
import axios from 'axios'
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
  localStorage: window.localStorage,
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

    async loggedInFb() {
      let fbAcessToken = localStorage.getItem('fbAcessToken')
      console.log('fbAcessToken ',fbAcessToken)
      if( fbAcessToken == null){
        console.log('token not valid you have logout before or neve logged in before')
        this.cleanFbStatus()
        return false
      }
      if (fbAcessToken != null) {
        console.log('got a fbAccesToken, checking with api its validity')
        let fbUser = await axios.get("https://graph.facebook.com/v4.0/me?access_token=" + fbAcessToken + "&fields=id,name,link").catch(()=>{
          console.log("something went wrong")
          console.error
          this.cleanFbStatus()
          return false
        })
        if(fbUser.status != 200){
          console.log('acesstoken expired or something went wrong')
          this.cleanFbStatus()
          return false;
        }
        if (fbUser.status == 200) {
          let fb = {
            fbAcessToken: localStorage.getItem('fbAcessToken'),
            fbId: localStorage.getItem('fbId'),
            fbUserName: localStorage.getItem('fbUserName'),
            fbLink: localStorage.getItem('fbLink'),
            loggedIn: true
          }
          console.log('token valid, here it is your information: ', fb)
          store.commit('setFbStatus', fb)
          return true;
        }
      }
    },

    async loginToFb() {
      let loggedIn = await this.loggedInFb()
      console.log('loggedIn: ',loggedIn)
      if (!loggedIn) {
        console.log('not logged in yet, proceed to Login')
        FB.login((response) => {
          console.log("first response from login is: ", response)
          if (response.authResponse) {
            FB.api('/me?fields=link,name', (response) => {
              console.log("response from api is: ", response)
              localStorage.setItem('fbId', response.id)
              localStorage.setItem('fbUserName', response.name)
              localStorage.setItem('fbLink', response.link)
              store.commit('setFbStatus', {fbId: response.id, fbUserName: response.name, fbLink: response.link})
            });
            localStorage.setItem('fbAcessToken', response.authResponse.accessToken)
            store.commit('setFbStatus', {fbAcessToken: response.authResponse.accessToken, loggedIn: true})
          } else {
            throw ("User not logged in with facebook")
          }
        }, {
          scope: 'public_profile,email,user_link',
          auth_type: 'reauthenticate',

        })
      }
    },
    logoutFb() {
      this.cleanFbStatus();
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            FB.logout(function(response) { console.log(response)});
        }
    });
    },
    cleanFbStatus(){
      localStorage.removeItem('fbAcessToken');
      localStorage.removeItem('fbUserName');
      localStorage.removeItem('fbLink');
      localStorage.removeItem('fbId');
      store.commit('setFbStatus', null)
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