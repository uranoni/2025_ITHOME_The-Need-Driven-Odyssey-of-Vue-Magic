<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '../stores/i18nStore'
import ModalHost from '../components/ModalHost.vue'
import ToastHost from '../components/ToastHost.vue'

const auth = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const { t, locale } = useI18n()
const i18nStore = useI18nStore()

function logout() {
  auth.clear()
  router.push('/login')
}

function switchLocale(lang) {
  locale.value = lang
  document.title = t('app.title')
  if (auth.isAuthenticated) {
    i18nStore.updatePreferredLocale(lang, auth.token)
  }
}

function handleModeChange(event) {
  themeStore.setMode(event.target.value)
}

// 移除顏色選擇器相關功能，只保留主題模式切換

onMounted(() => {
  // 載入主題設定
  themeStore.loadFromStorage()
  // 載入後端 i18n 字典
  i18nStore.loadServerConfig()
})
</script>

<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <!-- 左側：專案標題 -->
        <h1 class="app-title">{{ t('app.header') }}</h1>
        
        <!-- 中間：主導覽 -->
        <nav class="main-nav">
          <router-link to="/order" class="nav-link">{{ t('nav.order') }}</router-link>
          <router-link to="/summary" class="nav-link">{{ t('nav.summary') }}</router-link>
          <router-link to="/menu" class="nav-link">菜單召喚樹</router-link>
          <router-link v-if="auth.isAdmin" to="/admin/ocr" class="nav-link">OCR 管理</router-link>
          <router-link v-if="auth.isAdmin" to="/analytics" class="nav-link">📊 分析</router-link>
        </nav>
        
        <!-- 右側：控制區 -->
        <div class="header-controls">
          <!-- Theme 控制區 -->
          <div class="theme-controls">
            <div class="theme-mode">
              <label for="theme-mode" class="theme-label">主題模式</label>
              <select 
                id="theme-mode" 
                class="theme-select" 
                :value="themeStore.mode"
                @change="handleModeChange"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          
          <!-- 語系切換 -->
          <select class="locale-select" @change="switchLocale($event.target.value)">
            <option value="zh-TW">中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
          
          <!-- 登入/登出 -->
          <button v-if="auth.isAuthenticated" class="logout-btn" @click="logout">登出</button>
        </div>
      </div>
    </header>
    
    <!-- 主要內容區 -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <!-- 全域傳送門 -->
    <ModalHost />
    <ToastHost />
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
}

.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 16px;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
}

.main-nav {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: var(--transition-fast);
  font-weight: 500;
  background: transparent;
}

.nav-link:hover {
  color: var(--color-primary);
  background: var(--bg-page);
  border-color: var(--border-color);
}

.nav-link.router-link-active {
  background: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
}

/* 暗色模式下的 active 狀態優化 */
[data-theme="dark"] .nav-link.router-link-active {
  background: #ffffff !important;
  color: #000000 !important;
  border-color: #ffffff !important;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-mode {
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.theme-select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
}

.locale-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
}

.logout-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  transition: var(--transition-fast);
}

.logout-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.main-content {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 頁面轉場動畫 */
.page-enter-from { 
  opacity: 0; 
  transform: translateY(6px) scale(0.98); 
}
.page-enter-active, .page-leave-active { 
  transition: all .18s ease; 
}
.page-leave-to { 
  opacity: 0; 
  transform: translateY(-6px) scale(0.98); 
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { 
    transition-duration: 0s; 
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .main-nav {
    order: 2;
    justify-content: center;
  }
  
  .header-controls {
    order: 3;
    justify-content: center;
    width: 100%;
  }
}
</style>
