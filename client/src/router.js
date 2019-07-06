import Vue from 'vue'
import Router from 'vue-router'
import BetNextTab from './components/BetNextTab.vue'
import StatsTab from './components/StatsTab.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'betnext',
      component: BetNextTab
    },
    {
      path: '/betnext',
      name: 'betnext',
      component: BetNextTab
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./components/StatsTab.vue')
    }
  ]
})
