import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'

const app = createApp(App)
app.use(createPinia())
app.use(router)
const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: { 'zh-TW': zhTW, 'en-US': enUS, 'ja-JP': jaJP }
})
app.use(i18n)
app.mount('#app')
