import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage },
  { path: '/order/:id', component: OrderDetailPage },
  
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})


