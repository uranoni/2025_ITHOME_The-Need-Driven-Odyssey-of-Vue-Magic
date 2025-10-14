import { defineStore } from 'pinia'
import { http } from '../services/http'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    languages: ['zh-TW','en-US','ja-JP'],
    dict: { drinks: {}, sweetness: {}, ice: {} },
    preferredLocale: 'zh-TW',
    loading: false,
    error: ''
  }),
  actions: {
    async loadServerConfig() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await http.get('/api/i18n-config')
        this.languages = data.languages || this.languages
        this.dict = { drinks: data.drinks || {}, sweetness: data.sweetness || {}, ice: data.ice || {} }
      } catch (e) {
        this.error = '載入 i18n 設定失敗'
      } finally {
        this.loading = false
      }
    },
    async saveServerConfig(payload, token) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await http.put('/api/i18n-config', payload, { headers: { Authorization: `Bearer ${token}` } })
        this.languages = data.languages
        this.dict = { drinks: data.drinks, sweetness: data.sweetness, ice: data.ice }
      } catch (e) {
        this.error = e.response?.data?.error || '更新 i18n 失敗'
      } finally {
        this.loading = false
      }
    },
    translate(category, key, locale) {
      const table = this.dict[category] || {}
      const row = table[key]
      if (!row) return key
      return row[locale] || key
    },
    async loadMe(token) {
      try {
        const { data } = await http.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        this.preferredLocale = data.preferredLocale || this.preferredLocale
      } catch {}
    },
    async updatePreferredLocale(locale, token) {
      try {
        await http.put('/api/users/me/locale', { locale }, { headers: { Authorization: `Bearer ${token}` } })
        this.preferredLocale = locale
      } catch {}
    }
  }
})


