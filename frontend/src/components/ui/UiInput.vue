design ai made
<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  icon?: any
  error?: string
}

defineProps<Props>()
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="ui-input-wrapper">
    <label v-if="label" class="ui-label">{{ label }}</label>
    <div class="input-container" :class="{ 'has-icon': icon, 'has-error': error }">
      <div v-if="icon" class="input-icon">
        <component :is="icon" :size="20" />
      </div>
      <input
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        class="ui-input"
      />
    </div>
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.ui-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.ui-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  padding-left: 4px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 16px;
  color: var(--text-main);
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.ui-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(77, 163, 255, 0.1);
}

.has-icon .ui-input {
  padding-left: 48px;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.has-error .ui-input {
  border-color: #ef4444;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  padding-left: 4px;
}
</style>
