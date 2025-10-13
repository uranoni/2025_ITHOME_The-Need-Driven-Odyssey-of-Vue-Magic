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
    .replace(/\s{2,}/g, ' ')
    .replace(/找\s*好\s*茶/g, '###找好茶')
    .replace(/找\s*奶\s*茶.*?/g, '###找奶茶(奶精)') // 「(奶精)」常被 OCR 斷開
    .replace(/找\s*拿\s*鐵.*?/g, '###找拿鐵(鮮奶)')
    .replace(/找\s*新\s*鮮.*?/g, '###找新鮮(無咖啡因)');

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
  const onePrice = /^([A-Za-z0-9\u4e00-\u9fa5の／\/\(\)\.\-\s]+?)\s+(?:NT\$|\$)?(\d{2,})(?:元)?$/;

  for (const raw of lines) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (line.startsWith('###')) {
      current = { name: line.replace(/^###/, ''), items: [] };
      menu.categories.push(current);
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
      continue;
    }

    // 單價格（且避免只有 'M' 'L' 誤抓）
    m = line.match(onePrice);
    if (m && !/\b(M|L)\b/.test(line)) {
      const name = sanitizeName(m[1]);
      const p = Number(m[2]);
      current.items.push({
        id: slug(name),
        name,
        sizes: [{ name: 'default', price: p }]
      });
    }
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
