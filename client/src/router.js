import Vue from 'vue'
import Router from 'vue-router'
import BetFinalTab from './components/BetFinalTab.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: BetFinalTab
    },
    {
      path: '/betfinal',
      name: 'betfinal',
      component: BetFinalTab
    },
    {
      path: '/betnext',
      name: 'betnext',
      component: () => import('./components/BetNextTab.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./components/StatsTab.vue')
    }
  ]
})
