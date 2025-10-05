<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '../services/orderService'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await OrderService.getById(route.params.id)
  } catch (e) {
    error.value = '讀取訂單失敗'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="block">
    <h2>訂單詳情</h2>
    <div v-if="loading" class="loading-message">讀取中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <template v-else-if="order">
      <p><b>姓名：</b>{{ order.name }}</p>
      <p><b>飲料：</b>{{ order.drink }}</p>
      <p><b>甜度：</b>{{ order.sweetness }}</p>
      <p><b>冰量：</b>{{ order.ice }}</p>
      <p><b>備註：</b>{{ order.note }}</p>
      <p><b>建立時間：</b>{{ order.createdAt }}</p>
      <p v-if="order.updatedAt"><b>更新時間：</b>{{ order.updatedAt }}</p>
      <div class="actions" style="margin-top:12px">
        <button class="btn" @click="router.push('/order')">返回列表</button>
      </div>
    </template>
    <div v-else>無資料</div>
  </section>
</template>


