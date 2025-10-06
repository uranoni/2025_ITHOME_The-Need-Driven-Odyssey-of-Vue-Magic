import { defineStore } from 'pinia'

const STORAGE_KEY = 'authState'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { username: '', role: '', token: '' }
  } catch {
    return { username: '', role: '', token: '' }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({ ...loadState() }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin: (s) => s.role === 'admin',
  },
  actions: {
    setAuth(payload) {
      this.username = payload.username
      this.role = payload.role
      this.token = payload.token
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: this.username, role: this.role, token: this.token }))
    },
    clear() {
      this.username = ''
      this.role = ''
      this.token = ''
      try {
        localStorage.clear()
      } catch {}
    }
  }
})


