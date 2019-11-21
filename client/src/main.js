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
            fbId: fbUser.data.id,
            fbUserName: fbUser.data.name,
            fbLink: fbUser.data.link,
            loggedIn: true
          }
          localStorage.setItem('fbId', fbUser.data.id)
          localStorage.setItem('fbUserName', fbUser.data.name)
          localStorage.setItem('fbLink', fbUser.data.link)
          store.commit('setFbStatus', fb)
          return true;
        }
      }
    },

    async loginToFb(path) {
      let loggedIn = await this.loggedInFb()
      if (!loggedIn) {
        
        let client_id = 1165517713645322
        let redirect_uri = 'https://test.tronwarbot.com/login.html'
        let state = Math.random().toString(36).substr(2);
        let response_type = 'token'
        let scope = 'public_profile,email,user_link'
        let auth_type = 'reauthenticate'

        localStorage.setItem('state', state)
        localStorage.setItem('path', path)
        console.log(state)

        window.open(`https://www.facebook.com/dialog/oauth/?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&response_type=${response_type}&scope=${scope}&auth_type=${auth_type}`,"_self")

        // FB.login((response) => {
        //   console.log("first response from login is: ", response)
        //   if (response.authResponse) {
        //     FB.api('/me?fields=link,name', (response) => {
        //       console.log("response from api is: ", response)
        //       localStorage.setItem('fbId', response.id)
        //       localStorage.setItem('fbUserName', response.name)
        //       localStorage.setItem('fbLink', response.link)
        //       store.commit('setFbStatus', {fbId: response.id, fbUserName: response.name, fbLink: response.link})
        //     });
        //     localStorage.setItem('fbAcessToken', response.authResponse.accessToken)
        //     store.commit('setFbStatus', {fbAcessToken: response.authResponse.accessToken, loggedIn: true})
        //   } else {
        //     throw ("User not logged in with facebook")
        //   }
        // }, {
        //   scope: 'public_profile,email,user_link',
        //   auth_type: 'reauthenticate',
        //   // popup, dialog, iframe, touch, async, hidden, none
        // })
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