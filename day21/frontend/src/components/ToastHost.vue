<script setup>
import { useToastStore } from '../stores/toastStore'
const toast = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-root" role="region" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div v-for="t in toast.items" :key="t.id" class="toast" :data-type="t.type">
          <span class="toast-icon" aria-hidden="true">●</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="toast.remove(t.id)" aria-label="關閉">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-root { position: fixed; inset: 12px 12px auto auto; z-index: 10001; pointer-events: none; }
.toast-stack { display: grid; gap: 8px; }
.toast {
  pointer-events: auto;
  display: grid; grid-auto-flow: column; align-items: center; gap: 8px;
  min-width: 260px; max-width: 380px; padding: 10px 12px;
  border-radius: 12px; background: #fff; border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(0,0,0,.08); font-size: 14px; color: #222;
}
.toast[data-type="success"] { border-color: #22c55e33; background: #f0fdf4; }
.toast[data-type="info"]    { border-color: #3b82f633; background: #eff6ff; }
.toast[data-type="warn"]    { border-color: #f59e0b33; background: #fffbeb; }
.toast[data-type="error"]   { border-color: #ef444433; background: #fef2f2; }
.toast-icon { width: 8px; height: 8px; border-radius: 999px; }
.toast[data-type="success"] .toast-icon { background:#22c55e; }
.toast[data-type="info"]    .toast-icon { background:#3b82f6; }
.toast[data-type="warn"]    .toast-icon { background:#f59e0b; }
.toast[data-type="error"]   .toast-icon { background:#ef4444; }
.toast-close { margin-left: 8px; border: none; background: transparent; cursor: pointer; opacity: .6; }
.toast-close:hover { opacity: 1; }

/* 過場 */
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
.toast-enter-active, .toast-leave-active { transition: all .16s ease; }
.toast-move { transition: transform .16s ease; }

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active, .toast-leave-active, .toast-move { transition-duration: 0s; }
}
</style>
