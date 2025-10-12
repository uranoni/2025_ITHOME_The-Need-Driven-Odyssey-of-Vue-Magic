<script setup>
import { ref } from 'vue'
import { http } from '../services/http'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const username = ref('')
const password = ref('')
const age = ref('')
const job = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

async function login() {
  error.value = ''
  loading.value = true
  
  // 驗證年齡
  if (!age.value || isNaN(age.value) || age.value < 12 || age.value > 100) {
    error.value = '請輸入有效的年齡（12-100歲）'
    loading.value = false
    return
  }
  
  try {
    const { data } = await http.post('/api/login', { 
      username: username.value, 
      password: password.value || '123456',
      age: parseInt(age.value),
      job: job.value || '其他'
    })
    auth.setAuth(data)
    router.push('/order')
  } catch (e) {
    error.value = e.response?.data?.error || '登入失敗'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="page">
    <h2>{{ t('pages.login') }}</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="block" style="max-width:360px">
      <label>{{ t('fields.username') }}：<input v-model.trim="username" :placeholder="t('placeholders.username')" /></label>
      <label style="display:block; margin-top:8px">{{ t('fields.password') }}：<input v-model.trim="password" type="password" :placeholder="t('placeholders.password')" /></label>
      <label style="display:block; margin-top:8px">{{ t('fields.age') }}：<input v-model.number="age" type="number" min="12" max="100" :placeholder="t('placeholders.age')" /></label>
      <label style="display:block; margin-top:8px">{{ t('fields.job') }}：
        <select v-model="job" style="width:100%; padding:4px; margin-top:4px;">
          <option value="">{{ t('placeholders.job') }}</option>
          <option value="學生">學生</option>
          <option value="工程師">工程師</option>
          <option value="設計師">設計師</option>
          <option value="業務">業務</option>
          <option value="經理">經理</option>
          <option value="其他">其他</option>
        </select>
      </label>
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" :disabled="loading || !username || !age" @click="login">{{ t('actions.login') }}</button>
      </div>
      <p style="font-size:12px;color:#666;margin-top:8px">{{ t('pages.loginHint') }}</p>
    </div>
  </main>
</template>


