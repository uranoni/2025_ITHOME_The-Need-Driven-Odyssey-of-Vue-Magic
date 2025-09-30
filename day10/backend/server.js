import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "order.json");

// ✅ 啟用 CORS（允許所有來源）
app.use(cors());
app.use(express.json());

// 輔助函數：讀取訂單資料
async function readOrders() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (error) {
    console.error("讀取訂單資料失敗:", error);
    return [];
  }
}

// 輔助函數：寫入訂單資料
async function writeOrders(orders) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("寫入訂單資料失敗:", error);
    return false;
  }
}

// 🔍 GET /api/orders - 取得所有訂單
app.get("/api/orders", async (_req, res) => {
  try {
    const orders = await readOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "無法取得訂單資料" });
  }
});


// ➕ POST /api/orders - 新增一筆訂單
app.post("/api/orders", async (req, res) => {
  try {
    const orders = await readOrders();
    const newOrder = {
      id: Date.now().toString(),
      name: req.body.name || '',
      note: req.body.note || '',
      drink: req.body.drink || '',
      sweetness: req.body.sweetness || '',
      ice: req.body.ice || '',
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    
    const success = await writeOrders(orders);
    if (!success) {
      return res.status(500).json({ error: "無法儲存訂單" });
    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "新增訂單失敗" });
  }
});

// ✏️ PUT /api/orders/:id - 更新指定訂單
app.put("/api/orders/:id", async (req, res) => {
  try {
    const orders = await readOrders();
    const index = orders.findIndex(o => o.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "找不到指定的訂單" });
    }
    
    // 保留原始的 id 和 createdAt
    const updatedOrder = {
      ...orders[index],
      name: req.body.name || orders[index].name,
      note: req.body.note || orders[index].note,
      drink: req.body.drink || orders[index].drink,
      sweetness: req.body.sweetness || orders[index].sweetness,
      ice: req.body.ice || orders[index].ice,
      updatedAt: new Date().toISOString(),
    };
    
    orders[index] = updatedOrder;
    
    const success = await writeOrders(orders);
    if (!success) {
      return res.status(500).json({ error: "無法更新訂單" });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "更新訂單失敗" });
  }
});

// 🗑️ DELETE /api/orders/:id - 刪除指定訂單
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orders = await readOrders();
    const index = orders.findIndex(o => o.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "找不到指定的訂單" });
    }
    
    const deletedOrder = orders[index];
    orders.splice(index, 1);
    
    const success = await writeOrders(orders);
    if (!success) {
      return res.status(500).json({ error: "無法刪除訂單" });
    }
    
    res.json({ message: "訂單已刪除", order: deletedOrder });
  } catch (error) {
    res.status(500).json({ error: "刪除訂單失敗" });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "伺服器內部錯誤" });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: "找不到指定的路由" });
});

app.listen(PORT, () => {
  console.log(`🚀 飲料點單 API 伺服器啟動成功！`);
  console.log(`📍 伺服器位址: http://localhost:${PORT}`);
  console.log(`📋 API 端點:`);
  console.log(`   GET    /api/orders     - 取得所有訂單`);
  console.log(`   POST   /api/orders     - 新增訂單`);
  console.log(`   PUT    /api/orders/:id - 更新訂單`);
  console.log(`   DELETE /api/orders/:id - 刪除訂單`);
});
