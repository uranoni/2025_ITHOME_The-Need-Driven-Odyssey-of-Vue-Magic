<script setup>
// App.vue 現在只負責掛載 RouterView
// 所有主要功能都移到 MainLayout.vue
</script>

<template>
  <RouterView />
</template>

<style>
/* 頁面轉場動畫保留在 App.vue */
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
</style>
