<script setup>
import { ref, reactive, watch, computed } from 'vue'
import OptionGroup from './OptionGroup.vue'

const emit = defineEmits(['submit'])
const props = defineProps({
  disabled: { type: Boolean, default: false },
  drinks: { type: Array, default: () => [] },
  sweetnessOptions: { type: Array, default: () => [] },
  iceOptions: { type: Array, default: () => [] },
  menuRules: { type: Object, default: () => ({}) },
})

const name = ref('')
const note = ref('')
const drink = ref('')
const sweetness = ref('')
const ice = ref('')

const opt = reactive({ sweetness: [], ice: [] })

watch(drink, (d) => {
  if (!d) return
  const rule = props.menuRules[d]
  if (rule) {
    opt.sweetness = rule.allowedSweetness?.length ? rule.allowedSweetness : props.sweetnessOptions
    opt.ice = rule.allowedIce?.length ? rule.allowedIce : props.iceOptions
  } else {
    opt.sweetness = props.sweetnessOptions
    opt.ice = props.iceOptions
  }
  if (!opt.sweetness.includes(sweetness.value)) sweetness.value = ''
  if (!opt.ice.includes(ice.value)) ice.value = ''
})

const hasDrink = computed(() => !!drink.value)
const hasSweetness = computed(() => !!sweetness.value)
const hasIce = computed(() => !!ice.value)
const canSubmit = computed(() => !!(name.value && hasDrink.value && hasSweetness.value && hasIce.value))

function addOrder() {
  if (!canSubmit.value || props.disabled) return
  emit('submit', { name: name.value, note: note.value, drink: drink.value, sweetness: sweetness.value, ice: ice.value })
  name.value = note.value = ''
  drink.value = sweetness.value = ice.value = ''
}
</script>

<template>
  <!-- Day 3：姓名/備註 -->
  <div :class="['block', name ? 'complete' : 'invalid']">
    <label>姓名（必填）
      <input type="text" v-model.trim="name" placeholder="請輸入你的名字" />
    </label>
    <p class="hint" v-if="!name">尚未填寫姓名</p>
  </div>

  <div class="block">
    <label>備註（選填）
      <textarea v-model.trim="note" placeholder="例如：三點拿、少冰"></textarea>
    </label>
  </div>

  <!-- Day10: 飲料可選項加入巧克力 -->
<OptionGroup
  label="步驟 1：選擇飲料"
  :options="props.drinks"
  v-model="drink"
  required
/>

<!-- 甜度：依飲料動態變化 -->
<OptionGroup
  v-if="drink"
  label="步驟 2：選擇甜度"
  :options="opt.sweetness"
  v-model="sweetness"
  required
/>

<!-- 冰量：依飲料動態變化 -->
<OptionGroup
  v-if="drink && sweetness"
  label="步驟 3：選擇冰量"
  :options="opt.ice"
  v-model="ice"
  required
/>

  <!-- 送出 -->
  <button
    :disabled="!canSubmit || props.disabled"
    @click="addOrder"
    :class="['submit', canSubmit ? 'enabled' : 'disabled']"
  >
    {{ canSubmit ? '送出' : '請完成所有必填' }}
  </button>
</template>
