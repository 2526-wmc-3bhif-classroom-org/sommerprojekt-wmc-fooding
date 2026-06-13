import { ref } from 'vue'

interface ConfirmState {
  message: string
  resolve: (value: boolean) => void
}

const state = ref<ConfirmState | null>(null)

export function useConfirm() {
  const confirm = (message: string): Promise<boolean> => {
    return new Promise(resolve => {
      state.value = { message, resolve }
    })
  }

  const answer = (value: boolean) => {
    state.value?.resolve(value)
    state.value = null
  }

  return { state, confirm, answer }
}
