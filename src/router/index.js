import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'



import Admin from '../pages/Admin.vue'
import App from '../App.vue' // Página inicial


axios.defaults.withCredentials = true

const routes = [
  { path: '/', component: App },    
  { 
    path: '/admin',
    component: Admin,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    try {
      await axios.get("http://localhost/backend/auth_admin.php")
      next()
    } catch (err) {
      alert("Você não tem permissão para acessar essa página.")
      next('/') 
    }
  } else {
    next()
  }
})

export default router
