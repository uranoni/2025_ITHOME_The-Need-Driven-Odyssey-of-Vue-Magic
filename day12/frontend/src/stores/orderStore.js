import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { OrderService } from '../services/orderService'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  const summaryMap = computed(() => {
    const m = new Map()
    for (const o of orders.value) {
      const key = `${o.drink}|${o.sweetness}|${o.ice}`
      m.set(key, (m.get(key) || 0) + 1)
    }
    return m
  })

  const summaryRows = computed(() =>
    Array.from(summaryMap.value.entries()).map(([key, count]) => {
      const [drink, sweetness, ice] = key.split('|')
      return { key, drink, sweetness, ice, count }
    })
  )

  const totalCount = computed(() => orders.value.length)

  // 可寫 getter：提供 JSON 字串的雙向綁定（便於匯入/匯出）
  const ordersJson = computed({
    get() {
      return JSON.stringify(orders.value, null, 2)
    },
    set(txt) {
      try {
        const parsed = JSON.parse(txt)
        if (!Array.isArray(parsed)) throw new Error('JSON 根應為陣列')
        // 簡單驗證欄位
        for (const o of parsed) {
          if (!o || typeof o !== 'object') throw new Error('每筆應為物件')
          const hasRequired = ['name','drink','sweetness','ice'].every(k => typeof o[k] === 'string')
          if (!hasRequired) throw new Error('缺少必要欄位或型別不正確')
        }
        orders.value = parsed
        error.value = ''
      } catch (e) {
        error.value = '匯入訂單 JSON 失敗: ' + e.message
      }
    }
  })

  async function loadOrders() {
    try {
      loading.value = true
      error.value = ''
      const data = await OrderService.list()
      orders.value = data
    } catch (err) {
      error.value = '載入訂單失敗: ' + (err.response?.data?.error || err.message)
      console.error('載入訂單失敗:', err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(payload) {
    try {
      loading.value = true
      error.value = ''
      const newOrder = await OrderService.create(payload)
      orders.value.push(newOrder)
    } catch (err) {
      error.value = '新增訂單失敗: ' + (err.response?.data?.error || err.message)
      console.error('新增訂單失敗:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(index, patch) {
    try {
      loading.value = true
      error.value = ''
      const target = orders.value[index]
      const updatedOrder = await OrderService.update(target.id, patch)
      orders.value[index] = { ...orders.value[index], ...updatedOrder }
    } catch (err) {
      error.value = '更新訂單失敗: ' + (err.response?.data?.error || err.message)
      console.error('更新訂單失敗:', err)
    } finally {
      loading.value = false
    }
  }

  async function removeOrder(index) {
    try {
      loading.value = true
      error.value = ''
      const target = orders.value[index]
      await OrderService.remove(target.id)
      orders.value.splice(index, 1)
    } catch (err) {
      error.value = '刪除訂單失敗: ' + (err.response?.data?.error || err.message)
      console.error('刪除訂單失敗:', err)
    } finally {
      loading.value = false
    }
  }

  // 批次覆蓋（祕書匯入後，與後端同步）
  async function replaceAllOrders(newOrders) {
    try {
      loading.value = true
      error.value = ''
      const data = await OrderService.replaceAll(newOrders)
      orders.value = data
    } catch (err) {
      error.value = '批次覆蓋失敗: ' + (err.response?.data?.error || err.message)
      console.error('批次覆蓋失敗:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    orders, loading, error,
    summaryMap, summaryRows, totalCount, ordersJson,
    loadOrders, createOrder, updateOrder, removeOrder, replaceAllOrders,
  }
})


