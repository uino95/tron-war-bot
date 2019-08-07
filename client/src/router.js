import Vue from 'vue'
import Router from 'vue-router'
import Stats from './components/StatsTab.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Stats
    },
    {
      path: '/betfinal',
      name: 'betfinal',
      component: () => import('./components/BetFinalTab.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    },
    {
      path: '/betnext',
      name: 'betnext',
      component: () => import('./components/BetNextTab.vue')
    },
  ]
})
