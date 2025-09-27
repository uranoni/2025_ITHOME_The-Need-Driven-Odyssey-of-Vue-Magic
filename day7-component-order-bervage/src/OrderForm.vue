<script setup>
import { ref, computed } from 'vue'
import OptionGroup from './OptionGroup.vue'

const emit = defineEmits(['submit'])

const name = ref('')
const note = ref('')
const drink = ref('')
const sweetness = ref('')
const ice = ref('')

const hasDrink = computed(() => !!drink.value)
const hasSweetness = computed(() => !!sweetness.value)
const hasIce = computed(() => !!ice.value)
const canSubmit = computed(() => !!(name.value && hasDrink.value && hasSweetness.value && hasIce.value))

function addOrder() {
  if (!canSubmit.value) return
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

  <!-- 三組選項 -->
  <OptionGroup
  label="步驟 1：選擇飲料"
  :options="['紅茶','綠茶']"
  v-model="drink"
  required
/>

<!-- 只有選了飲料才顯示甜度 -->
<OptionGroup
  v-if="drink"
  label="步驟 2：選擇甜度"
  :options="['正常甜','去糖']"
  v-model="sweetness"
  required
/>

<!-- 只有選了飲料 + 甜度才顯示冰量 -->
<OptionGroup
  v-if="drink && sweetness"
  label="步驟 3：選擇冰量"
  :options="['正常冰','去冰']"
  v-model="ice"
  required
/>

  <button :disabled="!canSubmit" @click="addOrder" :class="['submit', canSubmit ? 'enabled' : 'disabled']">
    {{ canSubmit ? '送出' : '請完成所有必填' }}
  </button>
</template>
