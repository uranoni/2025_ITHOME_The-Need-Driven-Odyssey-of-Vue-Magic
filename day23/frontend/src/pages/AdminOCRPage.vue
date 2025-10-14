<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '../stores/toastStore'
import { http } from '../services/http'

const toast = useToastStore()
const rawText = ref('')
const menuJson = ref('')
const name = ref('')
const file = ref(null)
const hasFile = computed(() => !!file.value)
const fileInput = ref(null)
function onFileChange(ev) {
  const target = ev?.target
  const f = target && target.files && target.files[0] ? target.files[0] : null
  file.value = f
}

async function parseText() {
  try {
    const { data } = await http.post('/api/ocr-text', { text: rawText.value })
    menuJson.value = JSON.stringify(data.menu, null, 2)
  } catch (e) {
    toast.error('解析失敗')
  }
}

async function parseImage() {
  try {
    if (!file.value) return
    // debug: 提示開始上傳
    toast.info('開始上傳並解析圖片...')
    const fd = new FormData()
    fd.append('file', file.value)
    const { data } = await http.post('/api/ocr-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    rawText.value = data.rawText || ''
    menuJson.value = JSON.stringify(data.menu, null, 2)
    toast.success('圖片解析完成')
  } catch (e) {
    console.error('parseImage error', e)
    toast.error('圖片解析失敗')
  }
}

async function saveMenu() {
  try {
    const menu = JSON.parse(menuJson.value)
    await http.post('/api/menus', { name: name.value, menu })
    toast.success('菜單已儲存')
  } catch (e) {
    toast.error('儲存失敗')
  }
}
</script>

<template>
  <section class="admin-ocr">
    <h2>OCR 上傳與命名（admin）</h2>
    <div class="grid2">
      <div>
        <h3>貼上 OCR 原文</h3>
        <textarea v-model="rawText" placeholder="貼上 OCR 純文字"></textarea>
        <button class="btn" @click="parseText" :disabled="!rawText">解析</button>
        <div class="uploader">
          <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" />
          <button type="button" class="btn" @click="parseImage" :disabled="!hasFile">上傳圖片並解析</button>
        </div>
      </div>
      <div>
        <h3>解析結果 menu.json</h3>
        <textarea v-model="menuJson" placeholder="解析結果"></textarea>
        <div class="row">
          <input v-model="name" placeholder="輸入菜單名稱，如 50lan"/>
          <button class="btn primary" @click="saveMenu" :disabled="!name || !menuJson">儲存為店家菜單</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-ocr { padding: 16px; max-width: 1100px; margin: 0 auto; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
textarea { width: 100%; min-height: 300px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.row { display: flex; gap: 8px; margin-top: 8px; }
.uploader { display:flex; gap:8px; margin-top:8px; align-items:center; }
.btn { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background:#fff; cursor: pointer; }
.btn.primary { background:#2563eb; color:#fff; border-color:#2563eb; }
input { padding: 8px 12px; border:1px solid #cbd5e1; border-radius:6px; flex:1; }
@media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }
</style>


