import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    loading: false,
    error: ''
  }),

  actions: {
    async loadOrders() {
      try {
        this.loading = true
        const res = await fetch('http://localhost:3000/api/orders')
        this.orders = await res.json()
      } catch (err) {
        this.error = '載入失敗：' + err.message
      } finally {
        this.loading = false
      }
    },

    async addOrder(payload) {
      try {
        this.loading = true
        const res = await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        this.orders.push(await res.json())
      } catch (err) {
        this.error = '新增失敗：' + err.message
      } finally {
        this.loading = false
      }
    }
  }
})
