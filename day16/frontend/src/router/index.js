import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/login', component: LoginPage },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage, meta: { requiresAdmin: true } },
  { path: '/order/:id', component: OrderDetailPage },
  
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全域守衛
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.path !== '/login' && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta?.requiresAdmin && !auth.isAdmin) {
    return { path: '/order' }
  }
})


