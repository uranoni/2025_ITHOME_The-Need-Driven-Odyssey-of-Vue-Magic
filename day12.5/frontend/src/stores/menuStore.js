import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { http } from '../services/http'

export const useMenuStore = defineStore('menu', () => {
  const menu = ref({ drinks: [], sweetnessOptions: [], iceOptions: [], rules: {} })
  const loading = ref(false)
  const error = ref('')

  async function loadMenu() {
    try {
      loading.value = true
      error.value = ''
      const { data } = await http.get('/api/ordermenu')
      menu.value = data
    } catch (err) {
      error.value = '載入菜單失敗: ' + (err.response?.data?.error || err.message)
      console.error('載入菜單失敗:', err)
    } finally {
      loading.value = false
    }
  }

  const drinks = computed(() => menu.value.drinks || [])
  const sweetnessOptions = computed(() => menu.value.sweetnessOptions || [])
  const iceOptions = computed(() => menu.value.iceOptions || [])
  const rules = computed(() => menu.value.rules || {})

  return { menu, loading, error, drinks, sweetnessOptions, iceOptions, rules, loadMenu }
})


