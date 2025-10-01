import { defineStore } from 'pinia'
import { OrderService } from '../services/orderService'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: ''
  }),

  getters: {
    summaryMap: (state) => {
      const m = new Map()
      for (const o of state.orders) {
        const key = `${o.drink}|${o.sweetness}|${o.ice}`
        m.set(key, (m.get(key) || 0) + 1)
      }
      return m
    },

    summaryRows: (state) => {
      const m = new Map()
      for (const o of state.orders) {
        const key = `${o.drink}|${o.sweetness}|${o.ice}`
        m.set(key, (m.get(key) || 0) + 1)
      }
      return Array.from(m.entries()).map(([key, count]) => {
        const [drink, sweetness, ice] = key.split('|')
        return { key, drink, sweetness, ice, count }
      })
    },

    totalCount: (state) => state.orders.length,

    // Pinia getter：提供 JSON 字串（只讀）
    ordersJson: (state) => {
      return JSON.stringify(state.orders, null, 2)
    }
  },

  actions: {
    // Pinia setter：驗證並設定訂單資料
    setOrdersJson(txt) {
      try {
        const parsed = JSON.parse(txt)
        if (!Array.isArray(parsed)) throw new Error('JSON 根應為陣列')
        // 簡單驗證欄位
        for (const o of parsed) {
          if (!o || typeof o !== 'object') throw new Error('每筆應為物件')
          const hasRequired = ['name','drink','sweetness','ice'].every(k => typeof o[k] === 'string')
          if (!hasRequired) throw new Error('缺少必要欄位或型別不正確')
        }
        this.orders = parsed
        this.error = ''
      } catch (e) {
        this.error = '匯入訂單 JSON 失敗: ' + e.message
      }
    },

    async loadOrders() {
      try {
        this.loading = true
        this.error = ''
        const data = await OrderService.list()
        this.orders = data
      } catch (err) {
        this.error = '載入訂單失敗: ' + (err.response?.data?.error || err.message)
        console.error('載入訂單失敗:', err)
      } finally {
        this.loading = false
      }
    },

    async createOrder(payload) {
      try {
        this.loading = true
        this.error = ''
        const newOrder = await OrderService.create(payload)
        this.orders.push(newOrder)
      } catch (err) {
        this.error = '新增訂單失敗: ' + (err.response?.data?.error || err.message)
        console.error('新增訂單失敗:', err)
      } finally {
        this.loading = false
      }
    },

    async updateOrder(index, patch) {
      try {
        this.loading = true
        this.error = ''
        const target = this.orders[index]
        const updatedOrder = await OrderService.update(target.id, patch)
        this.orders[index] = { ...this.orders[index], ...updatedOrder }
      } catch (err) {
        this.error = '更新訂單失敗: ' + (err.response?.data?.error || err.message)
        console.error('更新訂單失敗:', err)
      } finally {
        this.loading = false
      }
    },

    async removeOrder(index) {
      try {
        this.loading = true
        this.error = ''
        const target = this.orders[index]
        await OrderService.remove(target.id)
        this.orders.splice(index, 1)
      } catch (err) {
        this.error = '刪除訂單失敗: ' + (err.response?.data?.error || err.message)
        console.error('刪除訂單失敗:', err)
      } finally {
        this.loading = false
      }
    },

    // 批次覆蓋（祕書匯入後，與後端同步）
    async replaceAllOrders(newOrders) {
      try {
        this.loading = true
        this.error = ''
        const data = await OrderService.replaceAll(newOrders)
        this.orders = data
      } catch (err) {
        this.error = '批次覆蓋失敗: ' + (err.response?.data?.error || err.message)
        console.error('批次覆蓋失敗:', err)
      } finally {
        this.loading = false
      }
    }
  }
})


