import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/index.vue'
import { API_URL } from '@/config/api'
import { useAuth } from '@/composables/useAuth'
import { authFetch } from '@/services/authFetch'

// A Home continua no bundle inicial; as páginas secundárias só são baixadas
// quando o usuário realmente navega até elas.
const Admin = () => import('../pages/Admin.vue')
const Perfil = () => import('../pages/Perfil.vue')
const Avaliacao = () => import('../pages/Avaliacao.vue')
const Busca = () => import('../pages/Busca.vue')
const Musicas = () => import('../pages/Musicas.vue')
const Sobre = () => import('../pages/Sobre.vue')

const routes = [
  { path: '/', name: 'Página Inicial', component: Index },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAdmin: true } },
  { path: '/perfil/:username?', name: 'Perfil', component: Perfil },
  { path: '/avaliacao', name: 'Avaliacao', component: Avaliacao },
  { path: '/busca', name: 'Busca', component: Busca },
  { path: '/musicas', name: 'Musicas', component: Musicas },
  { path: '/sobre', name: 'Sobre', component: Sobre },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Preserva o comportamento anterior do App.vue: só mudanças de path
  // levam a página ao topo. Trocas apenas de query não forçam o scroll.
  scrollBehavior(to, from) {
    if (to.path !== from.path) {
      return { top: 0, behavior: 'smooth' }
    }
    return false
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true

  try {
    const response = await authFetch(`${API_URL}/api/auth/auth.admin.php`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.perfil === 'admin') {
        return true
      }
    }
  } catch (error) {
    console.warn('Não foi possível validar a sessão de admin:', error)
  }

  // Mantém cabeçalho e páginas sincronizados quando a sessão não é mais válida.
  useAuth().clearAuth()
  return '/'
})

export default router
