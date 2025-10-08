本日重點：多語系施法術 – Vue i18n 入門（靜態版 + 後端動態版）

一、學習地圖（魔法師版本）
- 學習階段（Day17）：前端靜態 JSON config（快速上手 i18n）
- 進階實戰：後端載入語系（API 版，動態更新文案）
- 大型專案：接 CMS / i18n 平台（Lokalise、POEditor 等）

二、使用者故事
- 外國魔法師想切英文介面；管理者 roni 想在線上後台直接編輯飲料/甜度/冰量的多國翻譯，前端根據語系切換顯示並記住偏好。

三、安裝套件（前端）
```bash
cd day17/frontend
npm i vue-i18n
```

四、前端靜態 i18n（檔案）
- `src/locales/zh-TW.json`、`en-US.json`、`ja-JP.json`
- `src/main.js` 掛載 i18n，預設語系 zh-TW，fallback en-US
- `App.vue` 加入右上角語系切換器，並以 `$t` 取代標題與導覽文字
- 各頁/元件（`OrderPage.vue`、`SummaryPage.vue`、`OrderDetailPage.vue`、`OrderForm.vue`、`OrderList.vue`、`OrderStats.vue`）改採 `$t`

五、後端動態 i18n（API + 後台）
- 新增 `backend/i18n.json`：可由 admin 更新的字典（飲料/甜度/冰量三類）
- 新增 API：
  - `GET /api/i18n-config` 取得字典
  - `PUT /api/i18n-config` 更新字典（需 admin）
  - `GET /api/users/me` 取得目前使用者（含 preferredLocale）
  - `PUT /api/users/me/locale` 更新偏好語系
- 前端 `stores/i18nStore.js`：載入/更新字典、翻譯輔助 `translate(category,key,locale)`、偏好語系存取
- 新增 `AdminI18nPage.vue`：管理者編輯字典（示範新增鍵與各語言值）

六、頁面體驗
- `App.vue` 切換語系 → 更新 `document.title`，若已登入則同步到後端偏好
- 點單頁 `OrderPage.vue`：用 OptionGroup 的 `value/label` 顯示翻譯但送後端仍保留原始值
- 清單/詳情/統計：顯示翻譯（保留原值統計），避免資料層污染

七、流程圖（i18n 切換）
1) 使用者切換語系 → 2) 更新 i18n.locale → 3) 重新渲染 UI → 4) 已登入則呼叫 `PUT /api/users/me/locale` 持久化 → 5) 顯示對應翻譯（靜態 + 後端字典）

八、相關改動重點檔案（前端）
- `src/main.js`：掛載 i18n
- `src/App.vue`：語系切換器 + 導覽 `$t`
- `src/pages/*.vue`、`src/components/*.vue`：文案 `$t`、選項翻譯
- `src/stores/i18nStore.js`：後端字典/偏好語系
- `src/locales/*.json`：靜態語系檔

九、相關改動重點檔案（後端）
- `backend/i18n.json`：字典檔
- `backend/server.js`：新增 i18n 端點與使用者偏好語系端點

十、驗收與示範
- 登入 `roni / 123456` → 進入 `/admin/i18n` 編輯翻譯（新增「綠茶 -> en: Green Tea, ja: りょくちゃ」等）
- 前端點單頁右上角切換語系，飲料/甜度/冰量顯示即時切換

十一、擴充建議
- 接 CMS 平台進行審核與多環境部署
- 前端支援懶載入語系檔與路由分頁標題 i18n meta


十二、待辦清單（完成版）
- 安裝並設定前端 vue-i18n，加入靜態 locales【已完成】
- 在 App 導覽加入語系切換器與標題 i18n【已完成】
- 新增 Pinia i18nStore 管理語系、讀取/儲存後端設定【已完成】
- 動態商品翻譯：建立後端 i18n.json 與 API (GET/PUT)【已完成】
- 新增 Admin i18n 編輯頁（僅 admin 可見）【已完成】
- 將 OrderForm/List/Stats/Detail 顯示改為依語系翻譯【已完成】
- 在 day17 說明文件補充安裝、流程圖、兩版本教學【已完成】

十三、實作流程（一步一步）
1) 安裝 vue-i18n 並在 `main.js` 掛載。
2) 新增三份靜態語系檔（zh-TW/en-US/ja-JP），把頁面與元件文案改用 `$t`。
3) 後端新增 `i18n.json` 與 API：讀取/更新字典、使用者偏好語系。
4) 建立 `i18nStore`（Pinia）：載入/儲存字典與 `preferredLocale`，提供 `translate(category, key, locale)`。
5) 在 `App.vue` 的 `onMounted` 先呼叫 `i18nStore.loadServerConfig()`，確保進入任何頁面時品項翻譯已可用；右上語系切換時更新 `document.title`，且（若已登入）同步偏好到後端。
6) 點單頁以 `value/label` 呈現翻譯但保留原始鍵值送後端，避免資料層污染；列表/詳情/統計顯示翻譯結果。
7) 新增 `AdminI18nPage`（admin）讓 roni 直接編輯字典。
8) 更新本文件，彙整教學與所有改動。

十四、所有改動檔案與重點程式碼節錄

- 前端依賴
**day17/frontend/package.json**
```json
{
  "name": "day7-component-order-bervage",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": {
    "axios": "^1.12.2",
    "pinia": "^2.3.1",
    "vue-i18n": "^9.14.0",
    "vee-validate": "^4.15.1",
    "vue": "^3.5.21",
    "vue-router": "^4.5.1",
    "yup": "^1.7.1"
  },
  "devDependencies": { "@vitejs/plugin-vue": "^6.0.1", "vite": "npm:rolldown-vite@7.1.12" },
  "overrides": { "vite": "npm:rolldown-vite@7.1.12" }
}
```

- 掛載 i18n 與匯入靜態語系
**day17/frontend/src/main.js**
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'

const app = createApp(App)
app.use(createPinia())
app.use(router)
const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: { 'zh-TW': zhTW, 'en-US': enUS, 'ja-JP': jaJP }
})
app.use(i18n)
app.mount('#app')
```

- App：導覽 `$t`、語系切換、同步後端偏好
**day17/frontend/src/App.vue**
```vue
<script setup>
import { useAuthStore } from './stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from './stores/i18nStore'

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()
const i18nStore = useI18nStore()

function logout() { auth.clear(); router.push('/login') }
function switchLocale(lang) {
  locale.value = lang
  document.title = t('app.title')
  if (auth.isAuthenticated) i18nStore.updatePreferredLocale(lang, auth.token)
}
</script>

<template>
  <main class="page">
    <h1>{{ t('app.header') }}</h1>
    <nav style="display:flex; gap:8px; margin:12px 0;">
      <router-link to="/order" class="btn">{{ t('nav.order') }}</router-link>
      <router-link to="/summary" class="btn">{{ t('nav.summary') }}</router-link>
      <span style="flex:1"></span>
      <select class="btn" @change="switchLocale($event.target.value)">
        <option value="zh-TW">中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
      </select>
      <button v-if="auth.isAuthenticated" class="btn" @click="logout">登出</button>
    </nav>
    <router-view />
  </main>
</template>
```

- 路由：Admin 頁與 afterEach 標題
**day17/frontend/src/router/index.js**
```js
import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../pages/OrderPage.vue'
import SummaryPage from '../pages/SummaryPage.vue'
import OrderDetailPage from '../pages/OrderDetailPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AdminI18nPage from '../pages/AdminI18nPage.vue'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

const routes = [
  { path: '/', redirect: '/order' },
  { path: '/login', component: LoginPage },
  { path: '/order', component: OrderPage },
  { path: '/summary', component: SummaryPage, meta: { requiresAdmin: true } },
  { path: '/order/:id', component: OrderDetailPage },
  { path: '/admin/i18n', component: AdminI18nPage, meta: { requiresAdmin: true } },
]

export const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.path !== '/login' && !auth.isAuthenticated) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta?.requiresAdmin && !auth.isAdmin) return { path: '/order' }
})

router.afterEach(() => {
  try { const { t } = useI18n(); document.title = t('app.title') } catch {}
})
```

小節：/admin/i18n 的權限驗證
- 路由 `'/admin/i18n'` 具有 `meta: { requiresAdmin: true }`，並由全域守衛檢查。
- 守衛規則：
  - 未登入造訪任一路由（含 `/admin/i18n`）會被導向 `/login`。
  - 已登入但非 admin（例如一般使用者）造訪 `/admin/i18n` 會被導向 `/order`。
- 測試方式：
  - 使用 `roni / 123456` 登入（admin）→ 可進入 `/admin/i18n` 並編輯字典。
  - 使用一般帳號（如 `corgi / 123456`）登入 → 造訪 `/admin/i18n` 會被自動導回 `/order`。

- i18n 字典 Store（Pinia）
**day17/frontend/src/stores/i18nStore.js**
```js
import { defineStore } from 'pinia'
import { http } from '../services/http'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    languages: ['zh-TW','en-US','ja-JP'],
    dict: { drinks: {}, sweetness: {}, ice: {} },
    preferredLocale: 'zh-TW',
    loading: false,
    error: ''
  }),
  actions: {
    async loadServerConfig() { ... },
    async saveServerConfig(payload, token) { ... },
    translate(category, key, locale) { ... },
    async loadMe(token) { ... },
    async updatePreferredLocale(locale, token) { ... }
  }
})
```

- Admin i18n 編輯頁（僅 admin）
**day17/frontend/src/pages/AdminI18nPage.vue**
```vue
<script setup>
import { onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useI18nStore } from '../stores/i18nStore'
import { useI18n } from 'vue-i18n'
...
</script>
<template>
  <section class="page">
    <h2>{{ t('pages.stats') }} Admin i18n</h2>
    ...
  </section>
</template>
```

- 點單頁：用字典轉 label，仍保留 value（原始鍵）
**day17/frontend/src/pages/OrderPage.vue**
```vue
<OrderForm
  :disabled="orderStore.loading"
  :drinks="menuStore.drinks.map(d => ({ value: d, label: i18nStore.translate('drinks', d, $i18n.locale) }))"
  :sweetnessOptions="menuStore.sweetnessOptions.map(s => ({ value: s, label: i18nStore.translate('sweetness', s, $i18n.locale) }))"
  :iceOptions="menuStore.iceOptions.map(i => ({ value: i, label: i18nStore.translate('ice', i, $i18n.locale) }))"
  :menuRules="menuStore.rules"
  @submit="handleSubmit"
/>
```

- OptionGroup：支援 `value/label`
**day17/frontend/src/components/OptionGroup.vue**
```vue
<label v-for="opt in options" :key="typeof opt === 'string' ? opt : opt.value" style="margin-right:12px">
  <input
    type="radio"
    :checked="modelValue === (typeof opt === 'string' ? opt : opt.value)"
    @change="emit('update:modelValue', (typeof opt === 'string' ? opt : opt.value))"
  />
  {{ typeof opt === 'string' ? opt : opt.label }}
</label>
```

- OrderForm：驗證/文案 `$t`
**day17/frontend/src/components/OrderForm.vue**
```vue
const sweetnessBase = yup.string().required(t('validations.pickSweetness'))
  .when('drink', (drink, s) => drink === '抹茶拿鐵' ? s.notOneOf(['去糖'], t('validations.noSugarForMatcha')) : s)
const iceBase = yup.string().required(t('validations.pickIce'))
  .when('drink', (drink, s) => drink === '巧克力' ? s.oneOf(['熱飲'], t('validations.chocolateHotOnly')) : s)
...
<OptionGroup :label="t('steps.pickDrink')" ... />
<OptionGroup :label="t('steps.pickSweetness')" ... />
<OptionGroup :label="t('steps.pickIce')" ... />
<button class="submit enabled">{{ t('actions.submit') }}</button>
```

- OrderList/OrderStats/Detail/Login/Summary：文案 `$t` 與顯示翻譯（節錄）
**day17/frontend/src/components/OrderStats.vue**
```vue
<h3>{{$t('pages.stats')}}</h3>
<th>{{$t('fields.drink')}}</th><th>{{$t('fields.sweetness')}}</th><th>{{$t('fields.ice')}}</th><th>{{$t('fields.count')}}</th>
```

**day17/frontend/src/pages/LoginPage.vue**
```vue
<h2>{{ t('pages.login') }}</h2>
<label>{{ t('fields.username') }}：<input ... /></label>
<button class="btn primary">{{ t('actions.login') }}</button>
```

**day17/frontend/src/pages/OrderDetailPage.vue**
```vue
<h2>{{ t('pages.orderDetail') }}</h2>
<div v-if="loading" class="loading-message">{{ t('common.loading') }}</div>
<p><b>{{ t('fields.drink') }}：</b>{{ order.drink }}</p>
```

- 前端靜態語系 JSON（節錄）
**day17/frontend/src/locales/zh-TW.json**
```json
{
  "app": { "title": "飲料點單系統 (Router 版)", "header": "飲料點單系統 (Router 版)" },
  "nav": { "order": "點餐之塔", "summary": "結算之室" },
  ...
}
```

**day17/frontend/src/locales/en-US.json**
```json
{
  "app": { "title": "Drink Ordering System (Router)", "header": "Drink Ordering System (Router)" },
  ...
}
```

**day17/frontend/src/locales/ja-JP.json**
```json
{
  "app": { "title": "ドリンク注文システム（ルーター版）", "header": "ドリンク注文システム（ルーター版）" },
  ...
}
```

- 後端：i18n 字典檔
**day17/backend/i18n.json**
```json
{
  "languages": ["zh-TW", "en-US", "ja-JP"],
  "drinks": { "紅茶": {"zh-TW": "紅茶", "en-US": "Black Tea", "ja-JP": "こうちゃ"}, ... },
  "sweetness": { "正常甜": {"zh-TW": "正常甜", "en-US": "Regular Sugar", "ja-JP": "普通糖"}, ... },
  "ice": { "正常冰": {"zh-TW": "正常冰", "en-US": "Regular Ice", "ja-JP": "普通氷"}, ... }
}
```

- 後端：`server.js` 新增 i18n 與偏好語系 API（節錄）
**day17/backend/server.js**
```js
const I18N_FILE = path.join(__dirname, "i18n.json");
async function readI18nConfig() { ... }
async function writeI18nConfig(cfg) { ... }
```

**day17/backend/server.js**
```js
// POST /api/login - 建立或登入帳號
// 加入 preferredLocale 傳回
return res.json({ username: user.username, role: user.role, token: user.token, preferredLocale: user.preferredLocale || 'zh-TW' });
```

**day17/backend/server.js**
```js
// GET /api/ordermenu
```

**day17/backend/server.js**
```js
// GET /api/orders/:id（原有，含權限檢查）
```

**day17/backend/server.js**
```js
app.listen(PORT, () => {
  console.log(`   GET    /api/i18n-config - 取得 i18n 字典`);
  console.log(`   PUT    /api/i18n-config - 更新 i18n 字典（admin）`);
  console.log(`   GET    /api/users/me    - 取得目前使用者`);
  console.log(`   PUT    /api/users/me/locale - 更新偏好語系`);
});
```

**day17/backend/server.js**
```js
// 新增：使用者資訊與偏好語系
app.get('/api/users/me', async (req, res) => { ... })
app.put('/api/users/me/locale', async (req, res) => { ... })
```

**day17/backend/server.js**
```js
// 新增：I18n 設定讀寫（admin）
app.get('/api/i18n-config', async (_req, res) => { ... })
app.put('/api/i18n-config', async (req, res) => { ... })
```

以上列出本日所有改動與關鍵程式碼片段，完整檔案請見對應路徑。

十五、後端完整改動程式碼

- i18n 檔案路徑與讀寫函式
```15:15:day17/backend/server.js
const I18N_FILE = path.join(__dirname, "i18n.json");
```

```73:88:day17/backend/server.js
async function readI18nConfig() {
  try {
    const txt = await fs.readFile(I18N_FILE, 'utf8')
    return JSON.parse(txt)
  } catch (e) {
    return { languages: ["zh-TW"], drinks: {}, sweetness: {}, ice: {} }
  }
}
async function writeI18nConfig(cfg) {
  try {
    await fs.writeFile(I18N_FILE, JSON.stringify(cfg, null, 2), 'utf8')
    return true
  } catch (e) {
    return false
  }
}
```

- login：加入 preferredLocale 回傳
```97:128:day17/backend/server.js
// POST /api/login - 建立或登入帳號
app.post('/api/login', async (req, res) => {
  try {
    const username = (req.body?.username || '').trim();
    const password = (req.body?.password || '').trim();
    if (!username) return res.status(400).json({ error: 'username 必填' });
    if (password !== '123456') return res.status(401).json({ error: '密碼錯誤' });

    let users = await readUsers();
    let user = users.find(u => u.username === username);
    const role = username === 'roni' ? 'admin' : 'user';

    if (!user) {
      // 建立新使用者（密碼一律 123456）
      user = { username, password: '123456', role, token: encodeToken(username), preferredLocale: 'zh-TW' };
      users.push(user);
      await writeUsers(users);
    } else {
      // 既有使用者：確認密碼（此示範固定 123456）
      if (user.password !== '123456') {
        return res.status(401).json({ error: '密碼錯誤' });
      }
      user.token = encodeToken(username);
      user.role = role;
      await writeUsers(users);
    }

    return res.json({ username: user.username, role: user.role, token: user.token, preferredLocale: user.preferredLocale || 'zh-TW' });
  } catch (e) {
    res.status(500).json({ error: '登入失敗' });
  }
});
```

- 取得目前使用者與更新偏好語系
```130:141:day17/backend/server.js
// 取得目前使用者
app.get('/api/users/me', async (req, res) => {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ error: '未提供授權' })
  const users = await readUsers()
  const username = decodeToken(token)
  const me = users.find(u => u.username === username && u.token === token)
  if (!me) return res.status(401).json({ error: '授權無效' })
  res.json({ username: me.username, role: me.role, preferredLocale: me.preferredLocale || 'zh-TW' })
})
```

```142:156:day17/backend/server.js
// 更新偏好語系
app.put('/api/users/me/locale', async (req, res) => {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ error: '未提供授權' })
  const users = await readUsers()
  const username = decodeToken(token)
  const me = users.find(u => u.username === username && u.token === token)
  if (!me) return res.status(401).json({ error: '授權無效' })
  const locale = (req.body?.locale || '').trim()
  if (!locale) return res.status(400).json({ error: 'locale 必填' })
  me.preferredLocale = locale
  await writeUsers(users)
  res.json({ ok: true, preferredLocale: me.preferredLocale })
})
```

- i18n 設定讀寫（admin）
```158:162:day17/backend/server.js
// I18n 設定：讀取
app.get('/api/i18n-config', async (_req, res) => {
  const cfg = await readI18nConfig()
  res.json(cfg)
})
```

```164:186:day17/backend/server.js
// I18n 設定：更新（僅 admin）
app.put('/api/i18n-config', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: '未提供授權' })
    const users = await readUsers()
    const username = decodeToken(token)
    const me = users.find(u => u.username === username && u.token === token)
    if (!me) return res.status(401).json({ error: '授權無效' })
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' })

    const incoming = req.body
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'payload 應為物件' })
    }
    const ok = await writeI18nConfig(incoming)
    if (!ok) return res.status(500).json({ error: '寫入失敗' })
    res.json(incoming)
  } catch (e) {
    res.status(500).json({ error: '更新 i18n 設定失敗' })
  }
})
```

- 伺服器啟動時列印端點（含 i18n 與偏好語系）
```390:403:day17/backend/server.js
app.listen(PORT, () => {
  console.log(`🚀 飲料點單 API 伺服器啟動成功！`);
  console.log(`📍 伺服器位址: http://localhost:${PORT}`);
  console.log(`📋 API 端點:`);
  console.log(`   GET    /api/orders     - 取得所有訂單`);
  console.log(`   POST   /api/orders     - 新增訂單`);
  console.log(`   PUT    /api/orders/:id - 更新訂單`);
  console.log(`   DELETE /api/orders/:id - 刪除訂單`);
  console.log(`   GET    /api/ordermenu  - 取得飲料菜單`);
  console.log(`   GET    /api/i18n-config - 取得 i18n 字典`);
  console.log(`   PUT    /api/i18n-config - 更新 i18n 字典（admin）`);
  console.log(`   GET    /api/users/me    - 取得目前使用者`);
  console.log(`   PUT    /api/users/me/locale - 更新偏好語系`);
});
```

- 後端 i18n 字典檔（完整）
```1:19:day17/backend/i18n.json
{
  "languages": ["zh-TW", "en-US", "ja-JP"],
  "drinks": {
    "紅茶": {"zh-TW": "紅茶", "en-US": "Black Tea", "ja-JP": "こうちゃ"},
    "綠茶": {"zh-TW": "綠茶", "en-US": "Green Tea", "ja-JP": "りょくちゃ"},
    "巧克力": {"zh-TW": "巧克力", "en-US": "Chocolate", "ja-JP": "チョコレート"},
    "抹茶拿鐵": {"zh-TW": "抹茶拿鐵", "en-US": "Matcha Latte", "ja-JP": "抹茶ラテ"}
  },
  "sweetness": {
    "正常甜": {"zh-TW": "正常甜", "en-US": "Regular Sugar", "ja-JP": "普通糖"},
    "少糖": {"zh-TW": "少糖", "en-US": "Less Sugar", "ja-JP": "少なめ"},
    "去糖": {"zh-TW": "去糖", "en-US": "No Sugar", "ja-JP": "無糖"}
  },
  "ice": {
    "正常冰": {"zh-TW": "正常冰", "en-US": "Regular Ice", "ja-JP": "普通氷"},
    "去冰": {"zh-TW": "去冰", "en-US": "Less Ice", "ja-JP": "氷少なめ"},
    "熱飲": {"zh-TW": "熱飲", "en-US": "Hot", "ja-JP": "ホット"}
  }
}
```
