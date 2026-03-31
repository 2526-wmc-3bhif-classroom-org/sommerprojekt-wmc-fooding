  <template>
  <div class="page" :class="theme">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>

    <header class="topbar glass">
      <nav class="nav-links" aria-label="Main navigation">
        <a href="#" class="nav-link">Link One</a>
        <a href="#" class="nav-link">Link Two</a>
        <a href="#" class="nav-link">Link Three</a>
        <a href="#" class="nav-link">Link Four</a>
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

        <h2>{{ isLoginMode ? 'Anmelden' : 'Registrieren' }}</h2>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Auth Form -->
        <form @submit.prevent="handleAuthSubmit">
          <div class="form-group">
            <label for="auth-email">E-Mail</label>
            <input
              id="auth-email"
              v-model="authEmail"
              type="email"
              placeholder="deine@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="auth-password">Passwort</label>
            <input
              id="auth-password"
              v-model="authPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="isAuthLoading">
            {{ isAuthLoading ? 'Wird verarbeitet...' : isLoginMode ? 'Anmelden' : 'Registrieren' }}
          </button>
        </form>

        <!-- Toggle Mode -->
        <div class="toggle-mode">
          <p>
            {{ isLoginMode ? 'Noch kein Konto?' : 'Konto vorhanden?' }}
            <button type="button" @click="toggleAuthMode" class="toggle-btn">
              {{ isLoginMode ? 'Hier registrieren' : 'Hier anmelden' }}
            </button>
          </p>
        </div>
      </div>
    </div>

    <main class="hero-layout">
      <section class="intro-panel glass">
        <div class="intro-content">
          <p class="eyebrow">Smart • Modern • Delicious</p>
          <h1 class="headline">FOODING</h1>
          <p class="sub-accent">EAT LIKE NEVER BEFORE!</p>
          <p class="description"></p>

          <!-- Mithilfe von KI -->
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
                <p class="slide-kicker">Text</p>
                <h2 class="slide-title">{{ currentSlide.title }}</h2>
                <p class="slide-text">{{ currentSlide.text }}</p>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>

    <footer class="bottom-nav">
      <button
        v-for="button in buttons"
        :key="button"
        type="button"
        class="action-card"
        @click="handlePlaceholder(button)"
      >
        <span class="action-glow"></span>
        <span class="action-label">{{ button }}</span>
        <span class="action-arrow">↗</span>
      </button>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import { authService } from '@/services/auth'
import { useRouter } from 'vue-router'

type ThemeMode = 'dark' | 'light';

type SlideItem = {
  id: number
  title: string
  text: string
  image: string
};

export default defineComponent({
  name: 'MainPage',
  setup() {
    const router = useRouter()
    const theme = ref<ThemeMode>('light')
    const activeIndex = ref(0)
    let intervalId: number | null = null

    // Auth Modal State
    const showAuthModal = ref(false)
    const isLoginMode = ref(true)
    const authEmail = ref('')
    const authPassword = ref('')
    const errorMessage = ref('')
    const isAuthLoading = ref(false)
    const authRefresh = ref(0)

    const isAuthenticated = computed(() => {
      authRefresh.value // Depend on refresh trigger
      return authService.isAuthenticated()
    })
    const user = computed(() => {
      authRefresh.value // Depend on refresh trigger
      return authService.getUser()
    })

    const buttons = ['btn1', 'btn2', 'btn3', 'btn4', 'btn5']

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
    ])

    const fallbackSlide: SlideItem = {
      id: 0,
      title: 'Title',
      text: 'Text',
      image:
        'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80'
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

    const handlePlaceholder = (button: string) => {
      console.log(`${button} clicked`)
    }

    // Auth Modal Functions
    const toggleAuthMode = () => {
      isLoginMode.value = !isLoginMode.value
      errorMessage.value = ''
    }

    const closeAuthModal = () => {
      showAuthModal.value = false
      authEmail.value = ''
      authPassword.value = ''
      errorMessage.value = ''
      isLoginMode.value = true
    }

    const handleAuthSubmit = async () => {
      errorMessage.value = ''
      isAuthLoading.value = true

      try {
        if (isLoginMode.value) {
          await authService.login({
            email: authEmail.value,
            password: authPassword.value
          })
        } else {
          await authService.register({
            email: authEmail.value,
            password: authPassword.value
          })
        }
        
        // BEIDE: Seite reloaden für sauberen State
        setTimeout(() => {
          window.location.reload()
        }, 200)
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message
        } else {
          errorMessage.value = 'Ein Fehler ist aufgetreten'
        }
      } finally {
        isAuthLoading.value = false
      }
    }

    const handleLogout = () => {
      authService.logout()
      // Trigger computed properties to update
      authRefresh.value++
      // Small delay to ensure data is cleared
      setTimeout(() => {
        window.location.reload()
      }, 50)
    }

    onMounted(() => {
      updateDocumentTheme()
      startSlider()
      // Ensure auth state is fresh on mount
      authService.getToken()
    })

    onBeforeUnmount(() => {
      stopSlider()
    })

    return {
      theme,
      buttons,
      currentSlide,
      toggleTheme,
      handlePlaceholder,
      showAuthModal,
      isLoginMode,
      authEmail,
      authPassword,
      errorMessage,
      isAuthLoading,
      isAuthenticated,
      user,
      toggleAuthMode,
      closeAuthModal,
      handleAuthSubmit,
      handleLogout
    }
  }
});
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  margin: 0;
  min-height: 100%;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
  sans-serif;
}

:global(body) {
  background: #08111a;
}

/* Mithilfe von KI */
.page {
  --bg-secondary: rgba(18, 26, 36, 0.62);
  --panel-border: rgba(255, 255, 255, 0.1);
  --text-main: #f8fbff;
  --text-muted: rgba(235, 241, 250, 0.76);
  --link: rgba(244, 248, 255, 0.88);
  --blue: #4da3ff;
  --blue-strong: #1d78ff;
  --accent-warm: #ffd9b0;
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
  --button-bg: rgba(20, 30, 42, 0.7);
  --button-border: rgba(140, 198, 255, 0.18);
  --ambient: rgba(112, 189, 255, 0.12);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 28px;
  color: var(--text-main);
  background:
    radial-gradient(circle at top left, rgba(77, 163, 255, 0.12), transparent 24%),
    radial-gradient(circle at 82% 16%, rgba(255, 217, 176, 0.1), transparent 18%),
    radial-gradient(circle at 50% 100%, rgba(255, 186, 120, 0.08), transparent 25%),
    linear-gradient(160deg, #08111a 0%, #0d1821 46%, #131d22 100%);
}

/* Mithilfe von KI */
.page.light {
  --bg-secondary: rgba(255, 251, 246, 0.7);
  --panel-border: rgba(124, 93, 58, 0.1);
  --text-main: #1f2933;
  --text-muted: rgba(43, 52, 61, 0.72);
  --link: rgba(31, 41, 51, 0.84);
  --blue: #3c8dff;
  --blue-strong: #156eff;
  --accent-warm: #eab676;
  --shadow: 0 25px 60px rgba(115, 84, 52, 0.12);
  --button-bg: rgba(255, 250, 245, 0.78);
  --button-border: rgba(195, 159, 119, 0.18);
  --ambient: rgba(234, 182, 118, 0.12);
  background:
    radial-gradient(circle at top left, rgba(77, 163, 255, 0.08), transparent 24%),
    radial-gradient(circle at 100% 0%, rgba(234, 182, 118, 0.14), transparent 22%),
    radial-gradient(circle at 50% 100%, rgba(255, 214, 168, 0.14), transparent 25%),
    linear-gradient(160deg, #f7f1e9 0%, #fffaf5 48%, #f2ebe2 100%);
}

.page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02)),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 78px,
      rgba(255, 255, 255, 0.018) 79px,
      transparent 80px
    );
  opacity: 0.35;
}

.page::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.12) 100%);
}

/* Mithilfe von KI */
.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(34px);
  background: var(--ambient);
  pointer-events: none;
}

.ambient-1 {
  width: 240px;
  height: 240px;
  top: 80px;
  left: -60px;
}

.ambient-2 {
  width: 300px;
  height: 300px;
  right: -90px;
  top: 160px;
}

.ambient-3 {
  width: 220px;
  height: 220px;
  bottom: 80px;
  left: 35%;
}

/* Mithilfe von KI */
.glass {
  background: linear-gradient(145deg, var(--bg-secondary), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--panel-border);
  box-shadow: var(--shadow);
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 24px;
  border-top-left-radius: 36px;
  border-bottom-right-radius: 36px;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
}

.nav-link {
  position: relative;
  color: var(--link);
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  transition: color 0.25s ease;
}

/* Mithilfe von KI */
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--blue), transparent);
  transition: width 0.25s ease;
}

.nav-link:hover {
  color: var(--text-main);
}

.nav-link:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--blue), var(--blue-strong));
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(77, 163, 255, 0.4);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-email {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.logout-btn {
  padding: 6px 12px;
  background: rgba(255, 76, 76, 0.2);
  color: #ff4c4c;
  border: 1px solid #ff4c4c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 76, 76, 0.3);
}

.theme-toggle {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

/* Mithilfe von KI */
.toggle-track {
  width: 76px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(47, 140, 255, 0.22));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.04), 0 10px 24px rgba(0, 0, 0, 0.18);
}

/* Mithilfe von KI */
.toggle-thumb {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: linear-gradient(145deg, var(--blue), var(--blue-strong));
  transform: translateX(0);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 94, 255, 0.35);
}

.light .toggle-thumb {
  transform: translateX(34px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-content h2 {
  color: #333;
  margin: 0 0 20px;
  text-align: center;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #c33;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-mode {
  text-align: center;
  margin-top: 16px;
  color: #666;
  font-size: 0.85rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
}

.toggle-btn:hover {
  color: #764ba2;
}

/* Mithilfe von KI */
.hero-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 0.95fr);
  gap: 16px;
  margin-top: 12px;
  min-height: calc(100vh - 240px);
}

.intro-panel,
.visual-panel {
  min-height: 100%;
}

/* Mithilfe von KI */
.intro-panel {
  display: flex;
  align-items: center;
  padding: clamp(18px, 3vw, 28px);
  border-radius: 30px;
  border-top-left-radius: 42px;
  border-bottom-right-radius: 42px;
  position: relative;
  overflow: hidden;
}

.intro-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 217, 176, 0.08), transparent 22%),
    radial-gradient(circle at 80% 80%, rgba(77, 163, 255, 0.08), transparent 26%);
  pointer-events: none;
}

.intro-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--blue);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.headline {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.sub-accent {
  margin: 18px 0 0;
  color: var(--accent-warm);
  font-size: 1rem;
  font-weight: 600;
}

.description {
  margin: 18px 0 0;
  max-width: 42ch;
  color: var(--text-muted);
  font-size: clamp(0.98rem, 1.4vw, 1.08rem);
  line-height: 1.8;
}

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
.visual-panel {
  padding: 14px;
  border-radius: 30px;
  border-top-right-radius: 42px;
  border-bottom-left-radius: 42px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.bottom-nav {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 12px;
}

/* Mithilfe von KI */
.action-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: 170px;
  border: 1px solid var(--button-border);
  border-radius: 28px;
  border-top-left-radius: 36px;
  border-bottom-right-radius: 36px;
  background: linear-gradient(135deg, var(--button-bg), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-main);
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(255, 217, 176, 0.42);
  box-shadow: 0 18px 38px rgba(57, 42, 26, 0.2);
}

.action-glow {
  position: absolute;
  inset: auto auto -30px -10px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 217, 176, 0.22),
    rgba(77, 163, 255, 0.18),
    transparent 68%
  );
  z-index: -1;
}

.action-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.action-card:hover::after {
  opacity: 1;
}

.action-label {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.action-arrow {
  color: var(--accent-warm);
  font-size: 1.15rem;
  transition: transform 0.25s ease;
}

.action-card:hover .action-arrow {
  transform: translate(2px, -2px);
}

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
@media (max-width: 1180px) {
  .hero-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .intro-panel,
  .visual-panel {
    min-height: auto;
  }

  .bottom-nav {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }
}

/* Mithilfe von KI */
@media (max-width: 720px) {
  .page {
    padding: 16px;
  }

  .topbar {
    padding: 14px 16px;
    border-radius: 20px;
    align-items: flex-start;
  }

  .nav-links {
    flex-direction: column;
    gap: 8px;
  }

  .hero-layout {
    gap: 16px;
    margin-top: 18px;
  }

  .intro-panel,
  .visual-panel {
    border-radius: 24px;
  }

  .visual-panel {
    padding: 12px;
  }

  .intro-image {
    height: 220px;
  }

  .slider-frame,
  .slide {
    min-height: 280px;
  }

  .bottom-nav {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 18px;
  }

  .action-card {
    min-height: 125px;
    padding: 20px;
  }
}

/* Mithilfe von KI */
@media (max-width: 520px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .theme-toggle {
    align-self: flex-end;
  }

  .headline {
    font-size: clamp(2.2rem, 12vw, 3.6rem);
  }

  .bottom-nav {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
    padding: 20px;
  }
}
</style>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  margin: 0;
  min-height: 100%;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
  sans-serif;
}

:global(body) {
  background: #08111a;
}

/* Mithilfe von KI */
.page {
  --bg-secondary: rgba(18, 26, 36, 0.62);
  --panel-border: rgba(255, 255, 255, 0.1);
  --text-main: #f8fbff;
  --text-muted: rgba(235, 241, 250, 0.76);
  --link: rgba(244, 248, 255, 0.88);
  --blue: #4da3ff;
  --blue-strong: #1d78ff;
  --accent-warm: #ffd9b0;
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
  --button-bg: rgba(20, 30, 42, 0.7);
  --button-border: rgba(140, 198, 255, 0.18);
  --ambient: rgba(112, 189, 255, 0.12);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 28px;
  color: var(--text-main);
  background:
    radial-gradient(circle at top left, rgba(77, 163, 255, 0.12), transparent 24%),
    radial-gradient(circle at 82% 16%, rgba(255, 217, 176, 0.1), transparent 18%),
    radial-gradient(circle at 50% 100%, rgba(255, 186, 120, 0.08), transparent 25%),
    linear-gradient(160deg, #08111a 0%, #0d1821 46%, #131d22 100%);
}

/* Mithilfe von KI */
.page.light {
  --bg-secondary: rgba(255, 251, 246, 0.7);
  --panel-border: rgba(124, 93, 58, 0.1);
  --text-main: #1f2933;
  --text-muted: rgba(43, 52, 61, 0.72);
  --link: rgba(31, 41, 51, 0.84);
  --blue: #3c8dff;
  --blue-strong: #156eff;
  --accent-warm: #eab676;
  --shadow: 0 25px 60px rgba(115, 84, 52, 0.12);
  --button-bg: rgba(255, 250, 245, 0.78);
  --button-border: rgba(195, 159, 119, 0.18);
  --ambient: rgba(234, 182, 118, 0.12);
  background:
    radial-gradient(circle at top left, rgba(77, 163, 255, 0.08), transparent 24%),
    radial-gradient(circle at 100% 0%, rgba(234, 182, 118, 0.14), transparent 22%),
    radial-gradient(circle at 50% 100%, rgba(255, 214, 168, 0.14), transparent 25%),
    linear-gradient(160deg, #f7f1e9 0%, #fffaf5 48%, #f2ebe2 100%);
}

.page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02)),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 78px,
      rgba(255, 255, 255, 0.018) 79px,
      transparent 80px
    );
  opacity: 0.35;
}

.page::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.12) 100%);
}

/* Mithilfe von KI */
.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(34px);
  background: var(--ambient);
  pointer-events: none;
}

.ambient-1 {
  width: 240px;
  height: 240px;
  top: 80px;
  left: -60px;
}

.ambient-2 {
  width: 300px;
  height: 300px;
  right: -90px;
  top: 160px;
}

.ambient-3 {
  width: 220px;
  height: 220px;
  bottom: 80px;
  left: 35%;
}

/* Mithilfe von KI */
.glass {
  background: linear-gradient(145deg, var(--bg-secondary), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--panel-border);
  box-shadow: var(--shadow);
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 24px;
  border-top-left-radius: 36px;
  border-bottom-right-radius: 36px;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
}

.nav-link {
  position: relative;
  color: var(--link);
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  transition: color 0.25s ease;
}

/* Mithilfe von KI */
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--blue), transparent);
  transition: width 0.25s ease;
}

.nav-link:hover {
  color: var(--text-main);
}

.nav-link:hover::after {
  width: 100%;
}

.theme-toggle {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

/* Mithilfe von KI */
.toggle-track {
  width: 76px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(47, 140, 255, 0.22));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.04), 0 10px 24px rgba(0, 0, 0, 0.18);
}

/* Mithilfe von KI */
.toggle-thumb {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: linear-gradient(145deg, var(--blue), var(--blue-strong));
  transform: translateX(0);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 94, 255, 0.35);
}

.light .toggle-thumb {
  transform: translateX(34px);
}

/* Mithilfe von KI */
.hero-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 0.95fr);
  gap: 16px;
  margin-top: 12px;
  min-height: calc(100vh - 240px);
}

.intro-panel,
.visual-panel {
  min-height: 100%;
}

/* Mithilfe von KI */
.intro-panel {
  display: flex;
  align-items: center;
  padding: clamp(18px, 3vw, 28px);
  border-radius: 30px;
  border-top-left-radius: 42px;
  border-bottom-right-radius: 42px;
  position: relative;
  overflow: hidden;
}

.intro-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 217, 176, 0.08), transparent 22%),
    radial-gradient(circle at 80% 80%, rgba(77, 163, 255, 0.08), transparent 26%);
  pointer-events: none;
}

.intro-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--blue);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.headline {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.sub-accent {
  margin: 18px 0 0;
  color: var(--accent-warm);
  font-size: 1rem;
  font-weight: 600;
}

.description {
  margin: 18px 0 0;
  max-width: 42ch;
  color: var(--text-muted);
  font-size: clamp(0.98rem, 1.4vw, 1.08rem);
  line-height: 1.8;
}

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
.visual-panel {
  padding: 14px;
  border-radius: 30px;
  border-top-right-radius: 42px;
  border-bottom-left-radius: 42px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.bottom-nav {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 12px;
}

/* Mithilfe von KI */
.action-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: 170px;
  border: 1px solid var(--button-border);
  border-radius: 28px;
  border-top-left-radius: 36px;
  border-bottom-right-radius: 36px;
  background: linear-gradient(135deg, var(--button-bg), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-main);
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(255, 217, 176, 0.42);
  box-shadow: 0 18px 38px rgba(57, 42, 26, 0.2);
}

.action-glow {
  position: absolute;
  inset: auto auto -30px -10px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 217, 176, 0.22),
    rgba(77, 163, 255, 0.18),
    transparent 68%
  );
  z-index: -1;
}

.action-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.action-card:hover::after {
  opacity: 1;
}

.action-label {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.action-arrow {
  color: var(--accent-warm);
  font-size: 1.15rem;
  transition: transform 0.25s ease;
}

.action-card:hover .action-arrow {
  transform: translate(2px, -2px);
}

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
@media (max-width: 1180px) {
  .hero-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .intro-panel,
  .visual-panel {
    min-height: auto;
  }

  .bottom-nav {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }
}

/* Mithilfe von KI */
@media (max-width: 720px) {
  .page {
    padding: 16px;
  }

  .topbar {
    padding: 14px 16px;
    border-radius: 20px;
    align-items: flex-start;
  }

  .hero-layout {
    gap: 16px;
    margin-top: 18px;
  }

  .intro-panel,
  .visual-panel {
    border-radius: 24px;
  }

  .visual-panel {
    padding: 12px;
  }

  .intro-image {
    height: 220px;
  }

  .slider-frame,
  .slide {
    min-height: 280px;
  }

  .bottom-nav {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 18px;
  }

  .action-card {
    min-height: 125px;
    padding: 20px;
  }
}

/* Mithilfe von KI */
@media (max-width: 520px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .theme-toggle {
    align-self: flex-end;
  }

  .headline {
    font-size: clamp(2.2rem, 12vw, 3.6rem);
  }

  .bottom-nav {
    grid-template-columns: 1fr;
  }
}
</style>
