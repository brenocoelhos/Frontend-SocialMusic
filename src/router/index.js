import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Admin from '../pages/Admin.vue'
import Index from '../pages/index.vue'
import Perfil from '../pages/Perfil.vue'
import Avaliacao from '../pages/Avaliacao.vue'
import Busca from '../pages/Busca.vue'
import Musicas from '../pages/Musicas.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/socialmusic_backend'

// Configuração global do axios
axios.defaults.withCredentials = true
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

const routes = [
  { path: '/', name: 'Página Inicial', component: Index},
  { path: '/admin', name: 'Admin', component: Admin, meta: {requiresAdmin: true }},
  { path: '/perfil', name: 'Perfil', component: Perfil },
  { path: '/avaliacao', name: 'Avaliacao', component: Avaliacao },
  { path: '/busca', name:'Busca', component: Busca },
  { path: '/musicas', name: 'Musicas', component: Musicas }
  
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    try {
      console.log('Dados do usuário no localStorage:', localStorage.getItem('usuario'));
      console.log('Tentando acessar:', `${API_URL}/api/auth.admin.php`);
      const isadmin = JSON.parse(localStorage.getItem('usuario'));
      if (isadmin !== 'admin') {
        return next('/');
      }

      const response = await axios.get(`${API_URL}/api/auth.admin.php`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success && response.data.perfil === 'admin') {
        console.log('Acesso admin autorizado:', response.data);
        next();
      } else {
        console.log('Acesso negado:', response.data);
        next('/');
      }
    } catch (error) {
      console.log('Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      next('/');
    }
  } else {
    next();
  }
});

export default router
