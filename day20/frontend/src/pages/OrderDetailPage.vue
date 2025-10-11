<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '../services/orderService'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()
const { t } = useI18n()

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await OrderService.getById(route.params.id, auth.token)
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
    <h2>{{ t('pages.orderDetail') }}</h2>
    <div v-if="loading" class="loading-message">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <template v-else-if="order">
      <p><b>{{ t('fields.name') }}：</b>{{ order.name }}</p>
      <p><b>{{ t('fields.drink') }}：</b>{{ order.drink }}</p>
      <p><b>{{ t('fields.sweetness') }}：</b>{{ order.sweetness }}</p>
      <p><b>{{ t('fields.ice') }}：</b>{{ order.ice }}</p>
      <p><b>{{ t('fields.note') }}：</b>{{ order.note }}</p>
      <p><b>{{ t('fields.createdAt') }}：</b>{{ order.createdAt }}</p>
      <p v-if="order.updatedAt"><b>{{ t('fields.updatedAt') }}：</b>{{ order.updatedAt }}</p>
      <div class="actions" style="margin-top:12px">
        <button class="btn" @click="router.push('/order')">{{ t('actions.backToOrder') }}</button>
      </div>
    </template>
    <div v-else>無資料</div>
  </section>
</template>


