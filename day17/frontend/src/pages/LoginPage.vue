<script setup>
import { ref } from 'vue'
import { http } from '../services/http'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

async function login() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await http.post('/api/login', { username: username.value, password: password.value || '123456' })
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
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" :disabled="loading || !username" @click="login">{{ t('actions.login') }}</button>
      </div>
      <p style="font-size:12px;color:#666;margin-top:8px">{{ t('pages.loginHint') }}</p>
    </div>
  </main>
</template>


