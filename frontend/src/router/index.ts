import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/views/MainPage.vue'
import LoginView from '@/views/LoginView.vue'
import { authService } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: MainPage,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

/**
 * Route Guard - Prüft ob Benutzer authentifiziert ist
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.meta.requiresAuth

  // Wenn Route Auth benötigt aber Benutzer nicht angemeldet
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // Wenn Benutzer angemeldet und auf Login-Seite zugreifen will
  else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
  }
  // Sonst weitergehen
  else {
    next()
  }
})

export default router
