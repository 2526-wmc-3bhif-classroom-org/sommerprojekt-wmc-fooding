<template xmlns="http://www.w3.org/1999/html">
  <div class="dashboard-page">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>

    <main class="content-container">
      <section class="hero-layout">
        <section class="intro-panel glass">
          <div class="intro-content">
            <p class="eyebrow">Smart • Modern • Delicious</p>
            <h1 class="headline">FOODING</h1>
            <p class="sub-accent">EAT LIKE NEVER BEFORE!</p>
            <p class="description">
              Verwalte deine Lebensmittel effizient und entdecke neue Rezepte.
              Smartes Kochen beginnt hier.
            </p>
            <div v-if="isAuthenticated" class="quick-actions">
                <button @click="$router.push('/inventory')" class="btn-glass">
                  Inventar prüfen
                </button>
                <button @click="$router.push('/recipes')" class="btn-class secondary">
                  Rezepte entdecken
                </button>
            </div>

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
      </section>

      <section v-if="isAuthenticated" class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Dein Küchen Status</h2>

        </div>

        <div class="dashboard-grid">
          <div class="widget-card glass">
            <div class="widget-icon">📦</div>
            <div class="widget-info">
              <h3>Inventar</h3>
              <p v-if="loading">Lädt...</p>
              <p v-else><strong>{{ inventoryCount }}</strong> Artikel gelagert</p>
            </div>
          </div>


        <div class="widget-car glass" :class="{ 'warning-border': expiringCount > 0}">
          <div class="widget-icon"></div>
          <div><h3>Achtung</h3>
            <p v-if="loading">Lädt...</p>
            <p v-else><strong>{{expiringCount}}</strong> Artikel laufen bald ab</p>
          </div>
        </div>


          <!-- Widget 2: Recipe Suggestion -->
          <div class="widget-card glass accent">
            <div class="widget-icon">🍳</div>
            <div class="widget-info">
              <h3>Koch-Inspiration</h3>
              <p>Basierend auf deinem Bestand:</p>
              <p class="suggestion-text">"Pesto Pasta mit Tomaten"</p>
              <button class="btn-text">Rezept ansehen →</button>
            </div>
          </div>

          <!-- Widget 3: Shopping List -->
          <div class="widget-card glass">
            <div class="widget-icon">🛒</div>
            <div class="widget-info">
              <h3>Einkaufsliste</h3>
              <p>Du hast <strong>3</strong> Artikel auf deiner Liste.</p>
              <div class="preview-list">
                <span>• Milch</span>
                <span>• Eier</span>
                <span>• Brot</span>
              </div>
            </div>
          </div>
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
import { themeStore } from '@/store/theme'
import {inventoryService} from "@/services/inventory.ts";

type SlideItem = {
  id: number
  title: string
  text: string
  image: string
};

export default defineComponent({
  name: 'MainPage',
  setup() {
    const activeIndex = ref(0)
    let intervalId: number | null = null

    // Dashboard Data
    const inventoryCount = ref(0)
    const expiringCount = ref(0)
    const loading = ref(false)
    const isAuthenticated = computed(() => authService.isAuthenticated)

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

    onMounted(async () => {
      startSlider()
      if(isAuthenticated.value){
        loading.value= true
        try {
          const items = await inventoryService.getInventory();
          inventoryCount.value = items.length;

          const today = new Date();
          const soon = new Date();

          soon.setDate(today.getDate() + 3)
          expiringCount.value = items.filter(item => {
            const expDate = new Date(item.expiration_date)
            return expDate <= soon
          }).length
        }catch (e){
          console.error('Fehler beim Laden der Stats:', e)

        }finally {
          loading.value=false
        }
      }
    })

    onBeforeUnmount(() => {
      stopSlider()
    })

    return {
      themeStore,
      currentSlide,
      isAuthenticated, inventoryCount, expiringCount, loading
    }
  }
});
</script>

<style scoped>
@import '@/assets/page-layout.css';

.dashboard-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.dashboard-page::-webkit-scrollbar{
  display: none;
}

.dashboard-section{
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.dashboard-grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.widget-card{
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  border-radius: 24px;
  transition: transform 0.3s ease;
}

.widget-card:hover{
  transform: scale(1.02);
}

.widget-icon{
  font-size: 2.5rem;
}
.warning-border{
  border: 1px solid rgba(255, 59, 48, 0.3) !important;
}

.section-title{
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-layout {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 0.95fr);
  gap: 20px;
  min-height: 0;
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
.quick-actions{
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-class {
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 113, 227, 0.8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-class.secondary{
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  border: 1px solid var(--border-color)
}

.btn-class:hover{
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);

}
.slide-overlay {
  width: 100%;
  padding: clamp(22px, 3vw, 32px);
  background: linear-gradient(to top, rgba(14, 11, 8, 0.72), rgba(14, 11, 8, 0.08));
  backdrop-filter: blur(3px);
}

.dark .slide-overlay {
  background: linear-gradient(to top, rgba(14, 11, 8, 0.9), rgba(14, 11, 8, 0.06));
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
