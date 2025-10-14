import { defineStore } from 'pinia'
import { ref } from 'vue'

let idSeed = 1
export const useToastStore = defineStore('toast', () => {
  const items = ref([]) // [{ id, type, message, duration }]

  function push({ type = 'info', message = '', duration = 3000 } = {}) {
    const id = idSeed++
    items.value.push({ id, type, message, duration })
    setTimeout(() => remove(id), duration)
  }
  function remove(id) { items.value = items.value.filter(t => t.id !== id) }

  const info    = (m, d) => push({ type: 'info',    message: m, duration: d })
  const success = (m, d) => push({ type: 'success', message: m, duration: d })
  const warn    = (m, d) => push({ type: 'warn',    message: m, duration: d })
  const error   = (m, d) => push({ type: 'error',   message: m, duration: d })

  return { items, push, remove, info, success, warn, error }
})
