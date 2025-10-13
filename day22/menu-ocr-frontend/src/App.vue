<template>
  <main style="padding:24px; font-family:system-ui, -apple-system, Segoe UI, Roboto, Noto Sans TC, sans-serif;">
    <h1>Menu OCR</h1>

    <section style="margin:12px 0; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <input type="file" accept="image/*,application/pdf" @change="onPick" />
      <button :disabled="!file || loading" @click="run">上傳並 OCR</button>
      <button :disabled="loading" @click="loadSaved">載入後端 menu.json</button>
      <span v-if="file" style="opacity:.7">{{ file.name }}</span>
    </section>

    <section class="card">
      <h3>OCR 原文</h3>
      <textarea :value="rawText" readonly rows="12"></textarea>
    </section>

    <section class="card">
      <h3>menu.json</h3>
      <textarea v-model="menuJson" rows="16"></textarea>
      <div style="margin-top:8px; display:flex; gap:8px;">
        <button :disabled="!menuJson || loading" @click="saveMenu">確認清單正確，存到後端</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';

const file = ref(null);
const loading = ref(false);
const rawText = ref('');
const menuJson = ref('');

function onPick(e){ file.value = e.target.files[0] }

async function run(){
  if(!file.value) return;
  loading.value = true;
  try{
    const fd = new FormData();
    fd.append('file', file.value);
    const res = await fetch('/api/ocr', { method:'POST', body: fd });
    const data = await res.json();
    if(!res.ok || data.error) throw new Error(data.error || 'OCR failed');
    rawText.value = data.rawText || '';
    menuJson.value = JSON.stringify(data.menu, null, 2);
  }catch(e){
    alert('OCR 失敗：' + e.message);
  }finally{
    loading.value = false;
  }
}

async function saveMenu(){
  try{
    const payload = JSON.parse(menuJson.value || '{}');
    const res = await fetch('/api/menu/save', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(!res.ok || data.error) throw new Error(data.error || 'Save failed');
    alert('已儲存到後端 menu.json！');
  }catch(e){
    alert('儲存失敗：' + e.message);
  }
}

async function loadSaved(){
  try{
    const res = await fetch('/api/menu');
    const data = await res.json();
    menuJson.value = JSON.stringify(data, null, 2);
  }catch(e){
    alert('讀取失敗：' + e.message);
  }
}
</script>

<style>
.card { border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin:12px 0; }
textarea { width:100%; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
button { padding:8px 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
button:disabled { opacity:.6; cursor:not-allowed; }
</style>
