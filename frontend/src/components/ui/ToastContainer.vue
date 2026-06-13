<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          <span class="toast-message">{{ toast.message }}</span>
          <button v-if="toast.action" class="toast-action" @click="toast.action!.handler(); dismiss(toast.id)">
            {{ toast.action.label }}
          </button>
          <button class="toast-close" @click="dismiss(toast.id)">
            <X :size="14" />
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  pointer-events: all;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}

.toast.success {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.toast.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.toast.info {
  background: rgba(77, 163, 255, 0.15);
  border-color: rgba(77, 163, 255, 0.3);
  color: var(--blue, #4da3ff);
}

.toast-message {
  flex: 1;
}

.toast-action {
  background: currentColor;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.toast-action:hover {
  opacity: 0.85;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
</style>
