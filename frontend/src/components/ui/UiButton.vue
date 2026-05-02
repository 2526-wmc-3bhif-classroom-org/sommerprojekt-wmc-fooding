design ui made
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})
</script>

<template>
  <button
    class="ui-button"
    :class="[variant, size, { disabled, loading }]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="spinner"></div>
    <slot v-else></slot>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid transparent;
  outline: none;
  font-family: inherit;
}

/* Variants */
.primary {
  background: linear-gradient(135deg, var(--blue), var(--blue-strong));
  color: white;
  box-shadow: 0 8px 16px rgba(77, 163, 255, 0.25);
}

.primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(77, 163, 255, 0.4);
}

.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  border: 1px solid var(--panel-border);
}

.secondary:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.danger:hover:not(.disabled) {
  background: #ef4444;
  color: white;
}

.text {
  background: transparent;
  color: var(--blue);
  padding-left: 0;
  padding-right: 0;
}

.text:hover:not(.disabled) {
  color: var(--blue-strong);
}

/* Sizes */
.sm { padding: 8px 16px; font-size: 0.85rem; border-radius: 10px; }
.md { padding: 12px 24px; font-size: 0.95rem; }
.lg { padding: 16px 32px; font-size: 1.05rem; border-radius: 16px; }

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
