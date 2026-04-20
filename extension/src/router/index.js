import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Goal from '../views/Goal.vue'
import Pet from '../views/Pet.vue'
import Shop from '../views/Shop.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/goal', name: 'goal', component: Goal },
    { path: '/pet', name: 'pet', component: Pet },
    { path: '/shop', name: 'shop', component: Shop },
    { path: '/settings', name: 'settings', component: Settings }
  ]
})

export default router
