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
  <fieldset :class="['option-group', (!required || modelValue) ? 'complete' : 'invalid']">
    <legend class="option-legend">{{ label }}</legend>
    <div class="option-container">
      <label v-for="opt in options" :key="typeof opt === 'string' ? opt : opt.value" class="option-label">
        <input
          type="radio"
          class="option-input"
          :checked="modelValue === (typeof opt === 'string' ? opt : opt.value)"
          @change="emit('update:modelValue', (typeof opt === 'string' ? opt : opt.value))"
        />
        <span class="option-text">{{ typeof opt === 'string' ? opt : opt.label }}</span>
      </label>
    </div>
    <p v-if="required && !modelValue" class="hint">尚未選擇：{{ label }}</p>
  </fieldset>
</template>

<style scoped>
.option-group {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px;
  padding: 16px;
  margin: 10px 0;
  transition: var(--transition-fast);
}

.option-group.complete {
  border-color: #66bb6a !important;
  background: #f3fff3 !important;
}

.option-group.invalid {
  border-color: #e57373 !important;
  background: #fff5f5 !important;
}

/* 暗色模式下的驗證狀態 */
[data-theme="dark"] .option-group.complete {
  border-color: #66bb6a !important;
  background: #1b2d1b !important;
}

[data-theme="dark"] .option-group.invalid {
  border-color: #e57373 !important;
  background: #2d1b1b !important;
}

.option-legend {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding: 0 8px;
}

.option-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: var(--transition-fast);
  background: var(--bg-page);
  border: 1px solid var(--border-color);
}

.option-label:hover {
  background: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
}

.option-input {
  margin: 0;
  accent-color: var(--color-primary);
}

.option-text {
  color: var(--text-primary);
  font-weight: 500;
}

.option-label:hover .option-text {
  color: white;
}

.hint {
  font-size: 12px;
  color: #c62828;
  margin-top: 8px;
  font-weight: 500;
}
</style>
