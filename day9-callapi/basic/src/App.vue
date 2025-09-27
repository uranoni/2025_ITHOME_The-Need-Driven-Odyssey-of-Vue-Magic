<template>
  <h1>簡單飲料訂單</h1>
  <AddOrder @order-added="loadOrders" />
  <OrderList :orders="orders" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddOrder from './components/AddOrder.vue'
import OrderList from './components/OrderList.vue'

const orders = ref([])

async function loadOrders() {
  const res = await fetch('http://localhost:3000/api/orders')
  orders.value = await res.json()
}

onMounted(loadOrders)
</script>
