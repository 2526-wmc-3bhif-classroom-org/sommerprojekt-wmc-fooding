<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'

const { state, answer } = useConfirm()
</script>

<template>
  <teleport to="body">
    <transition name="overlay">
      <div v-if="state" class="confirm-overlay" @click.self="answer(false)">
        <div class="confirm-dialog">
          <p class="confirm-message">{{ state.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="answer(false)">Abbrechen</button>
            <button class="btn-confirm" @click="answer(true)">Bestätigen</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  background: var(--surface, #1e2028);
  border: 1px solid var(--panel-border, rgba(255,255,255,0.08));
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-main);
  margin: 0 0 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--panel-border, rgba(255,255,255,0.1));
  background: var(--surface-hover, rgba(255,255,255,0.05));
  color: var(--text-secondary, #9ca3af);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--surface-active, rgba(255,255,255,0.1));
}

.btn-confirm {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #dc2626;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-active .confirm-dialog,
.overlay-leave-active .confirm-dialog {
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.overlay-enter-from .confirm-dialog,
.overlay-leave-to .confirm-dialog {
  transform: scale(0.95);
}
</style>
