<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'
import OrderStats from '../components/OrderStats.vue'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

onMounted(() => {
  if (!orderStore.orders.length) {
    orderStore.loadOrders()
  }
  if (!menuStore.drinks.length) {
    menuStore.loadMenu()
  }
})
</script>

<template>
  <section class="stats">
    <h2>結算之室</h2>
    <nav style="margin:8px 0">
      <router-link class="btn" to="/order">回到點餐</router-link>
    </nav>
    <OrderStats :orders="orderStore.orders" :summary="orderStore.summaryRows" />
  </section>
</template>


