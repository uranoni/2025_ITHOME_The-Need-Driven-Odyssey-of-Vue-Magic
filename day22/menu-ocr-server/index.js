import express from 'express';
import multer from 'multer';
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'node:fs';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new vision.ImageAnnotatorClient();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

// 1) OCR：接收圖片/PDF buffer -> Vision -> 自動解析 -> 回傳 { rawText, menu }
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const [result] = await client.documentTextDetection({ image: { content: req.file.buffer } });
    const text = result.fullTextAnnotation?.text || '';

    const menu = parseMenuText(text);
    return res.json({ rawText: text, menu });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// 2) 儲存 menu.json（前端按「確認清單正確」後呼叫）
app.post('/api/menu/save', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !Array.isArray(payload?.categories)) {
      return res.status(400).json({ error: 'Invalid menu payload' });
    }
    fs.writeFileSync('./menu.json', JSON.stringify(payload, null, 2), 'utf8');
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// 3) 讀取目前的 menu.json（方便你在前端預載）
app.get('/api/menu', (req, res) => {
  try {
    if (!fs.existsSync('./menu.json')) {
      return res.json({
        metadata: { currency: 'TWD', locale: 'zh-TW', version: new Date().toISOString().slice(0, 10) },
        categories: []
      });
    }
    const data = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

/* -------------------------- 解析器：自動擷取 -------------------------- */
function parseMenuText(text) {
  // 前處理：去符號、全形空白、把分類打上標記
  let clean = text
    .replace(/[●•·]/g, '')
    .replace(/\u3000/g, ' ')
    .replace(/\s{2,}/g, ' ');

  // 有些行會長成「葡萄柚多多(….)50 70」=> 在價格前補空白
  clean = clean.replace(/(\D)(\d{2,}\s+\d{2,})/g, '$1 $2');

  const lines = clean
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    // 過濾只有 M / L 的孤行
    .filter(s => !/^(M|L)$/.test(s));

  const menu = {
    metadata: { currency: 'TWD', locale: 'zh-TW', version: new Date().toISOString().slice(0, 10) },
    categories: []
  };

  let current = null;

  // 規則：
  // 1) 兩價格（多半是 M/L）:  品名  35 50
  // 2) 單價格：               品名  45
  // 名稱允許中英數、斜線、全形日文の、括號註記
  const twoPrice = /^([A-Za-z0-9\u4e00-\u9fa5の／\/\(\)\.\-\s]+?)\s+(\d{2,})\s+(\d{2,})$/;
  // 單價：名稱必須包含至少一個中文字或英文字，避免把「25 30」的 25 誤認為名稱
  const onePrice = /^((?=.*[A-Za-z\u4e00-\u9fa5])[A-Za-z0-9\u4e00-\u9fa5の／\/\(\)\.\-\s]+?)\s+(?:NT\$|\$)?(\d{2,})(?:元)?$/;

  // 補償：有些 OCR 會把「品名」與「價格」切成不同的行
  // 例：
  //  烏龍綠
  //  35 50
  // 或
  //  鮮柚綠
  //  45
  const nameOnly = /^[A-Za-z0-9\u4e00-\u9fa5の／\/\(\)\.\-\s]+$/; // 無價格
  const onlyTwoNumbers = /^(\d{2,})\s+(\d{2,})$/; // 僅兩個價格
  const onlyOneNumber = /^(?:NT\$|\$)?(\d{2,})(?:元)?$/; // 僅一個價格

  let pendingName = null; // 暫存上一個沒有價格的品名

  // 分類偵測（不依賴前置替換）
  const normalizeCategory = (line) => {
    const s = line.replace(/^\(?\s*/, ''); // 去除可能的前導括號與空白
    if (/^找\s*好\s*茶\s*$/.test(s)) return '找好茶';
    if (/^找\s*奶\s*茶/.test(s)) return '找奶茶(奶精)';
    if (/^找\s*拿\s*鐵/.test(s)) return '找拿鐵(鮮奶)';
    if (/^找\s*新\s*鮮/.test(s)) return '找新鮮(無咖啡因)';
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+/g, ' ').trim();
    // 分類行
    const cat = normalizeCategory(line);
    if (cat) {
      // 去除重複括號
      const catName = cat.replace(/\(無咖啡因\)\(無咖啡因\)/g, '(無咖啡因)');
      current = { name: catName, items: [] };
      menu.categories.push(current);
      pendingName = null;
      continue;
    }
    if (!current) continue;

    // 兩價格
    let m = line.match(twoPrice);
    if (m) {
      const name = sanitizeName(m[1]);
      const p1 = Number(m[2]), p2 = Number(m[3]);
      current.items.push({
        id: slug(name),
        name,
        sizes: [{ name: 'M', price: p1 }, { name: 'L', price: p2 }]
      });
      pendingName = null;
      continue;
    }

    // 單價格（且避免只有 'M' 'L' 或純數字被誤抓）
    m = line.match(onePrice);
    if (m && !/\b(M|L)\b/.test(line)) {
      const name = sanitizeName(m[1]);
      if (/^\d+$/.test(name)) { // 名稱不能是純數字
        continue;
      }
      const p = Number(m[2]);
      current.items.push({
        id: slug(name),
        name,
        sizes: [{ name: 'default', price: p }]
      });
      pendingName = null;
      continue;
    }

    // 雙行比對：本行是品名，下一行是價格
    if (!/^M$/i.test(line) && !/^L$/i.test(line) && nameOnly.test(line) && !/^\d{2,}$/.test(line)) {
      const next = (lines[i + 1] || '').replace(/\s+/g, ' ').trim();
      if (onlyTwoNumbers.test(next)) {
        const mm = next.match(onlyTwoNumbers);
        const p1 = Number(mm[1]), p2 = Number(mm[2]);
        const name = sanitizeName(line);
        current.items.push({ id: slug(name), name, sizes: [ { name: 'M', price: p1 }, { name: 'L', price: p2 } ] });
        i += 1; // 消費下一行
        continue;
      }
      if (onlyOneNumber.test(next)) {
        const mm = next.match(onlyOneNumber);
        const p = Number(mm[1]);
        const name = sanitizeName(line);
        current.items.push({ id: slug(name), name, sizes: [ { name: 'default', price: p } ] });
        i += 1; // 消費下一行
        continue;
      }
    }

    // 若到這裡還是純數字行就忽略
    if (onlyTwoNumbers.test(line) || onlyOneNumber.test(line)) continue;
  }

  // 若完全沒有分類被抓到，至少給一個「未分類」
  if (menu.categories.length === 0) {
    menu.categories.push({ name: '未分類', items: [] });
  }

  return menu;
}

function sanitizeName(name) {
  return name
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*（/g, ' (') // 全形括號轉半形前加空白
    .replace(/）/g, ')')
    .trim();
}

function slug(s) {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\u4e00-\u9fa5\-]/g, '');
}
