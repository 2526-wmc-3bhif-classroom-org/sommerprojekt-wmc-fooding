<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral'
})
</script>

<template>
  <div class="ui-badge" :class="variant">
    <span class="dot" v-if="variant !== 'neutral'"></span>
    <slot></slot>
  </div>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.neutral {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border-color: var(--panel-border);
}

.primary {
  background: rgba(77, 163, 255, 0.1);
  color: var(--blue);
  border-color: rgba(77, 163, 255, 0.2);
}
.primary .dot { background: var(--blue); box-shadow: 0 0 8px var(--blue); }

.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}
.success .dot { background: #10b981; box-shadow: 0 0 8px #10b981; }

.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}
.warning .dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }

.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}
.danger .dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
</style>
