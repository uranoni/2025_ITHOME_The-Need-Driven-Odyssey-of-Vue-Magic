## 一、需求分析：為什麼需要傳送門？

在魔法學院裡，巫師們不可能永遠只待在`大廳（App.vue）`。有時候要去「點餐之塔」下訂單，有時候要前往「結算之室」檢視總金額，甚至還可能需要直接打開某篇卷軸（文章頁）。

如果每次切換場景都得從大廳走起，會非常低效。於是我們需要**傳送門（Vue Router）**：

1. **精準定位**：讓使用者能直接輸入網址，立刻抵達對應場景。

   * 例：`/order` → 點餐頁
   * 例：`/summary` → 訂單總覽頁
2. **攜帶符文（參數）**：網址能帶上變數，就像通關密語一樣，打開指定內容。

   * 例：`/article/42` → 打開編號 42 的卷軸
   * 例：`/order/abc123` → 進入指定的訂單詳情

這樣一來，不管是使用者手動輸入網址、點連結，還是從其他魔法卷軸傳送過來，都能直達目的地。

---

## 二、Vue Router 的概念與技術

Vue Router 是 Vue 官方提供的「路徑管理法術」。它的本質是一個 **路由表（Route Table）**：把 **路徑** 與 **組件** 綁在一起。

* 當你進入 `/order` → Vue Router 就召喚 `OrderPage.vue`
* 當你進入 `/summary` → Vue Router 就召喚 `SummaryPage.vue`
* 當你進入 `/article/:id` → Vue Router 就召喚 `ArticlePage.vue`，並附帶 `id` 參數給你使用

**三個關鍵法則：**

1. **定義法陣**（routes）：設好每個路徑對應的組件
2. **傳送法術**（router-link）：用 `<router-link>` 在頁面間穿梭
3. **召喚位置**（router-view）：告訴 Vue 要把召喚出來的組件顯示在哪裡

### 時序圖

我們可以把這個情境一樣用時序圖畫出來比較好理解~~

![https://ithelp.ithome.com.tw/upload/images/20251004/20121052lbBVo6xoRx.png](https://ithelp.ithome.com.tw/upload/images/20251004/20121052lbBVo6xoRx.png)

---

## 三、Vue Router 的簡單寫法與需求對應

### 對應需求一：固定場景傳送

```js
{ path: '/order', component: OrderPage }
{ path: '/summary', component: SummaryPage }
```

* 使用者進入 `/order` 就會看到點餐畫面。
* 使用者進入 `/summary` 就會看到統計畫面。

### 對應需求二：攜帶參數的場景

```js
{ path: '/article/:id', component: ArticlePage }
```

* `:id` 是一個動態符文（動態參數）。
* 進入 `/article/42` → 可以在 `ArticlePage` 裡透過 `route.params.id` 拿到 `42`。

### 程式流程圖

我們根據上面提到的需求-> 程式拆解

可以寫成這樣的程式流程圖

程式流程圖很適合幫我們理解`流程控制`或是`路由轉換`的圖像化

![https://ithelp.ithome.com.tw/upload/images/20251004/20121052i7FTDFOgK6.png](https://ithelp.ithome.com.tw/upload/images/20251004/20121052i7FTDFOgK6.png)

---

## 四、實作程式碼

### 1. 安裝 Vue Router

```bash
npm install vue-router
```

### 2. 建立 router/index.js

```js
import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import ArticlePage from '../pages/ArticlePage.vue'

const routes = [
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage },
  { path: '/article/:id', component: ArticlePage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### 3. 在 main.js 啟用

```js
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 4. 在 App.vue 放置傳送門

```
<template>
  <nav>
    <router-link to="/order">點餐之塔</router-link>
    <router-link to="/summary">結算之室</router-link>
  </nav>
  <router-view />
</template>
```

### 5. 在 ArticlePage.vue 取出參數

```
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id
</script>

<template>
  <h2>你正在閱讀卷軸 #{{ id }}</h2>
</template>
```

---

## 五、總結與注意事項

* Vue Router 就像是魔法學院的**傳送門法陣**，能讓使用者不必從頭走流程，而是直達任意場景。
* 好處：

  1. **可分享**：把網址給同伴，他們能直接進入相同場景。
  2. **可重現**：重新整理頁面，依然停留在正確位置，不會失去狀態。
  3. **可擴充**：支援動態參數，適合文章頁、訂單詳情等需求。
* 注意事項：

  * 路由表最好集中管理，避免散落各地。
  * 若有需要驗證登入的頁面，可以加「守衛結界」（Navigation Guards）。
  * 若結合 Pinia，還能在不同頁面共享訂單、使用者資料。

---

**今天你會了「傳送門法陣」的基礎概念**，讓系統不再只是一條路，而是能分岔、跳躍、直達的冒險地圖。
明天我們會繼續擴充這些傳送法術，讓飲料學院更有「地圖感」，不再迷路。

我們明天再把系統拆分vue-router介面，並且看看要怎麼分配路徑吧!!


