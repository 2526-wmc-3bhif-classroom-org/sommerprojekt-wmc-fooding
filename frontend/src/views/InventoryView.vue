<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { inventoryService, type InventoryItem } from '@/services/inventory'
import { productService, type Product } from '@/services/product'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { 
  Search, 
  Trash2, 
  Edit2, 
  Minus, 
  Calendar, 
  Package, 
  Grid, 
  List,
  Plus,
  ArrowRight
} from 'lucide-vue-next'

const router = useRouter()

// UI State
const activeFilter = ref('all')
const viewMode = ref('grid')
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('date')
const isLoading = ref(true)

// Data State
const items = ref<InventoryItem[]>([])
const allProducts = ref<Product[]>([])

const navItems = [
  { id: 'all', label: 'Alle Artikel', icon: Package },
  { id: 'Kühlschrank', label: 'Kühlschrank', icon: Package },
  { id: 'Gefrierfach', label: 'Gefrierfach', icon: Package },
  { id: 'Vorratsschrank', label: 'Vorrat', icon: Package },
  { id: 'expiring', label: 'Bald ablaufend', icon: Calendar }
]

const categories = ['Obst & Gemüse', 'Milchprodukte', 'Fleisch & Fisch', 'Getränke', 'Konserven', 'Backwaren', 'Snacks', 'Tiefkühl']

const filteredItems = computed(() => {
  let result = [...items.value]
  if (activeFilter.value === 'expiring') {
    const today = new Date()
    const soon = new Date()
    soon.setDate(today.getDate() + 3)
    result = result.filter(i => new Date(i.expiration_date) <= soon)
  } else if (activeFilter.value !== 'all') {
    result = result.filter(i => i.location === activeFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.product_name?.toLowerCase().includes(q))
  }
  if (categoryFilter.value) result = result.filter(i => i.category === categoryFilter.value)
  result.sort((a, b) => {
    if (sortBy.value === 'name') return (a.product_name || '').localeCompare(b.product_name || '')
    return new Date(a.expiration_date || 0).getTime() - new Date(b.expiration_date || 0).getTime()
  })
  return result
})

const loadData = async () => {
  isLoading.value = true
  try {
    const [inventoryData, productsData] = await Promise.all([
      inventoryService.getInventory(),
      productService.getProducts()
    ])
    items.value = inventoryData
    allProducts.value = productsData
  } catch (error: any) {
    if (error?.toString().includes('401')) router.push('/login')
  } finally {
    isLoading.value = false
  }
}

const getEmoji = (category?: string) => {
  const map: Record<string, string> = {
    'Milchprodukte': '🥛',
    'Obst & Gemüse': '🍎',
    'Fleisch & Fisch': '🥩',
    'Getränke': '🥤',
    'Konserven': '🥫',
    'Backwaren': '🍞',
    'Snacks': '🥨',
    'Tiefkühl': '🧊'
  }
  return map[category || ''] || '📦'
}

const getStatus = (date: string) => {
  const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { variant: 'danger' as const, label: 'Abgelaufen' }
  if (diff <= 3) return { variant: 'warning' as const, label: `Ablauf in ${diff}t` }
  return { variant: 'success' as const, label: `Noch ${diff} Tage` }
}

const changeQuantity = async (item: InventoryItem, delta: number) => {
  const newQty = item.quantity + delta
  if (newQty < 1) return deleteItem(item)
  try {
    await inventoryService.updateItem(item.inventory_id!, { quantity: newQty })
    item.quantity = newQty
  } catch (e) {}
}

const deleteItem = async (item: InventoryItem) => {
  if (!confirm(`"${item.product_name}" löschen?`)) return
  try {
    await inventoryService.deleteItem(item.inventory_id!)
    items.value = items.value.filter(i => i.inventory_id !== item.inventory_id)
  } catch (e) {}
}

onMounted(loadData)
</script>

<template>
  <div class="inventory-view">
    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">Inventar</h1>
        <p class="page-subtitle">Artikel werden automatisch über die Einkaufsliste hinzugefügt.</p>
      </div>
      <UiButton variant="secondary" @click="router.push('/shopping-list')">
        <ShoppingCart :size="20" />
        Zur Einkaufsliste
      </UiButton>
    </div>

    <div class="inventory-grid">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <UiCard :padding="'16px'">
          <div class="sidebar-nav">
            <button 
              v-for="item in navItems" 
              :key="item.id"
              class="nav-btn"
              :class="{ active: activeFilter === item.id }"
              @click="activeFilter = item.id"
            >
              <component :is="item.icon" :size="20" />
              {{ item.label }}
            </button>
          </div>
        </UiCard>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="toolbar">
          <UiInput 
            v-model="searchQuery" 
            placeholder="Suchen..." 
            :icon="Search"
            class="search-input"
          />
          <div class="view-controls">
            <select v-model="categoryFilter" class="modern-select">
              <option value="">Kategorie: Alle</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div class="toggle-group">
              <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><Grid :size="18" /></button>
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><List :size="18" /></button>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="loader">
          <div class="spinner"></div>
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-state">
          <Package :size="64" />
          <h3>Keine Artikel im Vorrat</h3>
          <p>Hake Artikel auf deiner Einkaufsliste ab, um sie hier zu sehen.</p>
          <UiButton class="mt-4" @click="router.push('/shopping-list')">Jetzt planen</UiButton>
        </div>

        <div v-else :class="['items-container', viewMode]">
          <UiCard 
            v-for="item in filteredItems" 
            :key="item.inventory_id"
            hoverable
            class="item-card"
            :padding="'20px'"
          >
            <div class="item-header">
              <div class="item-visual">{{ getEmoji(item.category) }}</div>
              <UiBadge :variant="getStatus(item.expiration_date).variant">
                {{ getStatus(item.expiration_date).label }}
              </UiBadge>
            </div>
            
            <div class="item-body">
              <h3 class="item-name">{{ item.product_name }}</h3>
              <p class="item-meta">{{ item.quantity }} {{ item.default_unit }} • {{ item.location }}</p>
            </div>

            <div class="item-actions">
              <div class="qty-actions">
                <button @click="changeQuantity(item, -1)"><Minus :size="16" /></button>
                <span>{{ item.quantity }}</span>
                <button @click="changeQuantity(item, 1)"><Plus :size="16" /></button>
              </div>
              <div class="tool-actions">
                <button class="delete-btn" @click="deleteItem(item)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </UiCard>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.inventory-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.page-title { font-size: 2.5rem; font-weight: 800; }
.page-subtitle { color: var(--text-muted); margin: 8px 0 0; }

.inventory-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 40px;
}

@media (max-width: 900px) {
  .inventory-grid { grid-template-columns: 1fr; }
}

.sidebar-nav { display: flex; flex-direction: column; gap: 8px; }

.nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  text-align: left;
}

.nav-btn:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-main); }
.nav-btn.active { background: var(--green); color: white; }

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

@media (max-width: 640px) {
  .toolbar { flex-direction: column; }
}

.search-input { max-width: 400px; }

.view-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.modern-select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 10px 16px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
}

.toggle-group {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

.toggle-group button {
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.toggle-group button.active { background: var(--green); color: white; }

.items-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.item-card { display: flex; flex-direction: column; gap: 20px; }

.item-header { display: flex; justify-content: space-between; align-items: flex-start; }
.item-visual { font-size: 2.5rem; background: rgba(255, 255, 255, 0.05); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }

.item-name { font-size: 1.25rem; font-weight: 700; margin: 0; }
.item-meta { color: var(--text-muted); font-size: 0.9rem; margin: 4px 0 0; }

.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--panel-border);
}

.qty-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 10px;
}

.qty-actions button { background: transparent; border: none; color: var(--text-main); cursor: pointer; padding: 4px; border-radius: 6px; }
.qty-actions button:hover { background: rgba(255, 255, 255, 0.1); }

.tool-actions { display: flex; gap: 8px; }
.tool-actions button { background: transparent; border: 1px solid var(--panel-border); color: var(--text-muted); padding: 8px; border-radius: 10px; cursor: pointer; }
.tool-actions .delete-btn:hover { border-color: #ef4444; color: #ef4444; }

.loader { display: flex; justify-content: center; padding: 100px; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--green); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 100px 20px; color: var(--text-muted); }
.empty-state h3 { color: var(--text-main); margin: 24px 0 8px; }
.mt-4 { margin-top: 1.5rem; }
</style>
