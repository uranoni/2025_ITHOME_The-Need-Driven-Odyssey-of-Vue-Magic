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
    <label v-for="opt in options" :key="typeof opt === 'string' ? opt : opt.value" style="margin-right:12px">
      <input
        type="radio"
        :checked="modelValue === (typeof opt === 'string' ? opt : opt.value)"
        @change="emit('update:modelValue', (typeof opt === 'string' ? opt : opt.value))"
      />
      {{ typeof opt === 'string' ? opt : opt.label }}
    </label>
    <p v-if="required && !modelValue" class="hint">尚未選擇：{{ label }}</p>
  </fieldset>
</template>
