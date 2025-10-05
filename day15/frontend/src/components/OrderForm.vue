<script setup>
import { computed } from 'vue'
import OptionGroup from './OptionGroup.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useOrderStore } from '../stores/orderStore'

const emit = defineEmits(['submit'])
const props = defineProps({
  disabled: { type: Boolean, default: false },
  drinks: { type: Array, default: () => [] },
  sweetnessOptions: { type: Array, default: () => [] },
  iceOptions: { type: Array, default: () => [] },
  menuRules: { type: Object, default: () => ({}) },
})

const orderStore = useOrderStore()

const blacklist = ['script', 'drop table', '<', '>', 'select *', 'insert ', 'update ', 'delete ']

function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function countTodayByName(name) {
  if (!name) return 0
  return (orderStore.orders || []).filter(o => o.name === name && isToday(o.createdAt)).length
}

function withinBusinessHours() {
  const now = new Date()
  const h = now.getHours()
  // 營業時間 08:00 - 19:00（含 8，不含 20）
  return h >= 8 && h < 22
}

const schema = computed(() => {
  // 動態選項限制（示範 when/oneOf/notOneOf）
  const sweetnessBase = yup.string().required('請選擇甜度')
    .when('drink', (drink, s) => {
      if (drink === '抹茶拿鐵') {
        // 禁止去糖
        return s.notOneOf(['去糖'], '抹茶拿鐵不可去糖')
      }
      return s
    })

  const iceBase = yup.string().required('請選擇冰量')
    .when('drink', (drink, s) => {
      if (drink === '巧克力') {
        return s.oneOf(['熱飲'], '巧克力僅能熱飲')
      }
      return s
    })

  return yup.object({
    name: yup.string()
      .transform(v => (typeof v === 'string' ? v.trim() : v))
      .required('姓名必填')
      .min(2, '至少 2 個字')
      .max(20, '最多 20 個字'),
    note: yup.string()
      .transform(v => (typeof v === 'string' ? v.trim() : v))
      .max(50, '備註最多 50 個字')
      .test('blacklist', '備註含禁用詞', (val) => {
        if (!val) return true
        const lower = val.toLowerCase()
        return !blacklist.some(b => lower.includes(b))
      })
      .optional(),
    drink: yup.string().required('請選擇飲料'),
    sweetness: sweetnessBase,
    ice: iceBase,
  })
  // 物件層級跨欄位驗證：檢查選項符合 menuRules、每日上限與營業時間
  .test('menu-rule-check', '選項與菜單規則不符', (values) => {
    const rule = props.menuRules?.[values.drink]
    if (!rule) return true
    const okSweet = !rule.allowedSweetness?.length || rule.allowedSweetness.includes(values.sweetness)
    const okIce = !rule.allowedIce?.length || rule.allowedIce.includes(values.ice)
    return okSweet && okIce
  })
  .test('daily-limit', '同一位使用者今日最多 3 杯', (values) => {
    const cnt = countTodayByName(values.name)
    return cnt < 3
  })
  .test('business-hours', '非營業時間（08:00–22:00）不可送單', () => withinBusinessHours())
})

const { handleSubmit, errors, isSubmitting } = useForm({ validationSchema: schema })
const { value: name } = useField('name')
const { value: note } = useField('note')
const { value: drink } = useField('drink')
const { value: sweetness } = useField('sweetness')
const { value: ice } = useField('ice')

const optSweetness = computed(() => {
  const rule = props.menuRules?.[drink.value]
  return rule?.allowedSweetness?.length ? rule.allowedSweetness : props.sweetnessOptions
})
const optIce = computed(() => {
  const rule = props.menuRules?.[drink.value]
  return rule?.allowedIce?.length ? rule.allowedIce : props.iceOptions
})

const onSubmit = handleSubmit((v) => {
  if (props.disabled) return
  emit('submit', v)
  name.value = ''
  note.value = ''
  drink.value = ''
  sweetness.value = ''
  ice.value = ''
})
</script>

<template>
  <!-- Day 3：姓名/備註 -->
  <div :class="['block', name ? 'complete' : 'invalid']">
    <label>姓名（必填）
      <input type="text" v-model.trim="name" placeholder="請輸入你的名字" />
    </label>
    <p class="hint" v-if="errors.name">{{ errors.name }}</p>
  </div>

  <div class="block">
    <label>備註（選填）
      <textarea v-model.trim="note" placeholder="例如：三點拿、少冰"></textarea>
    </label>
    <p class="hint" v-if="errors.note">{{ errors.note }}</p>
  </div>

  <!-- Day10: 飲料可選項加入巧克力 -->
<OptionGroup
  label="步驟 1：選擇飲料"
  :options="props.drinks"
  v-model="drink"
  required
/>
<p class="hint" v-if="errors.drink">{{ errors.drink }}</p>

<!-- 甜度：依飲料動態變化 -->
<OptionGroup
  v-if="drink"
  label="步驟 2：選擇甜度"
  :options="optSweetness"
  v-model="sweetness"
  required
/>
<p class="hint" v-if="errors.sweetness">{{ errors.sweetness }}</p>

<!-- 冰量：依飲料動態變化 -->
<OptionGroup
  v-if="drink && sweetness"
  label="步驟 3：選擇冰量"
  :options="optIce"
  v-model="ice"
  required
/>
<p class="hint" v-if="errors.ice">{{ errors.ice }}</p>

  <!-- 送出 -->
  <button
    :disabled="props.disabled || isSubmitting"
    @click="onSubmit"
    :class="['submit', 'enabled']"
  >
    送出
  </button>
  <p class="hint" v-if="errors['']">{{ errors[''] }}</p>
</template>
