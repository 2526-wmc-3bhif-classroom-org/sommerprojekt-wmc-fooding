<template>
  <div class="page" :class="theme">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>

    <header class="topbar glass">
      <nav class="nav-links" aria-label="Main navigation">
        <router-link to="/inventory" class="nav-link">Inventar</router-link>
        <router-link to="/products" class="nav-link">Produkte</router-link>
      </nav>

      <div class="header-actions">
        <!-- Login/Logout Button -->
        <button
          v-if="!isAuthenticated"
          class="login-btn"
          type="button"
          @click="showAuthModal = true"
        >
          Login
        </button>
        <div v-else class="user-section">
          <span class="user-email">{{ user?.email }}</span>
          <button class="logout-btn" type="button" @click="handleLogout">
            Logout
          </button>
        </div>

        <!-- Theme Toggle -->
        <button
          class="theme-toggle"
          type="button"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <span class="toggle-track">
            <span class="toggle-thumb">
              <span v-if="theme === 'dark'">☾</span>
              <span v-else>☀</span>
            </span>
          </span>
        </button>
      </div>
    </header>

    <!-- Auth Modal -->
    <div v-if="showAuthModal" class="modal-overlay" @click="closeAuthModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeAuthModal">✕</button>
        <h2>Authentifizierung</h2>
        <AuthForm @success="handleAuthSuccess" />
      </div>
    </div>

    <main class="hero-layout">
      <section class="intro-panel glass">
        <div class="intro-content">
          <p class="eyebrow">Smart • Modern • Delicious</p>
          <h1 class="headline">FOODING</h1>
          <p class="sub-accent">EAT LIKE NEVER BEFORE!</p>
          <p class="description">
            Verwalte deine Lebensmittel effizient und entdecke neue Rezepte.
            Smartes Kochen beginnt hier.
          </p>

          <div class="intro-image-wrap">
            <img
              class="intro-image"
              src="https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80"
              alt="Food preview"
            />
          </div>
        </div>
      </section>

      <section class="visual-panel glass">
        <div class="slider-frame">
          <transition name="fade" mode="out-in">
            <div
              :key="currentSlide.id"
              class="slide"
              :style="{
                backgroundImage: `linear-gradient(135deg, rgba(14, 11, 8, 0.24), rgba(77, 163, 255, 0.12)), url(${currentSlide.image})`
              }"
            >
              <div class="slide-overlay">
                <p class="slide-kicker">Fooding Experience</p>
                <h2 class="slide-title">{{ currentSlide.title }}</h2>
                <p class="slide-text">{{ currentSlide.text }}</p>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>

    <footer class="bottom-nav">
      <!-- Platz für zukünftige Features -->
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { authService } from '@/services/auth'
import AuthForm from '@/components/AuthForm.vue'

type ThemeMode = 'dark' | 'light';

type SlideItem = {
  id: number
  title: string
  text: string
  image: string
};

export default defineComponent({
  name: 'MainPage',
  components: {
    AuthForm
  },
  setup() {
    const theme = ref<ThemeMode>('light')
    const activeIndex = ref(0)
    let intervalId: number | null = null

    // Auth State (Reactive through authService)
    const showAuthModal = ref(false)
    const isAuthenticated = computed(() => authService.isAuthenticated)
    const user = computed(() => authService.user)

    const slides = ref<SlideItem[]>([
      {
        id: 1,
        title: 'Frische Zutaten',
        text: 'Behalte den Überblick über dein Inventar und vermeide Lebensmittelverschwendung.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80'
      },
      {
        id: 2,
        title: 'Smarte Planung',
        text: 'Plane deine Mahlzeiten und Einkaufslisten ganz einfach per App.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
      },
      {
        id: 3,
        title: 'Kreative Rezepte',
        text: 'Lass dich inspirieren und koche neue Gerichte mit dem, was du bereits zu Hause hast.',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80'
      }
    ])

    const fallbackSlide: SlideItem = {
      id: 0,
      title: 'Willkommen bei Fooding',
      text: 'Dein Partner für eine smarte Küche.',
      image: 'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80'
    }

    const currentSlide = computed<SlideItem>(() => {
      return slides.value[activeIndex.value] ?? fallbackSlide
    })

    const updateDocumentTheme = () => {
      document.documentElement.setAttribute('data-theme', theme.value)
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      updateDocumentTheme()
    }

    const nextSlide = () => {
      activeIndex.value = (activeIndex.value + 1) % slides.value.length
    }

    const stopSlider = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    const startSlider = () => {
      stopSlider()
      intervalId = window.setInterval(nextSlide, 4500)
    }

    const closeAuthModal = () => {
      showAuthModal.value = false
    }

    const handleAuthSuccess = () => {
      closeAuthModal()
    }

    const handleLogout = () => {
      authService.logout()
    }

    onMounted(() => {
      updateDocumentTheme()
      startSlider()
    })

    onBeforeUnmount(() => {
      stopSlider()
    })

    return {
      theme,
      currentSlide,
      toggleTheme,
      showAuthModal,
      isAuthenticated,
      user,
      closeAuthModal,
      handleAuthSuccess,
      handleLogout
    }
  }
});
</script>

<style scoped>
/* Gemeinsames Styling wird importiert  */
@import '@/assets/page-layout.css';


/* Mithilfe von KI */
.intro-image-wrap {
  margin-top: 24px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
}

.intro-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.intro-image-wrap:hover .intro-image {
  transform: scale(1.05);
}

/* Mithilfe von KI */
.slider-frame {
  position: relative;
  flex: 1;
  min-height: 260px;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

/* Mithilfe von KI */
.slide {
  width: 100%;
  height: 100%;
  min-height: 260px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.slide-overlay {
  width: 100%;
  padding: clamp(22px, 3vw, 32px);
  background: linear-gradient(to top, rgba(14, 11, 8, 0.72), rgba(14, 11, 8, 0.08));
  backdrop-filter: blur(3px);
}

.light .slide-overlay {
  background: linear-gradient(to top, rgba(255, 248, 241, 0.9), rgba(255, 248, 241, 0.06));
}

/* Mithilfe von KI */
.slide-kicker {
  margin: 0 0 10px;
  font-size: 0.84rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-warm);
  font-weight: 700;
}

.slide-title {
  margin: 0;
  font-size: clamp(1.5rem, 2.3vw, 2.25rem);
}

.slide-text {
  margin: 12px 0 0;
  max-width: 52ch;
  color: var(--text-muted);
  line-height: 1.7;
}

/* Fade transition for slider */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* Mithilfe von KI */
@media (max-width: 720px) {
  .intro-image {
    height: 220px;
  }

  .slider-frame,
  .slide {
    min-height: 280px;
  }
}
</style>
