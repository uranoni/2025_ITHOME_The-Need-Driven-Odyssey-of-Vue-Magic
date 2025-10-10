import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AdminI18nPage from '../pages/AdminI18nPage.vue'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/login', component: LoginPage },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage, meta: { requiresAdmin: true } },
  { path: '/order/:id', component: OrderDetailPage },
  { path: '/admin/i18n', component: AdminI18nPage, meta: { requiresAdmin: true } },
  
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

router.afterEach(() => {
  // 更新標題（使用 i18n）
  try {
    const { t } = useI18n()
    document.title = t('app.title')
  } catch {}
})


