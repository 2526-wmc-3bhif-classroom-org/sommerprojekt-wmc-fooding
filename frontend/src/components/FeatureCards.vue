<script setup lang="ts">
import UiCard from '@/components/ui/UiCard.vue'
import { 
  Zap, 
  Eye, 
  Sparkles,
  ArrowRight
} from 'lucide-vue-next'

const features = [
  {
    title: 'Frische Zutaten',
    description: 'Behalte den Überblick über dein Inventar und vermeide Lebensmittelverschwendung durch smarte Ablaufwarnungen.',
    icon: Zap,
    color: '#4da3ff'
  },
  {
    title: 'Food Preview',
    description: 'Sieh auf einen Blick, was du noch im Kühlschrank hast und welche Schätze dort auf ihre Verwendung warten.',
    icon: Eye,
    color: '#10b981'
  },
  {
    title: 'Fooding Experience',
    description: 'Lass dich inspirieren und koche neue Gerichte mit dem, was du bereits zu Hause hast. Kreativ & Nachhaltig.',
    icon: Sparkles,
    color: '#f59e0b'
  }
]
</script>

<template>
  <section class="features-section">
    <div class="section-header">
      <h2 class="section-title">Smart Features</h2>
      <p class="section-subtitle">Alles was du brauchst, um deine Küche zu revolutionieren.</p>
    </div>
    
    <div class="features-grid">
      <UiCard 
        v-for="(feature, index) in features" 
        :key="index"
        hoverable
        class="feature-card"
        :padding="'40px'"
      >
        <div class="feature-icon-wrapper" :style="{ backgroundColor: `${feature.color}15`, color: feature.color }">
          <component :is="feature.icon" :size="32" />
        </div>
        
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-description">{{ feature.description }}</p>
        
        <div class="feature-footer">
          <a href="#" class="feature-link">
            Mehr erfahren
            <ArrowRight :size="16" />
          </a>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.feature-card {
  display: flex;
  flex-direction: column;
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16px;
}

.feature-description {
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 32px;
  flex-grow: 1;
}

.feature-footer { margin-top: auto; }

.feature-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: gap 0.2s;
}

.feature-link:hover { gap: 12px; }
</style>
