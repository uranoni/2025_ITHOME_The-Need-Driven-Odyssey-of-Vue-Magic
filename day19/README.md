太好了！下面是一份「**Teleport / Modal / Toast 合體實作指南**」——你可以直接貼到 AI 編輯器，讓它自動建立檔案與黏合程式碼。整份內容包含需求→設計→檔案樹→完整程式碼→如何使用→最佳實踐與圖表。**不會推翻你現有專案**：只需新增幾個檔案、在 `App.vue` 掛載兩個 Host（Modal/Toast）並加一個 Axios 錯誤攔截器，就能全站啟用。

---

# Day XX｜傳送門雙法陣：Teleport + Modal + Toast 一次到位

## 前言（為什麼需要？）

在真實專案裡，**系統訊息**大致分兩種：

* **非阻斷提醒（Toast）**：像小精靈飛過，幾秒飄走。適合儲存成功、背景同步、輕度錯誤。
* **阻斷確認（Modal）**：像結界降臨，必須「確認/取消」才能繼續。適合刪除、不可逆動作、權限警示。

我們用 **Teleport** 把 UI 傳送到 `<body>` 最上層以避免層級干擾，用 **Transition** 做柔順過場，並以 **Pinia** 管理全域狀態。這套組合能讓你在任何組件一行程式就呼叫提示或確認，體驗一致、可測試、可國際化。

---

## 使用者故事（魔法需求書）

| 需求       | 使用者    | 目的            | 功能點                                       |
| -------- | ------ | ------------- | ----------------------------------------- |
| 刪除前二次確認  | 祕書/管理者 | 避免誤刪          | `modal.confirm({ title, message, onOk })` |
| 送單成功小提醒  | 一般使用者  | 給正向回饋         | `toast.success('已送出')`                    |
| API 失敗提示 | 所有人    | 快速理解失敗原因      | Axios response 攔截器 → `toast.error(msg)`   |
| 權限不足阻斷   | 一般使用者  | 導向登入或說明       | `modal.alert('需登入')`                      |
| 多筆錯誤彙整   | 客服/祕書  | 不被多個 alert 轟炸 | Toast queue + 自動收起、可手動關閉                  |



## CSS 與可近性整理（今天新增/使用到的語法）

| 區塊       | 目的       | 關鍵 CSS                                                                                    |
| -------- | -------- | ----------------------------------------------------------------------------------------- |
| Modal 遮罩 | 鋪滿螢幕並置中  | `position: fixed; inset: 0; display:grid; place-items:center; background: rgba(0,0,0,.4)` |
| Modal 過場 | 柔順進出     | `.modal-enter-from/active/leave-to + transform/transition`                                |
| Toast 堆疊 | 右上固定、可點擊 | `.toast-root{position:fixed; inset:12px 12px auto auto}`、`pointer-events`                 |
| Toast 過場 | 插入/移除    | `.toast-enter-from/active/leave-to`、`.toast-move`（FLIP）                                   |
| 動效降低     | 可近性      | `@media (prefers-reduced-motion: reduce) { transition-duration: 0s; }`                    |
| ARIA     | SR 朗讀    | Toast 容器 `role="region" aria-live="polite"`、Modal `role="dialog" aria-modal="true"`       |

---

## 驗收測試（功能確認）

### ✅ 基本功能驗收

1. **Toast 成功提示**
   - 送出訂單後右上角出現綠色「訂單送出成功！」Toast
   - 更新訂單後顯示「訂單已更新」Toast
   - 刪除訂單後顯示「訂單已刪除」Toast

2. **Modal 刪除確認**
   - 點擊刪除按鈕彈出「確認刪除」Modal
   - Modal 內容顯示：「確定要刪除「使用者名稱」的訂單嗎？此動作無法復原。」
   - 提供「取消」和「是的，刪除」兩個選項
   - 點擊「是的，刪除」後執行刪除並顯示成功 Toast

3. **API 錯誤自動提示**
   - 任何 API 錯誤都會自動在右上角顯示紅色錯誤 Toast
   - 錯誤訊息來自後端回應或預設「發生錯誤」

4. **過場動畫**
   - Modal 有淡入淡出效果
   - Toast 有滑入滑出效果
   - 支援 `prefers-reduced-motion` 媒體查詢

### 🎯 使用者體驗驗收

- **非阻斷式**：Toast 不會阻擋使用者操作，3秒後自動消失
- **阻斷式**：Modal 必須確認或取消才能繼續操作
- **一致性**：所有成功/錯誤提示都使用相同樣式
- **可近性**：支援螢幕閱讀器和動效敏感使用者

---

## 最佳實踐（魔法守則）

* **Modal 僅阻斷必要的事**：刪除、不可逆、權限；其餘請交給 Toast 或就地錯誤訊息。
* **Toast 不要轟炸**：可設定隊列上限/冷卻時間；重要訊息才彈。
* **攔截器集中錯誤**：避免每個呼叫都寫 `try/catch`；統一 UX。
* **國際化**：把 `title/message` 換成 `$t('…')`；Toast 文案也能走 i18n key。
* **測試**：Modal 的 `onOk` 與 service 呼叫分離，好 Mock；Toast 可檢查 store items。
* **Teleport 使用時機**：需要突破層級限制的 UI（Modal、Toast、Loading）才使用。
* **組件設計**：保持組件純粹性，業務邏輯放在 Store，組件只負責渲染。

---

## 章節收尾（你得到什麼）

* 一套 **全域、可移植、易維護** 的訊息系統：**Toast 輕提醒 + Modal 重確認**。
* 不必改動現有邏輯，只要：**新增四個檔案**、**App 掛載兩個 Host**、**http 攔截器加一段**，即可上線。
* 從此錯誤提示、成功回饋、刪除確認都有「標準做法」，UX 乾淨一致，教學也更好帶。
* **Teleport 技術**：學會了如何突破 CSS 層級限制，創建全域 UI 組件。
* **Clean Architecture**：組件與業務邏輯分離，便於測試和維護。
* **可擴展性**：未來可以輕鬆加入國際化、主題切換、自定義內容等功能。

需要我再幫你把 **Toast/Modal 文案** 改成走 `$t()`、或把 **Modal 改成可注入自定義內容元件**（例如「訂單詳情內嵌在 Modal」）的版本嗎？
