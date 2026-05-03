<script setup lang="ts">
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { ArrowRight, Play } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToInventory = () => {
  router.push('/inventory')
}

const navigateToRecipes = () => {
  router.push('/recipes')
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <UiBadge variant="primary" class="fade-in">
        Smart • Modern • Delicious
      </UiBadge>
      
      <h1 class="headline fade-in">
        Eat like <br />
        <span class="text-gradient">never before!</span>
      </h1>
      
      <p class="subheadline fade-in">
        Verwalte deine Lebensmittel effizient und entdecke neue Rezepte. 
        Smartes Kochen beginnt hier.
      </p>
      
      <div class="cta-group fade-in">
        <UiButton size="lg" @click="navigateToInventory">
          Inventar prüfen
          <ArrowRight :size="18" />
        </UiButton>
        <UiButton variant="secondary" size="lg" @click="navigateToRecipes">
          <Play :size="18" fill="currentColor" />
          Rezepte entdecken
        </UiButton>
      </div>
    </div>
    
    <div class="hero-visual fade-in">
      <UiCard class="mockup-container" :padding="'12px'">
        <img 
          src="https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80" 
          alt="App Mockup" 
          class="mockup-image"
        />
        <div class="floating-card animation-float">
          <UiCard class="floating-inner" :padding="'16px 24px'">
            <div class="card-icon">🥗</div>
            <div class="card-text">
              <p class="card-title">Frische-Check</p>
              <p class="card-subtitle">95% deiner Zutaten sind frisch</p>
            </div>
          </UiCard>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-section {
    grid-template-columns: 1.2fr 0.8fr;
    padding: 100px 20px;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.headline {
  font-size: clamp(3rem, 8vw, 5.5rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--text-main);
  margin: 32px 0 24px;
}

.text-gradient {
  background: linear-gradient(135deg, var(--blue), #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subheadline {
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 500px;
  margin-bottom: 40px;
}

.cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.mockup-container {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
}

.mockup-image {
  width: 100%;
  height: auto;
  border-radius: 20px;
  display: block;
}

.floating-card {
  position: absolute;
  bottom: 40px;
  left: -20px;
  z-index: 10;
}

.floating-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

@media (max-width: 640px) {
  .floating-card {
    left: 20px;
    bottom: 20px;
  }
}

.card-icon { font-size: 2rem; }
.card-title { font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin: 0; }
.card-subtitle { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

.fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
.cta-group.fade-in { animation-delay: 0.4s; }
.hero-visual.fade-in { animation-delay: 0.6s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animation-float { animation: float 6s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
</style>
