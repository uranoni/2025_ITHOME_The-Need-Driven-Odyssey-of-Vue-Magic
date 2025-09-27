<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import OrderForm from './components/OrderForm.vue'
import OrderList from './components/OrderList.vue'
import OrderStats from './components/OrderStats.vue'
import { OrderService } from './services/orderService'

// 狀態管理
const orders = reactive([])
const loading = ref(false)
const error = ref('')

// 載入所有訂單
async function loadOrders() {
  try {
    loading.value = true
    error.value = ''
    const data = await OrderService.list()
    orders.splice(0, orders.length, ...data)
  } catch (err) {
    error.value = '載入訂單失敗: ' + (err.response?.data?.error || err.message)
    console.error('載入訂單失敗:', err)
  } finally {
    loading.value = false
  }
}

// 新增訂單
async function handleSubmit(payload) {
  try {
    loading.value = true
    error.value = ''
    const newOrder = await OrderService.create(payload)
    orders.push(newOrder)
  } catch (err) {
    error.value = '新增訂單失敗: ' + (err.response?.data?.error || err.message)
    console.error('新增訂單失敗:', err)
  } finally {
    loading.value = false
  }
}

// 編輯訂單
async function handleEdit({ index, patch }) {
  try {
    loading.value = true
    error.value = ''
    const order = orders[index]
    const updatedOrder = await OrderService.update(order.id, patch)
    Object.assign(orders[index], updatedOrder)
  } catch (err) {
    error.value = '更新訂單失敗: ' + (err.response?.data?.error || err.message)
    console.error('更新訂單失敗:', err)
  } finally {
    loading.value = false
  }
}

// 刪除訂單
async function handleRemove(index) {
  try {
    loading.value = true
    error.value = ''
    const order = orders[index]
    await OrderService.remove(order.id)
    orders.splice(index, 1)
  } catch (err) {
    error.value = '刪除訂單失敗: ' + (err.response?.data?.error || err.message)
    console.error('刪除訂單失敗:', err)
  } finally {
    loading.value = false
  }
}

/* 統計 */
const summaryMap = computed(() => {
  const m = new Map()
  for (const o of orders) {
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

// 頁面載入時取得訂單
onMounted(() => {
  loadOrders()
})
</script>

<template>
  <main class="page">
    <h1>飲料點單系統 (API 版)</h1>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
      <button @click="loadOrders" class="btn btn-sm">重新載入</button>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading" class="loading-message">
      🔄 載入中...
    </div>

    <OrderForm @submit="handleSubmit" :disabled="loading" />

    <section class="list">
      <h3>目前已送出的訂單 ({{ orders.length }} 筆)</h3>
      <OrderList :orders="orders" @edit="handleEdit" @remove="handleRemove" />
    </section>

    <OrderStats :orders="orders" :summary="summaryRows" />
  </main>
</template>

<!-- ❗重點：這裡不用 scoped，讓所有子元件共用 Day5 的樣式 -->
<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans'; }
.page { padding: 12px; }

/* Day4/Day5 共用樣式（與單檔版一致） */
.block { padding: 8px; border: 1px solid #ddd; border-radius: 8px; margin: 10px 0; background: #fff; }
.invalid { border-color: #e57373; background: #fff5f5; }
.complete { border-color: #66bb6a; background: #f3fff3; }
.hint { font-size: 12px; color: #c62828; margin-top: 4px; }

.submit { padding: 8px 12px; border-radius: 6px; border: 1px solid #ccc; margin: 8px 0; cursor: pointer; }
.submit.enabled { background: #1976d2; color: #fff; border-color: #1976d2; }
.submit.disabled { background: #f0f0f0; color: #888; cursor: not-allowed; }

.list { margin-top: 14px; }
.order { border: 1px solid #eee; border-radius: 8px; padding: 8px; margin: 8px 0; background: #fff; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.col { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.idx { color: #666; width: 24px; text-align: right; }
.name { font-weight: 600; margin-right: 6px; }

.pill { padding: 2px 8px; border-radius: 9999px; border: 1px solid #ccc; font-size: 12px; }
.is-ice { background: #e3f2fd; border-color: #90caf9; }
.is-noice { background: #e8f5e9; border-color: #a5d6a7; }
.is-sugar { background: #fff3e0; border-color: #ffcc80; }
.is-nosugar { background: #fce4ec; border-color: #f48fb1; }
.note { color: #555; font-size: 12px; }

.actions { display: inline-flex; gap: 6px; }
.btn { padding: 4px 10px; border-radius: 6px; border: 1px solid #999; background: #fff; cursor: pointer; }
.btn-sm { padding: 2px 8px; font-size: 12px; }
.btn.primary { border-color: #1976d2; background: #1976d2; color: #fff; }
.btn.del { border-color: #e57373; color: #e57373; }
.btn.del:hover { background: #ffeef0; }

.edit-card { margin-top: 8px; border: 1px dashed #ddd; border-radius: 8px; padding: 8px; background: #fafafa; }
.edit-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.edit-grid { display: grid; grid-template-columns: repeat(3, minmax(160px, 1fr)); gap: 8px; }
.edit-actions { display: inline-flex; gap: 8px; }

.stats { margin-top: 16px; }
.table { border-collapse: collapse; width: 100%; }
.table th, .table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
.table thead { background: #fafafa; }
.qty { text-align: right; font-variant-numeric: tabular-nums; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* API 狀態樣式 */
.error-message {
  background: #ffeef0;
  border: 1px solid #e57373;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loading-message {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1565c0;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: center;
}
</style>
