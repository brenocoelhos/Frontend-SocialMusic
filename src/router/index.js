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

      const response = await axios.get(`${API_URL}/api/auth.admin.php`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success && response.data.perfil === 'admin') {
        console.log('Acesso admin autorizado:', response.data);
        next(); // Permite o acesso
      } else {
        console.log('Acesso negado (pela API):', response.data);
        next('/'); // Redireciona se a API negar
      }
    } catch (error) {
      
      const errorData = (error.response && error.response.data) ? error.response.data : error.message;
      console.log('Erro ao verificar auth admin:', errorData);
      localStorage.removeItem('usuario');

      next('/'); // Redireciona se a API der erro (ex: 403, 401)
    }
  } else {
    next();
  }
});

export default router