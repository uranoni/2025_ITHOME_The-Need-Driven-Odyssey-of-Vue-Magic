# Day 21：主題魔法的自由變換骨架 - MainLayout + CSS 變數主題系統

## 🎭 前言：魔法的自由變化骨架

在 Vue 的魔法世界中，我們已經掌握了許多強大的咒語：組件化、狀態管理、路由守衛、國際化...但今天，我們要學習的是最為優雅的魔法之一 - **主題變換術**。

想像一下，如果我們的應用程式就像一個魔法師的實驗室，能夠隨著使用者的心情和環境自由變換色彩和氛圍。白天時呈現清新明亮的 Light 模式，夜晚時切換為深邃神秘的 Dark 模式，甚至還能讓使用者自訂喜愛的顏色組合。

這就是今天我們要實作的 **主題系統** - 一個基於 CSS 變數的自由變化骨架設定，讓整個應用程式都能隨著主題的變換而呈現不同的視覺體驗。

## 🏗️ 架構重組：從單一頁面到主框架系統

### 前端架構設計的核心思想

在前端開發中，雖然框架沒有強制規定資料夾結構，但業界已經形成了一套成熟的組織方式。這種設計不僅提高了程式碼的可維護性，更讓團隊協作變得更加順暢。

#### 標準前端資料夾結構解析

```
src/
├── App.vue              # 應用程式進入點 - 整個應用的根組件
├── main.js              # 應用程式啟動入口
├── layouts/             # 佈局組件 - 應用程式的主幹架構
│   └── MainLayout.vue   # 主佈局：包含 Header、導覽、主題控制
├── pages/               # 頁面組件 - 各系統的子路由頁面
│   ├── OrderPage.vue    # 點餐系統頁面
│   ├── SummaryPage.vue  # 結算系統頁面
│   └── LoginPage.vue    # 登入系統頁面
├── components/          # 可重複利用的組件
│   ├── OrderForm.vue    # 訂單表單組件
│   ├── OptionGroup.vue  # 選項群組組件
│   └── ModalHost.vue    # 模態框宿主組件
├── stores/              # 狀態管理
│   ├── themeStore.js    # 主題狀態
│   └── authStore.js     # 認證狀態
├── router/              # 路由配置
│   └── index.js         # 路由定義
└── services/            # API 服務
    └── orderService.js  # 訂單相關 API
```

#### 為什麼大家都這樣設計前端資料夾？

1. **關注點分離 (Separation of Concerns)**
   - `App.vue` 專注於應用程式的整體結構
   - `layouts/` 負責整體佈局和框架
   - `pages/` 專注於特定功能頁面
   - `components/` 提供可重複使用的 UI 組件

2. **可維護性 (Maintainability)**
   - 每個資料夾都有明確的職責
   - 新功能可以快速定位到對應的資料夾
   - 修改某個功能時不會影響其他部分

3. **可擴展性 (Scalability)**
   - 隨著專案成長，可以輕鬆添加新的頁面和組件
   - 佈局變更只需要修改 `layouts/` 資料夾
   - 組件可以在不同頁面間重複使用

4. **團隊協作 (Team Collaboration)**
   - 不同開發者可以同時開發不同模組
   - 清晰的結構讓新成員快速上手
   - 減少程式碼衝突和重複開發

### 主要變更架構

```
原本架構：
App.vue (包含所有功能)
├── 導覽列
├── 語系切換
├── 登入登出
└── RouterView

新架構：
App.vue (精簡為 RouterView)
└── MainLayout.vue (主框架)
    ├── Header (導覽 + 主題控制)
    ├── RouterView (子頁面)
    └── ModalHost/ToastHost
```

### 新增檔案結構

```
src/
├── layouts/
│   └── MainLayout.vue          # 新增：主框架組件
├── stores/
│   └── themeStore.js           # 新增：主題狀態管理
└── style.css                   # 修改：加入 CSS 變數主題系統
```

## 🎨 CSS 變數主題系統：魔法的色彩語言

### CSS 變數設計與主題色彩管理

我們建立了完整的 CSS 變數主題系統，讓所有 UI 元素都能統一使用變數。這些變數就像魔法世界的基礎符文，定義了應用程式的視覺基調，並能隨著主題的切換而自動變換其魔力（顏色值）。

#### 主題色彩變數設計

在我們的主題系統中，定義了核心的色彩變數，它們是整個視覺語言的基石：

1. **Primary（主色）** - `#111827` (Light) / `#ffffff` (Dark)
   - 如同魔法陣的核心光芒，用於最重要的互動元素
   - 主要按鈕、強調文字、重要連結的顏色
   - 在 Light 模式下為深灰色，在 Dark 模式下為純白色

2. **Secondary（輔色）** - `#3b82f6` (Light) / `#3b82f6` (Dark)
   - 如同輔助咒語的微光，用於次要的互動元素
   - 次要按鈕、高亮元素、裝飾性元素的顏色
   - 在兩種模式下都保持藍色系，提供一致的視覺體驗

3. **Text Primary（主要文字色）** - `#111111` (Light) / `#ffffff` (Dark)
   - 如同古老卷軸上的主要銘文，用於最重要的文字內容
   - 標題、主要內容文字、重要資訊的顏色
   - 確保在兩種背景下都有最佳的對比度和可讀性

4. **Text Secondary（次要文字色）** - `#4b5563` (Light) / `#d1d5db` (Dark)
   - 如同註解或次要資訊的符號，用於輔助性文字
   - 說明文字、標籤、次要資訊的顏色
   - 提供適當的層次感，不會搶奪主要內容的注意力

#### CSS 變數的魔法原理

這些 CSS 變數的價值在於它們的**語義化命名**和**自動適應性**：

- **語義化命名**：`--color-primary` 比 `--color-blue` 更有意義，因為它表達的是「這是最重要的顏色」，而不是「這是藍色」
- **自動適應性**：當主題切換時，所有使用這些變數的元素都會自動更新，無需手動調整每個組件
- **一致性保證**：整個應用程式的視覺風格都基於這些核心變數，確保設計的一致性

```css
/* Light 主題預設 - 核心色彩變數 */
:root {
  /* Brand - 品牌魔法色 */
  --color-primary: #111827;   /* 主色：如魔法陣的核心光芒，用於按鈕、強調元素 */
  --color-secondary: #3b82f6; /* 輔色：如輔助咒語的微光，用於次要按鈕、高亮 */

  /* Text - 文字魔法色 */
  --text-primary: #111111;    /* 主要文字：如古老卷軸上的主要銘文 */
  --text-secondary: #4b5563;  /* 次要文字：如註解或次要資訊的符號 */

  /* Surface / Border - 表面與邊界魔法色 */
  --bg-page: #ffffff;         /* 頁面背景：如廣闊的魔法平原 */
  --bg-card: #ffffff;         /* 卡片背景：如漂浮的魔法石板 */
  --border-color: #e5e7eb;    /* 邊框顏色：如魔法結界的邊緣 */

  /* 通用半徑/陰影/轉場 - 魔法的形狀與動態 */
  --radius-xl: 14px;
  --shadow-lg: 0 24px 80px rgba(0,0,0,.12);
  --transition-fast: .16s ease;
}

/* Dark 主題覆寫 - 暗夜魔法的降臨 */
[data-theme="dark"] {
  --color-primary: #e5e7eb;   /* 主色變為淺色，適應暗色背景 */
  --color-secondary: #60a5fa; /* 輔色變亮，保持藍色系但增加亮度 */

  --text-primary: #f0f0f0;    /* 主要文字變為柔和的亮色，減少刺眼感 */
  --text-secondary: #b0b0b0;  /* 次要文字調整為適中的亮度，確保可讀性 */

  --bg-page: #1a1a1a;         /* 頁面背景調整為較淺的暗色，減少沉重感 */
  --bg-card: #2a2a2a;         /* 卡片背景與頁面背景保持適當區別 */
  --border-color: #404040;    /* 邊框顏色配合新的背景色系 */
}

### 重構既有樣式

所有既有的樣式類別都重構為使用 CSS 變數：

```css
.btn { 
  background: var(--bg-card); 
  color: var(--text-primary); 
  border: 1px solid var(--border-color); 
  border-radius: 10px; 
  transition: var(--transition-fast);
}

.btn.primary { 
  background: var(--color-primary); 
  color: white; 
  border-color: var(--color-primary); 
}

.order { 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  padding: 8px; 
  margin: 8px 0; 
  background: var(--bg-card); 
}
```

## 🧙‍♂️ ThemeStore：主題魔法的核心

### Pinia Store 設計

```javascript
export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' // 'light' | 'dark'
  }),

  actions: {
    setMode(mode) {
      this.mode = mode
      this.applyTheme()
      this.saveToStorage()
    },

    applyTheme() {
      const root = document.documentElement
      root.dataset.theme = this.mode
    }
  }
})
```


### 路由特點

1. **巢狀結構**：主要頁面都在 MainLayout 內
2. **獨立登入**：`/login` 不在 layout 內，不顯示導覽列
3. **守衛保留**：既有的認證和管理員守衛完全保留
4. **預設重導**：`/` 自動重導到 `/order`

## 🎯 User Story：主題變換的魔法體驗

### 使用者需求分析

#### 功能需求 (Functional Requirements)

| 需求描述 | 優先級 | 驗收標準 |
|---------|--------|----------|
| 主題模式切換功能 | 高 | 使用者可以切換 Light/Dark 模式，切換後立即生效 |
| 主題設定持久化 | 高 | 重新整理頁面後主題設定仍然保留 |
| 全域主題一致性 | 高 | 所有頁面都使用相同的主題設定 |
| 登入頁面獨立性 | 中 | 登入頁面不顯示主題控制，但登入後主題設定有效 |
| 響應式主題適配 | 中 | 主題在手機和桌面版都能正常顯示 |

#### 非功能需求 (Non-Functional Requirements)

| 需求描述 | 優先級 | 驗收標準 |
|---------|--------|----------|
| 視覺舒適性 | 高 | 暗色模式背景不刺眼，文字清晰可讀 |
| 效能要求 | 中 | 主題切換響應時間 < 100ms |
| 相容性 | 中 | 支援主流瀏覽器 (Chrome, Firefox, Safari) |
| 可維護性 | 高 | 新增頁面時自動繼承主題系統 |

### 主要使用者故事

1. **作為使用者，我希望能夠切換 Light/Dark 模式**
   - 在右上角看到主題模式選擇器
   - 點擊切換時，整個頁面立即變換色彩
   - 重新整理頁面後，選擇的主題仍然保留

2. **作為使用者，我希望在不同頁面間切換時保持一致的視覺體驗**
   - 在點餐頁面設定的主題，在訂單列表頁面也保持一致
   - 登入頁面不顯示主題控制，但登入後回到主應用時主題設定仍然有效

3. **作為使用者，我希望暗色模式舒適且文字清晰可讀**
   - 暗色背景不會過於沉重，提供舒適的視覺體驗
   - 文字顏色在暗色背景下有適當的對比度，確保清晰可讀
   - 所有 UI 元素都能在兩種模式下保持良好的視覺層次

4. **作為管理員，我希望能夠在管理頁面使用相同的主題系統**
   - 在分析頁面、i18n 管理頁面都能使用統一的主題
   - 所有管理功能都與主題系統完美整合



**為什麼在 onMounted 中載入？**
- **DOM 準備就緒**：確保 DOM 元素已經存在，可以安全地設定 dataset
- **避免閃爍**：在組件掛載後立即套用主題，避免預設主題的閃爍
- **生命週期管理**：利用 Vue 的生命週期，確保在正確的時機執行

### 4. Layout 設計的核心思想

#### 為什麼需要 Layout 組件？

在大型應用程式中，我們經常會遇到以下問題：
- **重複的 UI 元素**：每個頁面都有相同的 Header、導覽列
- **狀態管理複雜**：主題、語系、使用者狀態需要在多個組件間共享
- **維護困難**：修改 Header 樣式需要更新所有頁面

#### MainLayout 的解決方案


```

**Layout 的優勢：**
1. **關注點分離**：框架邏輯與頁面邏輯分離
2. **代碼重用**：所有頁面共享相同的框架
3. **狀態集中**：主題、語系等全域狀態在 Layout 中管理
4. **易於維護**：修改框架只需要更新一個組件

### 5. Pages 設計：路由系統的智慧

#### 為什麼需要 Pages 資料夾？

```
pages/
├── OrderPage.vue      # 點餐系統
├── SummaryPage.vue    # 結算系統  
├── LoginPage.vue      # 登入系統
└── AnalyticsPage.vue  # 分析系統
```

**Pages 的設計原則：**
1. **功能導向**：每個頁面對應一個主要功能
2. **路由對應**：頁面名稱與路由路徑保持一致
3. **獨立性**：每個頁面都是獨立的組件，可以獨立開發和測試
4. **可組合性**：頁面可以組合多個 Components 來實現複雜功能

#### 路由配置的智慧

```javascript
const routes = [
  { path: '/', redirect: '/order' },
  { path: '/login', component: LoginPage }, // 獨立頁面
  {
    path: '/',
    component: MainLayout, // 主框架
    children: [
      { path: 'order', component: OrderPage },
      { path: 'summary', component: SummaryPage },
      { path: 'analytics', component: AnalyticsPage }
    ]
  }
]
```

**巢狀路由的優勢：**
1. **URL 結構清晰**：`/order`、`/summary` 等路徑簡潔明瞭
2. **Layout 共享**：所有子路由都共享 MainLayout
3. **守衛統一**：可以在父路由層級設定全域守衛
4. **效能優化**：切換子路由時，Layout 不會重新渲染

### 6. Components 設計：可重用性的藝術

#### 組件層次結構

```
components/
├── OrderForm.vue      # 訂單表單（業務組件）
├── OptionGroup.vue    # 選項群組（UI組件）
├── ModalHost.vue      # 模態框宿主（容器組件）
└── ToastHost.vue      # 提示框宿主（容器組件）
```

**組件設計原則：**
1. **單一職責**：每個組件只負責一個功能
2. **可重用性**：組件可以在不同頁面中使用
3. **可配置性**：通過 props 和 events 與父組件通信
4. **可測試性**：組件可以獨立進行單元測試



**為什麼這樣設計？**
- **鬆耦合**：父組件和子組件通過明確的介面通信
- **可重用**：OrderForm 可以在任何需要訂單功能的地方使用
- **易於測試**：可以獨立測試組件的 props 和 events

### 7. 表單組件暗色模式支援

#### OptionGroup 組件優化
- 使用 `var(--bg-card)` 作為背景色
- 選項按鈕使用 `var(--bg-page)` 背景，hover 時變為 `var(--color-secondary)`
- 所有文字顏色都使用設計 Token

#### OrderForm 組件優化
- 表單區塊使用 `var(--bg-card)` 背景
- 輸入框使用 `var(--bg-page)` 背景和 `var(--text-primary)` 文字色
- 按鈕使用設計 Token 的顏色系統

#### OrderPage 組件優化
- 匯入區塊使用統一的卡片樣式
- 所有文字和背景都使用設計 Token
- 響應式設計確保手機版體驗良好

## 🎨 視覺效果展示

### Light 模式
- 背景：純白色 (#ffffff)
- 主色：深灰色 (#111827)
- 輔色：藍色 (#3b82f6)
- 文字：深色系，高對比度

### Dark 模式（高對比度優化版）
- 背景：深黑色 (#0f0f0f)，提供最佳對比度
- 卡片：深灰色 (#1a1a1a)，與背景形成清晰區別
- 主色：純白色 (#ffffff)，確保最佳可讀性
- 輔色：亮藍色 (#3b82f6)，保持視覺吸引力
- 主要文字：純白色 (#ffffff)，提供最高對比度
- 次要文字：亮灰色 (#d1d5db)，確保清晰可讀

### 設計 Token 自動適應
- 四大核心 Token 會根據主題模式自動調整
- 所有 UI 元素都使用設計 Token，確保一致性
- 無需手動調整，系統會自動處理顏色轉換



