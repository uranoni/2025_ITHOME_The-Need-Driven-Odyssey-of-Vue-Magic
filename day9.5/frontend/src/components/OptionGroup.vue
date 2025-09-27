<script setup>
const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset :class="['block', (!required || modelValue) ? 'complete' : 'invalid']">
    <legend>{{ label }}</legend>
    <label v-for="opt in options" :key="opt" style="margin-right:12px">
      <input
        type="radio"
        :checked="modelValue === opt"
        @change="emit('update:modelValue', opt)"
      />
      {{ opt }}
    </label>
    <p v-if="required && !modelValue" class="hint">尚未選擇：{{ label }}</p>
  </fieldset>
</template>
