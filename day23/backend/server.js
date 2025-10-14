import 'dotenv/config'
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from 'multer'
import vision from '@google-cloud/vision'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "order.json");
const MENU_FILE = path.join(__dirname, "ordermenu.json");
const MENUS_DIR = path.join(__dirname, "menus");
const MENUS_INDEX = path.join(MENUS_DIR, "index.json");
const USER_FILE = path.join(__dirname, "user.json");
const I18N_FILE = path.join(__dirname, "i18n.json");
const GCP_CRED = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'menu-ocr-server', 'gcp-service-account.json')

// ✅ 啟用 CORS（允許所有來源）
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() })
const ocrClient = new vision.ImageAnnotatorClient({ keyFilename: GCP_CRED })

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

// 文字解析（從 day22 規則簡化版）：支援分類/品名/價格（同行或雙行）
function parseMenuText(text) {
  let clean = (text || '')
    .replace(/[●•·]/g, '')
    .replace(/\u3000/g, ' ')
    .replace(/\s{2,}/g, ' ')
  const lines = clean.split(/\r?\n/).map(s => s.trim()).filter(Boolean)

  const categories = []
  let current = null
  const catRe = [/^找\s*好\s*茶\s*$/, /^找\s*奶\s*茶/, /^找\s*拿\s*鐵/, /^找\s*新\s*鮮/]
  function normCat(s){
    if (/^找\s*好\s*茶/.test(s)) return '找好茶'
    if (/^找\s*奶\s*茶/.test(s)) return '找奶茶(奶精)'
    if (/^找\s*拿\s*鐵/.test(s)) return '找拿鐵(鮮奶)'
    if (/^找\s*新\s*鮮/.test(s)) return '找新鮮(無咖啡因)'
    return null
  }
  const nameOnly = /^[A-Za-z0-9\u4e00-\u9fa5の／\/\(\)\.\-\s]+$/
  const two = /^(\d{2,})\s+(\d{2,})$/
  const one = /^(?:NT\$|\$)?(\d{2,})(?:元)?$/
  const sameLineTwo = /^(.+?)\s+(\d{2,})\s+(\d{2,})$/
  const sameLineOne = /^(.+?)\s+(\d{2,})$/

  for (let i=0;i<lines.length;i++){
    const line = lines[i]
    const cat = normCat(line)
    if (cat){ current = { name: cat, items: [] }; categories.push(current); continue }
    if (!current) continue

    let m = line.match(sameLineTwo)
    if (m){ current.items.push({ id: m[1], name: m[1], sizes:[{name:'M',price:+m[2]},{name:'L',price:+m[3]}]}); continue }
    m = line.match(sameLineOne)
    if (m){ current.items.push({ id: m[1], name: m[1], sizes:[{name:'default',price:+m[2]}]}); continue }

    if (nameOnly.test(line) && !/^M$|^L$/i.test(line)){
      const next = lines[i+1] || ''
      let mm = next.match(two)
      if (mm){ current.items.push({ id: line, name: line, sizes:[{name:'M',price:+mm[1]},{name:'L',price:+mm[2]}]}); i++; continue }
      mm = next.match(one)
      if (mm){ current.items.push({ id: line, name: line, sizes:[{name:'default',price:+mm[1]}]}); i++; continue }
    }
  }
  return { metadata:{ currency:'TWD', locale:'zh-TW', version:new Date().toISOString().slice(0,10) }, categories }
}

// 提供前端以純文字解析（admin）
app.post('/api/ocr-text', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: '未提供授權' })
    const users = await readUsers()
    const username = decodeToken(token)
    const me = users.find(u => u.username === username && u.token === token)
    if (!me) return res.status(401).json({ error: '授權無效' })
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' })

    const text = req.body?.text || ''
    const menu = parseMenuText(text)
    res.json({ menu })
  } catch (e) {
    res.status(500).json({ error: '解析失敗' })
  }
})

// 直接上傳圖片解析（admin）
app.post('/api/ocr-image', upload.single('file'), async (req, res) => {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: '未提供授權' })
    const users = await readUsers()
    const username = decodeToken(token)
    const me = users.find(u => u.username === username && u.token === token)
    if (!me) return res.status(401).json({ error: '授權無效' })
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' })
    if (!req.file) return res.status(400).json({ error: '未提供檔案' })

    const [result] = await ocrClient.documentTextDetection({ image: { content: req.file.buffer } })
    const text = result.fullTextAnnotation?.text || ''
    const menu = parseMenuText(text)
    res.json({ rawText: text, menu })
  } catch (e) {
    res.status(500).json({ error: '圖片解析失敗' })
  }
})

// 多菜單儲存
async function ensureMenusDir() {
  try { await fs.mkdir(MENUS_DIR, { recursive: true }); } catch {}
  try { await fs.access(MENUS_INDEX); } catch { await fs.writeFile(MENUS_INDEX, JSON.stringify({ names: [] }, null, 2), 'utf8'); }
}
async function listMenus() {
  await ensureMenusDir();
  try { const txt = await fs.readFile(MENUS_INDEX, 'utf8'); return JSON.parse(txt)?.names || []; } catch { return []; }
}
async function saveMenuByName(name, menuObj) {
  await ensureMenusDir();
  const safe = name.replace(/[^\w\u4e00-\u9fa5\-]/g, '');
  const file = path.join(MENUS_DIR, `${safe}.json`);
  await fs.writeFile(file, JSON.stringify(menuObj, null, 2), 'utf8');
  const names = new Set(await listMenus());
  names.add(safe);
  await fs.writeFile(MENUS_INDEX, JSON.stringify({ names: Array.from(names) }, null, 2), 'utf8');
  return { name: safe };
}
async function readMenuByName(name) {
  await ensureMenusDir();
  const safe = name.replace(/[^\w\u4e00-\u9fa5\-]/g, '');
  const file = path.join(MENUS_DIR, `${safe}.json`);
  try { const txt = await fs.readFile(file, 'utf8'); return JSON.parse(txt); } catch { return null; }
}

// 讀取/寫入使用者
async function readUsers() {
  try {
    const txt = await fs.readFile(USER_FILE, "utf8");
    if (!txt) return [];
    return JSON.parse(txt);
  } catch (error) {
    return [];
  }
}
async function writeUsers(users) {
  try {
    await fs.writeFile(USER_FILE, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (e) {
    return false;
  }
}

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

function encodeToken(username) {
  return Buffer.from(username, 'utf8').toString('base64');
}
function decodeToken(token) {
  try { return Buffer.from(token, 'base64').toString('utf8'); } catch { return ''; }
}

// POST /api/login - 建立或登入帳號
app.post('/api/login', async (req, res) => {
  try {
    const username = (req.body?.username || '').trim();
    const password = (req.body?.password || '').trim();
    const age = parseInt(req.body?.age);
    const job = (req.body?.job || '').trim();
    
    if (!username) return res.status(400).json({ error: 'username 必填' });
    if (password !== '123456') return res.status(401).json({ error: '密碼錯誤' });
    if (!age || isNaN(age) || age < 12 || age > 100) {
      return res.status(400).json({ error: '請輸入有效的年齡（12-100歲）' });
    }

    let users = await readUsers();
    let user = users.find(u => u.username === username);
    const role = username === 'roni' ? 'admin' : 'user';

    if (!user) {
      // 建立新使用者（密碼一律 123456）
      user = { 
        username, 
        password: '123456', 
        role, 
        token: encodeToken(username), 
        preferredLocale: 'zh-TW',
        age: age,
        job: job || '其他',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await writeUsers(users);
    } else {
      // 既有使用者：確認密碼（此示範固定 123456）
      if (user.password !== '123456') {
        return res.status(401).json({ error: '密碼錯誤' });
      }
      user.token = encodeToken(username);
      user.role = role;
      // 更新年齡和職業（如果提供）
      if (age) user.age = age;
      if (job) user.job = job;
      await writeUsers(users);
    }

    return res.json({ 
      username: user.username, 
      role: user.role, 
      token: user.token, 
      preferredLocale: user.preferredLocale || 'zh-TW',
      age: user.age,
      job: user.job
    });
  } catch (e) {
    res.status(500).json({ error: '登入失敗' });
  }
});

// 取得所有使用者（僅 admin）
app.get('/api/users', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: '未提供授權' })
    
    const users = await readUsers()
    const username = decodeToken(token)
    const me = users.find(u => u.username === username && u.token === token)
    if (!me) return res.status(401).json({ error: '授權無效' })
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' })
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: '取得使用者資料失敗' })
  }
})

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

// I18n 設定：讀取
app.get('/api/i18n-config', async (_req, res) => {
  const cfg = await readI18nConfig()
  res.json(cfg)
})

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

// 多菜單 API
app.get('/api/menus', async (_req, res) => {
  const names = await listMenus();
  res.json({ names });
});
app.get('/api/menus/:name', async (req, res) => {
  const menu = await readMenuByName(req.params.name);
  if (!menu) return res.status(404).json({ error: '找不到菜單' });
  res.json(menu);
});
// 僅 admin 可儲存菜單
app.post('/api/menus', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: '未提供授權' })
    const users = await readUsers()
    const username = decodeToken(token)
    const me = users.find(u => u.username === username && u.token === token)
    if (!me) return res.status(401).json({ error: '授權無效' })
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' })

    const name = (req.body?.name || '').trim()
    const menu = req.body?.menu
    if (!name || !menu) return res.status(400).json({ error: 'name 與 menu 必填' })
    const saved = await saveMenuByName(name, menu)
    res.json(saved)
  } catch (e) {
    res.status(500).json({ error: '儲存菜單失敗' })
  }
});

// 🔎 GET /api/orders/:id - 取得指定訂單
app.get("/api/orders/:id", async (req, res) => {
  try {
    // 簡易驗證：Authorization: Bearer <token>
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: '未提供授權' });

    const users = await readUsers();
    const username = decodeToken(token);
    const me = users.find(u => u.username === username && u.token === token);
    if (!me) return res.status(401).json({ error: '授權無效' });

    const orders = await readOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "找不到指定的訂單" });
    }
    // 權限：只有自己或 admin 可看
    if (me.role !== 'admin' && order.name !== me.username) {
      return res.status(403).json({ error: '沒有權限檢視此訂單' });
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
      shop: req.body.shop || '',
      category: req.body.category || '',
      item: req.body.item || '',
      size: req.body.size || '',
      price: typeof req.body.price === 'number' ? req.body.price : undefined,
      drink: req.body.drink || req.body.item || '',
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
      shop: req.body.shop ?? orders[index].shop,
      category: req.body.category ?? orders[index].category,
      item: req.body.item ?? orders[index].item,
      size: req.body.size ?? orders[index].size,
      price: typeof req.body.price === 'number' ? req.body.price : orders[index].price,
      drink: req.body.drink || req.body.item || orders[index].drink,
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

// 📊 GET /api/analytics/summary - 取得分析資料摘要（僅 admin）
app.get('/api/analytics/summary', async (req, res) => {
  try {
    // 驗證 admin 權限
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: '未提供授權' });
    
    const users = await readUsers();
    const username = decodeToken(token);
    const me = users.find(u => u.username === username && u.token === token);
    if (!me) return res.status(401).json({ error: '授權無效' });
    if (me.role !== 'admin') return res.status(403).json({ error: '需要 admin 權限' });

    const [orders, usersData] = await Promise.all([
      readOrders(),
      readUsers()
    ]);

    // 飲品佔比分析
    const drinkCounts = {};
    orders.forEach(order => {
      const drink = order.drink;
      drinkCounts[drink] = (drinkCounts[drink] || 0) + 1;
    });

    // 年齡分布分析
    const ageBuckets = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0
    };
    
    usersData.forEach(user => {
      if (user.age) {
        if (user.age >= 18 && user.age <= 24) {
          ageBuckets['18-24']++;
        } else if (user.age >= 25 && user.age <= 34) {
          ageBuckets['25-34']++;
        } else if (user.age >= 35 && user.age <= 44) {
          ageBuckets['35-44']++;
        } else if (user.age >= 45) {
          ageBuckets['45+']++;
        }
      }
    });

    // 時間序列分析
    const dailyCounts = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    const sortedDates = Object.keys(dailyCounts).sort();

    // 年齡 vs 消費量散點圖
    const userCupCounts = {};
    orders.forEach(order => {
      const username = order.name;
      userCupCounts[username] = (userCupCounts[username] || 0) + 1;
    });

    const scatterPoints = [];
    usersData.forEach(user => {
      if (user.age && userCupCounts[user.username]) {
        scatterPoints.push({
          x: user.age,
          y: userCupCounts[user.username]
        });
      }
    });

    res.json({
      drinkShare: {
        labels: Object.keys(drinkCounts),
        data: Object.values(drinkCounts)
      },
      ageDistribution: {
        labels: Object.keys(ageBuckets),
        data: Object.values(ageBuckets)
      },
      timeSeries: {
        labels: sortedDates,
        data: sortedDates.map(date => dailyCounts[date])
      },
      scatter: scatterPoints
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: '取得分析資料失敗' });
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
  console.log(`   GET    /api/menus      - 列出已儲存店家菜單`);
  console.log(`   GET    /api/menus/:name - 取得指定店家菜單`);
  console.log(`   POST   /api/menus      - 儲存菜單（admin）`);
  console.log(`   GET    /api/i18n-config - 取得 i18n 字典`);
  console.log(`   PUT    /api/i18n-config - 更新 i18n 字典（admin）`);
  console.log(`   GET    /api/users      - 取得所有使用者（admin）`);
  console.log(`   GET    /api/users/me    - 取得目前使用者`);
  console.log(`   PUT    /api/users/me/locale - 更新偏好語系`);
  console.log(`   GET    /api/analytics/summary - 取得分析資料摘要（admin）`);
});
