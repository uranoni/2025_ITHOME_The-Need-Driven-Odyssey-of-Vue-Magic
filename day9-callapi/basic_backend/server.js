import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // 👈 新增

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "order.json");

// ✅ 啟用 CORS（允許所有來源）
app.use(cors());
app.use(express.json());

// 取得所有訂單
app.get("/api/orders", async (_req, res) => {
  const txt = await fs.readFile(DATA_FILE, "utf8");
  res.json(JSON.parse(txt));
});

// 新增一筆訂單
app.post("/api/orders", async (req, res) => {
  const orders = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  const order = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
