import { defineComponent, ref } from 'vue'

type ThemeMode = 'dark' | 'light'
export default defineComponent({
  name: 'MainPage',
  setup() {
    const theme = ref('light'); // Standardwert 'light'
    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
    };

    return {
      theme,
      toggleTheme,
    };
  },

});


const theme = ref<ThemeMode>('light')

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  updateDocumentTheme()
}

const updateDocumentTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
}
