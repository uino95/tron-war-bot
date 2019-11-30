import Vue from 'vue'
import Router from 'vue-router'
import Stats from './components/StatsTab.vue'
import History from './components/HistoryTab.vue'
import Cohesion from './components/CohesionTab.vue'
import BetFinal from './components/BetFinalTab.vue'
import BetBattle from './components/BetBattle.vue'
import BetNext from './components/BetNextTab.vue'
import SpendersWinners from './components/SpendersTab.vue'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Stats
    },
    {
      path: '/betfinal',
      name: 'betfinal',
      component: BetFinal
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/betnext',
      name: 'betnext',
      component: BetNext
    },
    {
      path: '/betbattle',
      name: 'betbattle',
      component: BetBattle
    },
    {
      path: '/cohesion',
      name: 'cohesion',
      component: Cohesion
    },
    {
      path: '/spenderswinners',
      name: 'spenderswinners',
      component: SpendersWinners
    },
    { path: "*", 
      component: Stats 
    }
  ]
})