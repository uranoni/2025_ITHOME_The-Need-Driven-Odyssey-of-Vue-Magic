## 前言

昨天我們已經掌握了「傳送門」─ Vue Router 的基本施法：定義路由、`<router-link>` 導航，以及 `<router-view>` 顯示位置。今天我們把它真正放進飲料點單系統，讓使用者能以網址直達「點餐之塔」「結算之室」與「訂單詳情」，同時保留可分享、可重現的體驗。

---

## 一、User Story（以使用者需求為出發）

| 需求 | 角色 | 目的 | 功能 | 使用時機 |
| --- | --- | --- | --- | --- |
| 以網址直達點餐畫面 | 一般使用者 | 省去從首頁點擊 | 路由 `/order` | 想直接開始點餐 |
| 查看整體統計 | 組長/收單者 | 快速掌握數量 | 路由 `/summary` | 收單前確認總量 |
| 分享某筆訂單 | 點餐者/客服 | 讓對方直接看到指定訂單 | 路由 `/order/:id` | 客服查單、對帳 |


需求動機：
- 直達與可分享：把網址丟給同伴即可到達同一畫面或同一筆訂單。
- 可重現：重整頁面或隔天回來，仍保有相同狀態的入口。

時序圖（概念）：
1. 使用者點擊「詳情」→ 前端導向 `/order/:id`
2. 前端在詳情頁發出 `GET /api/orders/:id`
3. 後端讀取 `order.json` 回傳指定訂單
4. 前端呈現訂單資訊

---

## 二、實作

### 檔案架構（前/後對照）

- 調整前（單頁聚合在 `App.vue`）：
  - `src/App.vue`：表單、列表、統計、匯入 全在同頁

 - 調整後（導入 Router，切頁）：
  - `src/router/index.js`：路由表（`/order`、`/summary`、`/order/:id`）
  - `src/pages/OrderPage.vue`：點餐頁（表單、列表、匯入；統計已抽離）
  - `src/pages/SummaryPage.vue`：統計頁（重用 `OrderStats`，含「回到點餐」連結）
  - `src/pages/OrderDetailPage.vue`：訂單詳情頁（動態路由）
  - `src/components/OrderList.vue`：新增「詳情」連結
  - `src/main.js`：註冊 `router`

### 路由定義

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage },
  { path: '/order/:id', component: OrderDetailPage },

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### 前端流程 Flow（/order → /order/:id）

1. 列表顯示每筆訂單，旁邊有「詳情」按鈕（`<router-link :to="/order/:id">`）。
2. 進入詳情頁時，`OrderDetailPage` 以 `OrderService.getById(id)` 取回資料並呈現。

### 導覽與抽離調整

- 統計表自點餐頁抽離，集中於 `/summary`，以 `components/OrderStats.vue` 呈現「飲料/甜度/冰量/數量」與總杯數。
- 導覽統一放在頁面頂部（`App.vue`）；`SummaryPage.vue` 提供「回到點餐」按鈕，`OrderPage.vue` 不再重複顯示底部導覽。
- 後端 `server.js` 修正首行意外字元，避免啟動時語法錯誤。

### 後端 API 變更

新增 `GET /api/orders/:id`：

```js
// backend/server.js （節錄）
app.get("/api/orders/:id", async (req, res) => {
  try {
    const orders = await readOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "找不到指定的訂單" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "無法取得訂單" });
  }
});
```

### 實作步驟與完整程式碼

1) 安裝並啟用 Router
- 前端 `package.json` 已加入 `vue-router`
- 在 `src/main.js` 掛載 `router`

```1:20:day15/frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

2) 建立路由表與頁面
- `src/router/index.js` 定義 `/order`、`/summary`、`/order/:id`
- `App.vue` 放全域導覽與 `router-view`

```1:50:day15/frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage },
  { path: '/order/:id', component: OrderDetailPage },

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

```1:40:day15/frontend/src/App.vue
<script setup>
</script>

<template>
  <main class="page">
    <h1>飲料點單系統 (Router 版)</h1>
    <nav style="display:flex; gap:8px; margin:12px 0;">
      <router-link to="/order" class="btn">點餐之塔</router-link>
      <router-link to="/summary" class="btn">結算之室</router-link>
    </nav>
    <router-view />
  </main>
  
</template>
```

3) 點餐頁（OrderPage）
- 負責表單、列表與匯入（統計表已抽離）

```1:120:day15/frontend/src/pages/OrderPage.vue
<script setup>
import { onMounted } from 'vue'
import OrderForm from '../components/OrderForm.vue'
import OrderList from '../components/OrderList.vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

onMounted(() => {
  orderStore.loadOrders()
  menuStore.loadMenu()
})

function handleSubmit(payload) {
  orderStore.createOrder(payload)
}
function handleEdit({ index, patch }) {
  orderStore.updateOrder(index, patch)
}
function handleRemove(index) {
  orderStore.removeOrder(index)
}
</script>

<template>
  <section>
    <div v-if="orderStore.error" class="error-message">
      ⚠️ {{ orderStore.error }}
      <button @click="orderStore.loadOrders" class="btn btn-sm">重新載入</button>
    </div>

    <div v-if="orderStore.loading" class="loading-message">
      🔄 載入中...
    </div>

    <OrderForm
      :disabled="orderStore.loading"
      :drinks="menuStore.drinks"
      :sweetnessOptions="menuStore.sweetnessOptions"
      :iceOptions="menuStore.iceOptions"
      :menuRules="menuStore.rules"
      @submit="handleSubmit"
    />

    <section class="list">
      <h3>目前已送出的訂單 ({{ orderStore.orders.length }} 筆)</h3>
      <OrderList :orders="orderStore.orders" @edit="handleEdit" @remove="handleRemove" />
    </section>

    <section class="block" style="margin-top:16px">
      <h3>祕書匯入訂單（貼上 JSON 陣列）</h3>
      <textarea
        :value="orderStore.ordersJson"
        @input="orderStore.setOrdersJson($event.target.value)"
        style="width:100%; min-height:160px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"
        placeholder='[ { "name": "王小美", "note": "少冰", "drink": "紅茶", "sweetness": "去糖", "ice": "去冰" } ]'
      ></textarea>
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" @click="orderStore.replaceAllOrders(JSON.parse(orderStore.ordersJson))">套用到後端</button>
        <button class="btn" @click="orderStore.loadOrders">重新載入（後端）</button>
      </div>
    </section>
  </section>
  
</template>
```

4) 結算頁（SummaryPage）
- 重用 `OrderStats` 顯示統計；提供「回到點餐」

```1:120:day15/frontend/src/pages/SummaryPage.vue
<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'
import OrderStats from '../components/OrderStats.vue'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

onMounted(() => {
  if (!orderStore.orders.length) {
    orderStore.loadOrders()
  }
  if (!menuStore.drinks.length) {
    menuStore.loadMenu()
  }
})
</script>

<template>
  <section class="stats">
    <h2>結算之室</h2>
    <nav style="margin:8px 0">
      <router-link class="btn" to="/order">回到點餐</router-link>
    </nav>
    <OrderStats :orders="orderStore.orders" :summary="orderStore.summaryRows" />
  </section>
</template>
```

5) 訂單詳情頁（OrderDetailPage）
- 動態路由讀取單筆訂單

```1:120:day15/frontend/src/pages/OrderDetailPage.vue
<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '../services/orderService'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await OrderService.getById(route.params.id)
  } catch (e) {
    error.value = '讀取訂單失敗'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="block">
    <h2>訂單詳情</h2>
    <div v-if="loading" class="loading-message">讀取中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <template v-else-if="order">
      <p><b>姓名：</b>{{ order.name }}</p>
      <p><b>飲料：</b>{{ order.drink }}</p>
      <p><b>甜度：</b>{{ order.sweetness }}</p>
      <p><b>冰量：</b>{{ order.ice }}</p>
      <p><b>備註：</b>{{ order.note }}</p>
      <p><b>建立時間：</b>{{ order.createdAt }}</p>
      <p v-if="order.updatedAt"><b>更新時間：</b>{{ order.updatedAt }}</p>
      <div class="actions" style="margin-top:12px">
        <button class="btn" @click="router.push('/order')">返回列表</button>
      </div>
    </template>
    <div v-else>無資料</div>
  </section>
</template>
```

6) 列表加入詳情連結

```1:120:day15/frontend/src/components/OrderList.vue
<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({ orders: { type: Array, required: true } })
const emit  = defineEmits(['edit', 'remove'])

const editIndex = ref(-1)
const editForm  = reactive({ name: '', note: '', drink: '', sweetness: '', ice: '' })

function toggleEdit(i){
  if (editIndex.value === i) { editIndex.value = -1; return }
  editIndex.value = i
  Object.assign(editForm, props.orders[i])
}
function applyEdit(){
  if (editIndex.value < 0) return
  emit('edit', { index: editIndex.value, patch: { ...editForm } })
  editIndex.value = -1
}
function cancelEdit(){ editIndex.value = -1 }
function removeOrder(i){
  emit('remove', i)
  if (editIndex.value === i) editIndex.value = -1
}
</script>

<template>
  <ul>
    <li v-for="(o, i) in props.orders" :key="i" class="order">
      <div class="row">
        <div class="col">
          <span class="idx">{{ i + 1 }}.</span>
          <span class="name">{{ o.name }}</span>
          <span class="pill">{{ o.drink }}</span>
          <span class="pill" :class="o.ice === '去冰' ? 'is-noice' : 'is-ice'">{{ o.ice }}</span>
          <span class="pill" :class="o.sweetness === '去糖' ? 'is-nosugar' : 'is-sugar'">{{ o.sweetness }}</span>
          <span v-if="o.note" class="note">備註：{{ o.note }}</span>
        </div>
        <div class="actions">
          <router-link v-if="o.id" class="btn btn-sm" :to="`/order/${o.id}`">詳情</router-link>
          <button class="btn btn-sm" @click="toggleEdit(i)">{{ editIndex === i ? '收合' : '編輯' }}</button>
          <button class="btn btn-sm del" @click="removeOrder(i)">刪除</button>
        </div>
      </div>
      <!-- 編輯區塊省略 -->
    </li>
  </ul>
</template>
```

7) Service 新增單筆查詢

```1:80:day15/frontend/src/services/orderService.js
import { http } from './http'

export const OrderService = {
  async list() {
    const { data } = await http.get('/api/orders')
    return data
  },

  async getById(id) {
    const { data } = await http.get(`/api/orders/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/orders', payload)
    return data
  },

  async update(id, patch) {
    const { data } = await http.put(`/api/orders/${id}`, patch)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/orders/${id}`)
    return data
  },

  async replaceAll(orders) {
    const { data } = await http.put('/api/orders/bulk', orders)
    return data
  },
}
```

8) 後端 API 新增單筆查詢與小修

```1:40:day15/backend/server.js
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
```

```60:120:day15/backend/server.js
// 🔎 GET /api/orders/:id - 取得指定訂單
app.get("/api/orders/:id", async (req, res) => {
  try {
    const orders = await readOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "找不到指定的訂單" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "無法取得訂單" });
  }
});
```

前端 `OrderService` 新增 `getById`：

```js
// src/services/orderService.js （節錄）
async getById(id) {
  const { data } = await http.get(`/api/orders/${id}`)
  return data
}
```

### 為何這樣切？
- 職責分離：頁面 vs. 元件；路由掌握頁面切換，元件負責重用。
- 可分享與重現：URL 即狀態入口，適合對帳、客服查單與教學頁。
- 擴充簡單：之後加上登入守衛、權限、查詢字串等都能沿用結構。

---

## 三、總結

- 今天把 Router 正式落地在飲料系統，完成 4 條關鍵路由與單筆查詢 API。
- 優點：可分享、可重現、結構清晰、擴充容易。
- 潛在缺點：頁面切分後需要注意資料載入重複與快取策略；需對錯誤狀態做一致顯示。

你現在可以：
- 前往 `/order` 進行點餐、測試匯入功能
- 前往 `/summary` 查看統計
- 於列表點「詳情」或直接輸入 `/order/:id` 檢視某筆訂單
- 於 `/article/:id` 測試動態文章頁


