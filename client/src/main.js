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
import missingFlags from './assets/missingFlags'

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

    getFlagString(str) {
      let res = "/img/flags/" + str.toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("ã", "a")
        .replaceAll("ì", "i")
        .replaceAll("è", "e")
        .replaceAll("ì", "i")
        .replaceAll("å", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i") + ".svg";
      if(missingFlags.includes(res)){
        return "/img/flags/placeholder.svg"
      }
      return res
    },

    async loggedInFb() {
      let fbAcessToken = localStorage.getItem('fbAcessToken')
      if( fbAcessToken == null){
        this.cleanFbStatus()
        return false
      }
      if (fbAcessToken != null) {
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
        let redirect_uri = store.state.redirect_uri + '/login.html'
        let state = Math.random().toString(36).substr(2);
        let response_type = 'token'
        let scope = 'public_profile,email,user_link'
        let auth_type = 'reauthenticate'

        localStorage.setItem('state', state)
        localStorage.setItem('path', path)

        window.open(`https://www.facebook.com/dialog/oauth/?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&response_type=${response_type}&scope=${scope}&auth_type=${auth_type}`,"_self")
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


