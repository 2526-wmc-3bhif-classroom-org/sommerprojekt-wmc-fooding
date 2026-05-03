<script setup lang="ts">
import { ref } from 'vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { 
  Package, 
  AlertTriangle, 
  ChefHat, 
  ShoppingCart,
  ArrowRight
} from 'lucide-vue-next'

const stats = ref([
  {
    label: 'Inventar',
    value: '12 Artikel gelagert',
    icon: Package,
    color: '#4da3ff'
  },
  {
    label: 'Ablauf',
    value: '3 Artikel laufen bald ab',
    icon: AlertTriangle,
    color: '#ef4444'
  }
])

const shoppingItems = ref(['Milch', 'Eier', 'Brot', 'Avocado'])
</script>

<template>
  <section class="dashboard-preview">
    <UiCard class="preview-container" :padding="'60px'">
      <div class="preview-header">
        <h2 class="preview-title">Dein Küchen Status</h2>
        <p class="preview-subtitle">Echtzeit-Einblick in dein digitales Vorratslager.</p>
      </div>
      
      <div class="preview-grid">
        <!-- Stats Cards -->
        <div v-for="stat in stats" :key="stat.label" class="stat-card glass-inner">
          <div class="stat-icon" :style="{ color: stat.color }">
            <component :is="stat.icon" :size="24" />
          </div>
          <div class="stat-info">
            <h4 class="stat-label">{{ stat.label }}</h4>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </div>
        
        <!-- Recipe Card -->
        <div class="recipe-card glass-inner accent">
          <div class="recipe-icon">
            <ChefHat :size="24" />
          </div>
          <div class="recipe-info">
            <h4 class="recipe-label">Koch-Inspiration</h4>
            <p class="recipe-suggestion">"Pesto Pasta mit Tomaten"</p>
            <UiButton size="sm">
              Rezept ansehen
              <ArrowRight :size="16" />
            </UiButton>
          </div>
        </div>
        
        <!-- Shopping List Card -->
        <div class="shopping-card glass-inner">
          <div class="shopping-icon">
            <ShoppingCart :size="24" />
          </div>
          <div class="shopping-info">
            <h4 class="shopping-label">Einkaufsliste</h4>
            <ul class="shopping-preview">
              <li v-for="item in shoppingItems" :key="item">
                <span class="dot"></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.dashboard-preview {
  padding: 60px 20px 120px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .preview-container { padding: 30px !important; border-radius: 32px; }
}

.preview-header { margin-bottom: 48px; text-align: left; }
.preview-title { font-size: 2.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 12px; }
.preview-subtitle { color: var(--text-muted); font-size: 1.1rem; }

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.glass-inner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.glass-inner:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.1); }

.stat-card { display: flex; align-items: flex-start; gap: 20px; }
.stat-icon {
  width: 48px; height: 48px; background: rgba(255, 255, 255, 0.05);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
}
.stat-label { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

.recipe-card {
  background: linear-gradient(135deg, rgba(77, 163, 255, 0.1), rgba(77, 163, 255, 0.05));
  border: 1px solid rgba(77, 163, 255, 0.2);
}
.recipe-icon { color: var(--blue); margin-bottom: 16px; }
.recipe-label { font-size: 0.9rem; color: var(--blue); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.recipe-suggestion { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 16px; }

.shopping-card { display: flex; flex-direction: column; }
.shopping-icon { color: #f59e0b; margin-bottom: 16px; }
.shopping-label { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; }
.shopping-preview { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.shopping-preview li { display: flex; align-items: center; gap: 10px; color: var(--text-main); font-weight: 500; }
.dot { width: 6px; height: 6px; background: var(--blue); border-radius: 50%; }
</style>
