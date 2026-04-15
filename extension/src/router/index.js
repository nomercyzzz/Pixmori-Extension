import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Goal from '../views/Goal.vue'
import More from '../views/More.vue'
import Pet from '../views/Pet.vue'
import Shop from '../views/Shop.vue'
import Account from '../views/Account.vue'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/goal', name: 'goal', component: Goal },
    { path: '/more', name: 'more', component: More },
    { path: '/more/pet', name: 'pet', component: Pet },
    { path: '/more/shop', name: 'shop', component: Shop },
    { path: '/more/account', name: 'account', component: Account },
    { path: '/more/about', name: 'about', component: About }
  ]
})

export default router