import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 一次只顯示一個 Modal；如需多層可把 queue 換成陣列。
 * modal.open({ type, title, message, okText, cancelText, onOk, onCancel, content })
 */
export const useModalStore = defineStore('modal', () => {
  const open = ref(false)
  const payload = ref({
    type: 'confirm', // 'confirm' | 'alert' | 'custom'
    title: '',
    message: '',
    okText: '確認',
    cancelText: '取消',
    onOk: null,
    onCancel: null,
    content: null // 自定義渲染函數/組件（示範先不用）
  })

  function show(opts = {}) {
    payload.value = Object.assign({
      type: 'confirm',
      title: '',
      message: '',
      okText: '確認',
      cancelText: '取消',
      onOk: null,
      onCancel: null,
      content: null
    }, opts)
    open.value = true
  }

  function alert(message, opts = {}) {
    show({ type: 'alert', message, title: opts.title || '提示', okText: opts.okText || '知道了', onOk: opts.onOk || null })
  }

  function confirm(opts) {
    // opts: { title, message, okText, cancelText, onOk, onCancel }
    show(Object.assign({ type: 'confirm' }, opts))
  }

  function close() { open.value = false }

  async function ok() {
    const fn = payload.value.onOk
    close()
    if (typeof fn === 'function') await fn()
  }

  async function cancel() {
    const fn = payload.value.onCancel
    close()
    if (typeof fn === 'function') await fn()
  }

  return { open, payload, show, alert, confirm, close, ok, cancel }
})
