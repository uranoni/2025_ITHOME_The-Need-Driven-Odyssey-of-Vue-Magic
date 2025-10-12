import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' // 'light' | 'dark'
  }),

  actions: {
    // 設定主題模式
    setMode(mode) {
      this.mode = mode
      this.applyTheme()
      this.saveToStorage()
    },

    // 套用主題到 DOM
    applyTheme() {
      const root = document.documentElement
      
      // 設定主題模式
      root.dataset.theme = this.mode
    },

    // 儲存到 localStorage
    saveToStorage() {
      localStorage.setItem('themeState', JSON.stringify({ mode: this.mode }))
    },

    // 從 localStorage 載入
    loadFromStorage() {
      try {
        const stored = localStorage.getItem('themeState')
        if (stored) {
          const themeState = JSON.parse(stored)
          this.mode = themeState.mode || 'light'
          this.applyTheme()
        } else {
          // 如果沒有儲存的設定，使用預設值
          this.applyTheme()
        }
      } catch (error) {
        console.warn('載入主題設定失敗:', error)
        this.applyTheme()
      }
    }
  }
})
