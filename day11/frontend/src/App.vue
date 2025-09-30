<script setup>
import { useOrderStore } from './stores/orderStore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const store = useOrderStore()
const { orders, loading, error } = storeToRefs(store)

const name = ref('')
const drink = ref('')

// 初始載入
store.loadOrders()

async function add() {
  if (!name.value || !drink.value) return
  await store.addOrder({
    name: name.value,
    drink: drink.value
  })
  name.value = ''
  drink.value = ''
}
</script>

<template>
  <main>
    <h1>Day11 – Pinia Store Demo</h1>

    <div v-if="error" class="error">⚠️ {{ error }}</div>
    <div v-if="loading">🔄 載入中...</div>

    <div class="block">
      <input v-model="name" placeholder="姓名" />
      <input v-model="drink" placeholder="飲料" />
      <button @click="add">新增訂單</button>
    </div>

    <h3>目前訂單</h3>
    <ul>
      <li v-for="o in orders" :key="o.id">{{ o.name }} - {{ o.drink }}</li>
    </ul>
  </main>
</template>

<style>
body { font-family: sans-serif; }
.block { margin: 12px 0; }
.error { color: #c62828; background: #ffeef0; padding: 6px; border-radius: 4px; }
</style>
