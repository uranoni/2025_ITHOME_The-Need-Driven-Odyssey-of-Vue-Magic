import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { http } from '../services/http'

export const useMenuStore = defineStore('menu', () => {
  const menu = ref({ drinks: [], sweetnessOptions: [], iceOptions: [], rules: {} })
  const shops = ref([])
  const currentShop = ref('')
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

  // 多菜單：列出店家
  async function loadShops() {
    try {
      loading.value = true
      error.value = ''
      const { data } = await http.get('/api/menus')
      shops.value = data.names || []
    } catch (err) {
      error.value = '載入店家清單失敗: ' + (err.response?.data?.error || err.message)
    } finally {
      loading.value = false
    }
  }
  async function loadShopMenu(name) {
    try {
      loading.value = true
      error.value = ''
      const { data } = await http.get(`/api/menus/${encodeURIComponent(name)}`)
      currentShop.value = name
      menu.value = data
    } catch (err) {
      error.value = '載入店家菜單失敗: ' + (err.response?.data?.error || err.message)
    } finally {
      loading.value = false
    }
  }

  const drinks = computed(() => {
    const d = menu.value.drinks
    if (Array.isArray(d) && d.length) return d
    // OCR 菜單格式：從 categories 展平成飲品名稱
    const cats = menu.value.categories
    if (Array.isArray(cats) && cats.length) {
      const names = []
      for (const c of cats) {
        for (const it of (c.items || [])) names.push(it.name)
      }
      return names
    }
    return []
  })
  const sweetnessOptions = computed(() => {
    const s = menu.value.sweetnessOptions
    if (Array.isArray(s) && s.length) return s
    return ['去糖','微糖','半糖','少糖','全糖']
  })
  const iceOptions = computed(() => {
    const i = menu.value.iceOptions
    if (Array.isArray(i) && i.length) return i
    return ['去冰','微冰','少冰','正常冰','熱飲']
  })
  const rules = computed(() => menu.value.rules || {})

  return { menu, shops, currentShop, loading, error, drinks, sweetnessOptions, iceOptions, rules, loadMenu, loadShops, loadShopMenu }
})


