<template>
  <section>
    <h2>新增訂單</h2>
    <form @submit.prevent="addOrder">
      <input v-model="name" placeholder="名字" required />
      <select v-model="drink" required>
        <option disabled value="">選擇飲料</option>
        <option>紅茶</option>
        <option>綠茶</option>
      </select>
      <button type="submit">送出</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['order-added'])
const name = ref('')
const drink = ref('')

async function addOrder() {
  await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, drink: drink.value })
  })
  name.value = ''
  drink.value = ''
  emit('order-added') // 通知父層重新抓資料
}
</script>
