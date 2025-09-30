<script setup>
import { ref, reactive, watch, computed } from 'vue' // 👉 Day10: 新增 watch
import OptionGroup from './OptionGroup.vue'

const emit = defineEmits(['submit'])

/* 表單欄位 */
const name = ref('')
const note = ref('')
const drink = ref('')
const sweetness = ref('')
const ice = ref('')

/* ---------------- Day10 改動開始 ---------------- */
// 每種飲料對應的甜度與冰量可選項
const OPTION_MAP = {
  紅茶:   { sweetness: ['正常甜','去糖'], ice: ['正常冰','去冰','熱飲'] },
  綠茶:   { sweetness: ['正常甜','去糖'], ice: ['正常冰','去冰'] },
  巧克力: { sweetness: ['正常甜','少糖'], ice: ['熱飲'] } // ✅ 巧克力只能熱
}

// 目前動態顯示的選項
const opt = reactive({
  sweetness: [],
  ice: []
})

// 監聽 drink：自動更新甜度與冰量的可選項，並清空不合法的值
watch(drink, (d) => {
  if (!d) return
  opt.sweetness = OPTION_MAP[d].sweetness
  opt.ice = OPTION_MAP[d].ice
  if (!opt.sweetness.includes(sweetness.value)) sweetness.value = ''
  if (!opt.ice.includes(ice.value)) ice.value = ''
})
/* ---------------- Day10 改動結束 ---------------- */

/* 驗證條件 */
const hasDrink = computed(() => !!drink.value)
const hasSweetness = computed(() => !!sweetness.value)
const hasIce = computed(() => !!ice.value)
const canSubmit = computed(() =>
  !!(name.value && hasDrink.value && hasSweetness.value && hasIce.value)
)

/* 送出事件 */
function addOrder() {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value,
    note: note.value,
    drink: drink.value,
    sweetness: sweetness.value,
    ice: ice.value
  })
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
  :options="Object.keys(OPTION_MAP)"
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
    :disabled="!canSubmit"
    @click="addOrder"
    :class="['submit', canSubmit ? 'enabled' : 'disabled']"
  >
    {{ canSubmit ? '送出' : '請完成所有必填' }}
  </button>
</template>
