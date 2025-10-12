<script setup>
import { useModalStore } from '../stores/modalStore'
const modal = useModalStore()

function onBackdrop(e){
  // 只有點到黑幕才關閉，不影響內容點擊
  if (e.target === e.currentTarget) {
    if (modal.payload.type === 'alert') {
      modal.ok()
    } else {
      modal.cancel()
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.open" class="modal-backdrop" @click="onBackdrop">
        <div class="modal-panel" role="dialog" aria-modal="true" :aria-label="modal.payload.title || 'Dialog'">
          <header class="modal-header" v-if="modal.payload.title">
            <h3>{{ modal.payload.title }}</h3>
          </header>

          <section class="modal-body">
            <p v-if="modal.payload.message">{{ modal.payload.message }}</p>
            <component v-if="modal.payload.content" :is="modal.payload.content" />
          </section>

          <footer class="modal-actions">
            <button v-if="modal.payload.type==='confirm'" class="btn" @click="modal.cancel">{{ modal.payload.cancelText }}</button>
            <button class="btn primary" @click="modal.ok">{{ modal.payload.okText }}</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: grid; place-items: center; z-index: 10000;
}
.modal-panel {
  width: min(560px, 92vw); background: #fff; color: #111; border-radius: 14px;
  border: 1px solid #e5e7eb; box-shadow: 0 24px 80px rgba(0,0,0,.22);
  overflow: hidden;
}
.modal-header { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
.modal-body { padding: 16px; line-height: 1.6; }
.modal-actions { display:flex; gap:8px; justify-content:flex-end; padding: 12px 16px; border-top: 1px solid #f1f5f9; }

/* 過場動畫 */
.modal-enter-from { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity .18s ease; }
.modal-leave-to { opacity: 0; }
.modal-panel { transform: translateY(4px) scale(.98); transition: transform .18s ease; }
.modal-enter-active .modal-panel { transform: translateY(0) scale(1); }
.modal-leave-active .modal-panel { transform: translateY(-2px) scale(.985); }

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active, .modal-leave-active, .modal-panel { transition-duration: 0s; }
}

/* 簡易按鈕 */
.btn { padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background:#fff; cursor: pointer; }
.btn.primary { background:#111827; color:#fff; border-color:#111827; }
.btn:hover { filter: brightness(0.98); }
</style>
