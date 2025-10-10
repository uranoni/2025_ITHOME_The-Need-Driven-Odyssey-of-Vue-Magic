<script setup>
import { computed } from 'vue'
import OptionGroup from './OptionGroup.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useOrderStore } from '../stores/orderStore'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '../stores/toastStore'

const emit = defineEmits(['submit'])
const props = defineProps({
  disabled: { type: Boolean, default: false },
  drinks: { type: Array, default: () => [] },
  sweetnessOptions: { type: Array, default: () => [] },
  iceOptions: { type: Array, default: () => [] },
  menuRules: { type: Object, default: () => ({}) },
})

const orderStore = useOrderStore()
const { t } = useI18n()
const toast = useToastStore()

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
  const sweetnessBase = yup.string().required(t('validations.pickSweetness'))
    .when('drink', (drink, s) => {
      if (drink === '抹茶拿鐵') {
        // 禁止去糖
        return s.notOneOf(['去糖'], t('validations.noSugarForMatcha'))
      }
      return s
    })

  const iceBase = yup.string().required(t('validations.pickIce'))
    .when('drink', (drink, s) => {
      if (drink === '巧克力') {
        return s.oneOf(['熱飲'], t('validations.chocolateHotOnly'))
      }
      return s
    })

  return yup.object({
    name: yup.string()
      .transform(v => (typeof v === 'string' ? v.trim() : v))
      .required(t('validations.nameRequired'))
      .min(2, t('validations.nameMin'))
      .max(20, t('validations.nameMax')),
    note: yup.string()
      .transform(v => (typeof v === 'string' ? v.trim() : v))
      .max(50, t('validations.noteMax'))
      .test('blacklist', t('validations.noteBlacklist'), (val) => {
        if (!val) return true
        const lower = val.toLowerCase()
        return !blacklist.some(b => lower.includes(b))
      })
      .optional(),
    drink: yup.string().required(t('validations.pickDrink')),
    sweetness: sweetnessBase,
    ice: iceBase,
  })
  // 物件層級跨欄位驗證：檢查選項符合 menuRules、每日上限與營業時間
  .test('menu-rule-check', t('validations.menuRuleMismatch'), (values) => {
    const rule = props.menuRules?.[values.drink]
    if (!rule) return true
    const okSweet = !rule.allowedSweetness?.length || rule.allowedSweetness.includes(values.sweetness)
    const okIce = !rule.allowedIce?.length || rule.allowedIce.includes(values.ice)
    return okSweet && okIce
  })
  .test('daily-limit', t('validations.dailyLimit'), (values) => {
    const cnt = countTodayByName(values.name)
    return cnt < 3
  })
  .test('business-hours', t('validations.businessHours'), () => withinBusinessHours())
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
  toast.success('訂單送出成功！')
})
</script>

<template>
  <!-- Day 3：姓名/備註 -->
  <div :class="['block', name ? 'complete' : 'invalid']">
    <label>{{ t('fields.name') }}（{{ t('common.required') }}）
      <input type="text" v-model.trim="name" :placeholder="t('placeholders.name')" />
    </label>
    <p class="hint" v-if="errors.name">{{ errors.name }}</p>
  </div>

  <div class="block">
    <label>{{ t('fields.note') }}（{{ t('common.optional') }}）
      <textarea v-model.trim="note" :placeholder="t('placeholders.note')"></textarea>
    </label>
    <p class="hint" v-if="errors.note">{{ errors.note }}</p>
  </div>

  <!-- Day10: 飲料可選項加入巧克力 -->
<OptionGroup
  :label="t('steps.pickDrink')"
  :options="props.drinks"
  v-model="drink"
  required
/>
<p class="hint" v-if="errors.drink">{{ errors.drink }}</p>

<!-- 甜度：依飲料動態變化 -->
<Transition name="step" appear>
  <div v-if="drink">
    <OptionGroup
      :label="t('steps.pickSweetness')"
      :options="optSweetness"
      v-model="sweetness"
      required
    />
  </div>
</Transition>
<p class="hint" v-if="errors.sweetness">{{ errors.sweetness }}</p>

<!-- 冰量：依飲料動態變化 -->
<Transition name="step">
  <div v-if="drink && sweetness">
    <OptionGroup
      :label="t('steps.pickIce')"
      :options="optIce"
      v-model="ice"
      required
    />
  </div>
</Transition>
<p class="hint" v-if="errors.ice">{{ errors.ice }}</p>

  <!-- 送出 -->
  <button
    :disabled="props.disabled || isSubmitting"
    @click="onSubmit"
    :class="['submit', 'enabled']"
  >
    {{ t('actions.submit') }}
  </button>
  <p class="hint" v-if="errors['']">{{ errors[''] }}</p>
</template>

<style scoped>
.step-enter-from { opacity: 0; transform: translateY(6px); }
.step-enter-active, .step-leave-active { transition: all .16s ease; }
.step-leave-to { opacity: 0; transform: translateY(-6px); }
@media (prefers-reduced-motion: reduce) {
  .step-enter-active, .step-leave-active { transition-duration: 0s; }
}
</style>
