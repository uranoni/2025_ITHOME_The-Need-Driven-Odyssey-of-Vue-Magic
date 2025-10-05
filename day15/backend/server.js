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
const MENU_FILE = path.join(__dirname, "ordermenu.json");

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

// 讀取菜單
async function readMenu() {
  try {
    const txt = await fs.readFile(MENU_FILE, "utf8");
    return JSON.parse(txt);
  } catch (error) {
    console.error("讀取菜單失敗:", error);
    return { drinks: [], sweetnessOptions: [], iceOptions: [] };
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

// 🧾 GET /api/ordermenu - 取得祕書提供的菜單（只讀）
app.get("/api/ordermenu", async (_req, res) => {
  try {
    const menu = await readMenu();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "無法取得菜單資料" });
  }
});

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

// 🔁 PUT /api/orders/bulk - 批次覆蓋整份訂單清單（需放在 :id 路由之前）
app.put("/api/orders/bulk", async (req, res) => {
  try {
    const incoming = req.body
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: "payload 應為陣列" })
    }

    // 讀取菜單規則以進行業務驗證
    const menu = await readMenu();
    const rules = menu?.rules || {};

    // 基本驗證 + 業務規則驗證 + 正規化
    const normalized = incoming.map((o) => {
      if (!o || typeof o !== 'object') {
        throw new Error('每筆應為物件')
      }
      const requiredOk = ['name','drink','sweetness','ice'].every((k) => typeof o[k] === 'string')
      if (!requiredOk) {
        throw new Error('缺少必要欄位或型別不正確')
      }

      // 規則驗證：若該飲料有規則則必須符合
      const rule = rules[o.drink];
      if (rule) {
        const allowSweet = Array.isArray(rule.allowedSweetness) ? rule.allowedSweetness : [];
        const allowIce = Array.isArray(rule.allowedIce) ? rule.allowedIce : [];
        if (allowSweet.length && !allowSweet.includes(o.sweetness)) {
          throw new Error(`飲料「${o.drink}」不允許甜度「${o.sweetness}」`);
        }
        if (allowIce.length && !allowIce.includes(o.ice)) {
          throw new Error(`飲料「${o.drink}」不允許冰量「${o.ice}」`);
        }
      }
      return {
        id: typeof o.id === 'string' ? o.id : Date.now().toString() + Math.random().toString(16).slice(2),
        name: o.name,
        note: typeof o.note === 'string' ? o.note : '',
        drink: o.drink,
        sweetness: o.sweetness,
        ice: o.ice,
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    const ok = await writeOrders(normalized)
    if (!ok) {
      return res.status(500).json({ error: '無法覆蓋訂單' })
    }

    res.json(normalized)
  } catch (error) {
    res.status(400).json({ error: error.message || "批次覆蓋失敗" })
  }
})

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
  console.log(`   GET    /api/ordermenu  - 取得飲料菜單`);
});
