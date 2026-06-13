import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
  action?: { label: string; handler: () => void }
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const show = (
    message: string,
    type: Toast['type'] = 'info',
    options?: { timeout?: number; action?: { label: string; handler: () => void } }
  ) => {
    const id = nextId++
    toasts.value.push({ id, type, message, action: options?.action })
    const timeout = options?.timeout ?? (type === 'error' ? 6000 : 4000)
    setTimeout(() => dismiss(id), timeout)
    return id
  }

  const dismiss = (id: number) => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, show, dismiss }
}
