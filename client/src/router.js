import Vue from 'vue'
import Router from 'vue-router'
import BetNextTab from './components/BetNextTab.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: BetNextTab
    },
    {
      path: '/betnext',
      name: 'betnext',
      component: BetNextTab
    },
    {
      path: '/betfinal',
      name: 'betfinal',
      component: () => import('./components/BetFinalTab.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./components/StatsTab.vue')
    }
  ]
})
