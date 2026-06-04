<script setup lang="ts">
interface Props {
  message: string
  confirmLabel?: string
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Löschen',
  isLoading: false
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-dialog">
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="$emit('cancel')">Abbrechen</button>
          <button class="btn-confirm" :disabled="isLoading" @click="$emit('confirm')">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>{{ confirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 28px 32px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.confirm-message {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  background: var(--surface-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 10px 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--surface-hover);
  color: var(--text-main);
}

.btn-confirm {
  background: #ef4444;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm:hover:not(:disabled) {
  background: #dc2626;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
