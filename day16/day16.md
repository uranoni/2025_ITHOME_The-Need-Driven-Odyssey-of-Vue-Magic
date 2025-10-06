## Day16 前言
實際專案常有「特定身分才能看某些頁面或資料」的需求，例如只有 admin/秘書能看統計頁、只有下單者本人與 admin 能看訂單詳情。今天我們在 Day15 的路由基礎上，加入簡易的登入、發 token、前後端權限驗證與路由守衛。

## 使用者需求與 User Story
- 使用者需要登入後才能操作系統。
- 若帳號不存在會自動建立（預設密碼 123456），並回傳 token 與 role。
- roni 是 admin；admin 才能查看統計頁 `/summary`。
- 單筆訂單詳情 `/order/:id` 僅限下單者本人或 admin 存取。

| 需求 | 角色 | 目的 | 功能 | 使用時機 |
| --- | --- | --- | --- | --- |
| 登入取得 token 與角色 | 所有使用者 | 進入系統 | POST /api/login | 進入首頁前 |
| 查看統計頁 | admin | 掌握整體 | 前端路由守衛 | 登入後 |
| 檢視單筆訂單 | 下單者/ admin | 查詢或對帳 | 後端驗證 token 屬主或 admin | 進入 `/order/:id` |

## 技術重點
- 前端：Vue Router 全域守衛、Pinia `authStore`、localStorage 持久化、Axios 夾帶 Bearer Token。
- 後端：Express 路由、以 base64(username) 當作 token、檔案型 `user.json` 存放使用者、在 `/api/orders/:id` 進行授權檢查。

---

## 為什麼這樣設計？
- 以 base64(username) 當 token 簡單可驗證、易於示範；實務可替換為 JWT。今天補上密碼驗證，避免任何名字都能登入。
- 把 admin 的頁面限制放在前端路由守衛，體驗即時；敏感資料（單筆訂單）再由後端強制驗證，避免繞過。
- 使用 Pinia + localStorage 確保重新整理後仍保留登入狀態。
- 登出採集中在 `App.vue` 的主導覽，對所有頁面一致可見；`authStore.clear()` 採整庫清除，符合你希望「清掉全部 localStorage」的需求。

## 本日改動檔案清單與目的
- 後端：`backend/server.js`（新增 /api/login、授權驗證）、`backend/user.json`（使用者資料存放）
- 前端：
  - `src/pages/LoginPage.vue`（登入流程）
  - `src/stores/authStore.js`（登入狀態管理與持久化、清除）
  - `src/router/index.js`（全域守衛、/summary 僅 admin）
  - `src/services/orderService.js`（夾帶 Token）
  - `src/pages/OrderDetailPage.vue`（帶 Token 讀取詳情）
  - `src/App.vue`（登出按鈕與導回 /login）

## 驗收清單
- 未登入訪問 `/order` 或 `/summary` 會被導向 `/login`。
- 使用 `roni` 登入可進入 `/summary`；其他帳號不可。
- 任一帳號登入後，僅能看自己下的 `/order/:id`，admin 可看全部。

## 總結
今天我們完成：登入流程、前後端權限驗證、路由守衛與資料夾化實作。接下來可進一步：加入登出按鈕、在請求攔截器自動附帶 token、以及以 JWT/過期時間替換示範用 base64 token。


