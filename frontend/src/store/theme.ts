import { reactive, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const themeStore = reactive({
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', this.theme)
    this.updateDocument()
  },
  updateDocument() {
    document.documentElement.setAttribute('data-theme', this.theme)
    document.body.className = this.theme
  }
})

themeStore.updateDocument()
