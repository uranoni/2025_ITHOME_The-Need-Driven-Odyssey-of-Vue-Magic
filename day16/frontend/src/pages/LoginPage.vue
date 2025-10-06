<script setup>
import { ref } from 'vue'
import { http } from '../services/http'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

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
    <h2>登入</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="block" style="max-width:360px">
      <label>使用者名稱：<input v-model.trim="username" placeholder="例如 corgi / roni" /></label>
      <label style="display:block; margin-top:8px">密碼：<input v-model.trim="password" type="password" placeholder="預設 123456" /></label>
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" :disabled="loading || !username" @click="login">登入</button>
      </div>
      <p style="font-size:12px;color:#666;margin-top:8px">說明：若此使用者不存在將自動建立（密碼固定 123456）。使用者 roni 具備 admin 權限。</p>
    </div>
  </main>
</template>


