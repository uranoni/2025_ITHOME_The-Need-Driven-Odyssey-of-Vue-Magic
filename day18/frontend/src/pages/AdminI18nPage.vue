<script setup>
import { onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useI18nStore } from '../stores/i18nStore'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const i18nStore = useI18nStore()
const { t, locale } = useI18n()

const form = reactive({ languages: [], drinks: {}, sweetness: {}, ice: {} })

onMounted(async () => {
  await i18nStore.loadServerConfig()
  form.languages = [...i18nStore.languages]
  form.drinks = JSON.parse(JSON.stringify(i18nStore.dict.drinks))
  form.sweetness = JSON.parse(JSON.stringify(i18nStore.dict.sweetness))
  form.ice = JSON.parse(JSON.stringify(i18nStore.dict.ice))
})

function addKey(cat) {
  const key = prompt('新增鍵（例如 綠茶）')
  if (!key) return
  if (!form[cat][key]) form[cat][key] = {}
  for (const lang of form.languages) {
    if (!form[cat][key][lang]) form[cat][key][lang] = ''
  }
}
async function save() {
  await i18nStore.saveServerConfig({ languages: form.languages, drinks: form.drinks, sweetness: form.sweetness, ice: form.ice }, auth.token)
}

function setLocale(lang) {
  locale.value = lang
}
</script>

<template>
  <section class="page">
    <h2>{{ t('pages.stats') }} Admin i18n</h2>
    <div v-if="i18nStore.error" class="error-message">{{ i18nStore.error }}</div>
    <div class="block">
      <label>UI 語系：
        <select class="btn" @change="setLocale($event.target.value)">
          <option value="zh-TW">中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </label>
    </div>
    <div class="block">
      <h3>飲料字典</h3>
      <button class="btn btn-sm" @click="addKey('drinks')">新增鍵</button>
      <div v-for="(row, key) in form.drinks" :key="key" class="block">
        <div><b>{{ key }}</b></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px">
          <label v-for="lang in form.languages" :key="lang">{{ lang }}：<input v-model="form.drinks[key][lang]" /></label>
        </div>
      </div>
    </div>
    <div class="block">
      <h3>甜度字典</h3>
      <button class="btn btn-sm" @click="addKey('sweetness')">新增鍵</button>
      <div v-for="(row, key) in form.sweetness" :key="key" class="block">
        <div><b>{{ key }}</b></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px">
          <label v-for="lang in form.languages" :key="lang">{{ lang }}：<input v-model="form.sweetness[key][lang]" /></label>
        </div>
      </div>
    </div>
    <div class="block">
      <h3>冰量字典</h3>
      <button class="btn btn-sm" @click="addKey('ice')">新增鍵</button>
      <div v-for="(row, key) in form.ice" :key="key" class="block">
        <div><b>{{ key }}</b></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px">
          <label v-for="lang in form.languages" :key="lang">{{ lang }}：<input v-model="form.ice[key][lang]" /></label>
        </div>
      </div>
    </div>
    <div class="actions" style="margin-top:8px">
      <button class="btn primary" @click="save">{{ t('actions.save') }}</button>
    </div>
  </section>
</template>


