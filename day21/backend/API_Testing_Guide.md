# 飲料點單 API 測試指南

## 🚀 啟動伺服器
```bash
cd backend
npm start
```
伺服器會在 `http://localhost:3000` 運行

## 📋 API 測試資料 (Postman)

### 1️⃣ GET - 取得所有訂單
```
Method: GET
URL: http://localhost:3000/api/orders
Headers: 
  Content-Type: application/json

預期回應: 
[
  {
    "id": "1",
    "name": "Alice",
    "note": "少冰",
    "drink": "紅茶",
    "sweetness": "正常甜",
    "ice": "正常冰",
    "createdAt": "2025-09-26T09:00:00Z"
  },
  ...
]
```

### 2️⃣ POST - 新增訂單
```
Method: POST
URL: http://localhost:3000/api/orders
Headers: 
  Content-Type: application/json

Body (raw JSON):
{
  "name": "測試用戶",
  "note": "請加珍珠",
  "drink": "紅茶",
  "sweetness": "正常甜",
  "ice": "去冰"
}

預期回應:
{
  "id": "1727447123456",
  "name": "測試用戶",
  "note": "請加珍珠",
  "drink": "紅茶",
  "sweetness": "正常甜",
  "ice": "去冰",
  "createdAt": "2025-09-27T13:25:23.456Z"
}
```

### 3️⃣ PUT - 更新訂單 (需要先取得 ID)
```
Method: PUT
URL: http://localhost:3000/api/orders/{訂單ID}
Headers: 
  Content-Type: application/json

Body (raw JSON):
{
  "name": "更新後的用戶",
  "note": "改成熱飲",
  "drink": "綠茶",
  "sweetness": "去糖",
  "ice": "正常冰"
}

預期回應:
{
  "id": "{原始ID}",
  "name": "更新後的用戶",
  "note": "改成熱飲",
  "drink": "綠茶",
  "sweetness": "去糖",
  "ice": "正常冰",
  "createdAt": "{原始時間}",
  "updatedAt": "2025-09-27T13:30:00.000Z"
}
```

### 4️⃣ DELETE - 刪除訂單 (需要先取得 ID)
```
Method: DELETE
URL: http://localhost:3000/api/orders/{訂單ID}
Headers: 
  Content-Type: application/json

預期回應:
{
  "message": "訂單已刪除",
  "order": {
    "id": "{被刪除的ID}",
    "name": "...",
    ...
  }
}
```

## 🧪 測試步驟建議

### Step 1: 測試 GET (查看初始資料)
1. 發送 GET 請求到 `/api/orders`
2. 記下現有訂單的 ID (如果有的話)

### Step 2: 測試 POST (新增訂單)
1. 發送 POST 請求新增訂單
2. 記下回應中的新 ID
3. 再次發送 GET 確認資料已新增

### Step 3: 測試 PUT (更新訂單)
1. 使用 Step 2 的 ID，發送 PUT 請求
2. 發送 GET 確認資料已更新

### Step 4: 測試 DELETE (刪除訂單)
1. 使用現有的 ID，發送 DELETE 請求
2. 發送 GET 確認資料已刪除

## 📝 更多測試案例

### 邊界測試 - 空資料 POST
```json
{
  "name": "",
  "note": "",
  "drink": "",
  "sweetness": "",
  "ice": ""
}
```

### 邊界測試 - 部分資料 PUT
```json
{
  "name": "只更新名字"
}
```

### 錯誤測試 - 不存在的 ID
```
PUT/DELETE: http://localhost:3000/api/orders/999999
預期: 404 錯誤
```

## 🎯 快速驗證指令 (使用 curl)

```bash
# GET - 取得所有訂單
curl http://localhost:3000/api/orders

# POST - 新增訂單
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"curl測試\",\"drink\":\"紅茶\",\"sweetness\":\"正常甜\",\"ice\":\"去冰\",\"note\":\"用指令測試\"}"

# PUT - 更新訂單 (替換 {ID} 為實際 ID)
curl -X PUT http://localhost:3000/api/orders/{ID} \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"更新測試\",\"drink\":\"綠茶\",\"sweetness\":\"去糖\",\"ice\":\"正常冰\"}"

# DELETE - 刪除訂單 (替換 {ID} 為實際 ID)
curl -X DELETE http://localhost:3000/api/orders/{ID}
```
