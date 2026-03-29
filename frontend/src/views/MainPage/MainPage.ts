import { computed, defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'

type ThemeMode = 'dark' | 'light';
type SlideItem = {
  id: number
  title: string
  text: string
  image: string
};
const activeIndex = ref(0);
let intervalId: number | null = null;

// Mithilfe von KI
const slides = ref<SlideItem[]>([
  {
    id: 1,
    title: 'Title',
    text: 'Text',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 2,
    title: 'Title',
    text: 'Text',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 3,
    title: 'Title',
    text: 'Text',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80'
  }
]);

export default defineComponent({
  name: 'MainPage',
  setup() {
    const theme = ref('light');
    const activeIndex = ref(0);
    const intervalId: number | null = null;

    const buttons = ['btn1', 'btn2', 'btn3', 'btn4', 'btn5'];
    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
    };

    // Mithilfe von KI
    const slides = ref<SlideItem[]>([
      {
        id: 1,
        title: 'Title',
        text: 'Text',
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80'
      },
      {
        id: 2,
        title: 'Title',
        text: 'Text',
        image:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
      },
      {
        id: 3,
        title: 'Title',
        text: 'Text',
        image:
          'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80'
      }
    ]);

    const fallbackSlide: SlideItem = {
      id: 0,
      title: 'Title',
      text: 'Text',
      image:
        'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80'
    };

    const currentSlide = computed<SlideItem>(() => {
      return slides.value[activeIndex.value] ?? fallbackSlide
    });

    return {
      theme,
      toggleTheme,
      activeIndex,
      intervalId,
      buttons,
      slides,
      currentSlide
    };
  },

});


const theme = ref<ThemeMode>('light');

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  updateDocumentTheme()
};

const updateDocumentTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
};

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % slides.value.length
};

const stopSlider = () => {
  if (intervalId !== null) {
    window.clearInterval(intervalId)
    intervalId = null
  }
};

const startSlider = () => {
  stopSlider()
  intervalId = window.setInterval(nextSlide, 4500)
};

onMounted(() => {
  updateDocumentTheme()
  startSlider()
});

onBeforeUnmount(() => {
  stopSlider()
});
