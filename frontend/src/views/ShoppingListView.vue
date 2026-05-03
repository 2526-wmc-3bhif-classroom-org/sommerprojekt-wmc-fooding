<script setup lang="ts">
import { ref, onMounted, computed, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { shoppingListService, type ShoppingListItem } from '@/services/shoppingLists'
import { inventoryService } from '@/services/inventory'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Minus, 
  ShoppingCart,
  CheckCircle2,
  Circle,
  Package,
  ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const navbarControl = inject<{ setNavbarRecede: (state: boolean) => void }>('navbarControl')

// UI State
const activeFilter = ref<'all' | 'open' | 'done'>('all')
const searchQuery = ref('')
const categoryFilter = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const showAddPanel = ref(false)

const items = ref<ShoppingListItem[]>([])
const editingItem = ref<ShoppingListItem | null>(null)

const formData = ref({
  name: '',
  quantity: 1,
  unit: 'Stk',
  category: ''
})

const categories = ['Obst & Gemüse', 'Milchprodukte', 'Fleisch & Fisch', 'Getränke', 'Konserven', 'Backwaren', 'Snacks', 'Tiefkühl']

const loadData = async () => {
  isLoading.value = true
  try {
    items.value = await shoppingListService.getItems()
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

const toggleCheck = async (item: ShoppingListItem) => {
  const newChecked = !item.checked
  const oldChecked = item.checked
  item.checked = newChecked ? 1 : 0
  
  try {
    await shoppingListService.setChecked(item.shopping_item_id!, newChecked)
    
    // AUTO-TRANSFER TO INVENTORY
    if (newChecked) {
      // Find the item in our list to get product_id
      await inventoryService.addItem({
        product_id: item.product_id!,
        quantity: item.quantity,
        location: 'Kühlschrank',
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!
      })
      console.log(`Automated transfer: ${item.product_name} added to inventory.`)
    }
  } catch (error) {
    item.checked = oldChecked
    alert('Fehler beim Aktualisieren.')
  }
}

const openAddPanel = () => {
  editingItem.value = null
  formData.value = { name: '', quantity: 1, unit: 'Stk', category: '' }
  showAddPanel.value = true
  navbarControl?.setNavbarRecede(true)
}

const closePanel = () => {
  showAddPanel.value = false
  navbarControl?.setNavbarRecede(false)
}

const saveItem = async () => {
  isSaving.value = true
  try {
    if (editingItem.value) {
      await shoppingListService.updateQuantity(editingItem.value.shopping_item_id!, formData.value.quantity)
    } else {
      const productId = await shoppingListService.findOrCreateProduct(
        formData.value.name,
        formData.value.unit,
        formData.value.category
      )
      await shoppingListService.addItem({ product_id: productId, quantity: formData.value.quantity })
    }
    await loadData()
    closePanel()
  } catch (e) {
    alert('Fehler beim Speichern')
  } finally {
    isSaving.value = false
  }
}

const deleteItem = async (item: ShoppingListItem) => {
  if (!confirm(`"${item.product_name}" löschen?`)) return
  try {
    await shoppingListService.deleteItem(item.shopping_item_id!)
    items.value = items.value.filter(i => i.shopping_item_id !== item.shopping_item_id)
  } catch (e) {}
}

const filteredItems = computed(() => {
  let result = items.value
  if (activeFilter.value === 'open') result = result.filter(i => !i.checked)
  else if (activeFilter.value === 'done') result = result.filter(i => !!i.checked)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.product_name?.toLowerCase().includes(q))
  }
  return result
})

onMounted(loadData)
</script>

<template>
  <div class="shopping-view">
    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">Einkaufsliste</h1>
        <p class="page-subtitle">Was erledigt wird, landet automatisch im Vorrat.</p>
      </div>
      <UiButton @click="openAddPanel">
        <Plus :size="20" />
        Hinzufügen
      </UiButton>
    </div>

    <div class="list-controls">
      <div class="filter-tabs">
        <button 
          v-for="f in (['all', 'open', 'done'] as const)" 
          :key="f"
          class="tab-btn"
          :class="{ active: activeFilter === f }"
          @click="activeFilter = f"
        >
          {{ f === 'all' ? 'Alle' : f === 'open' ? 'Offen' : 'Erledigt' }}
        </button>
      </div>
      <UiInput v-model="searchQuery" placeholder="Suchen..." :icon="Search" class="search-input" />
    </div>

    <div v-if="isLoading" class="loader">
      <div class="spinner"></div>
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <ShoppingCart :size="64" />
      <h3>Deine Liste ist leer</h3>
      <p>Plane deine Einkäufe und automatisiere dein Inventar.</p>
    </div>

    <div v-else class="items-list">
      <UiCard 
        v-for="item in filteredItems" 
        :key="item.shopping_item_id"
        class="shopping-card"
        :class="{ checked: !!item.checked }"
        :padding="'16px 24px'"
      >
        <div class="card-content">
          <button class="check-toggle" @click="toggleCheck(item)">
            <CheckCircle2 v-if="item.checked" class="icon-checked" />
            <Circle v-else class="icon-unchecked" />
          </button>
          
          <div class="item-visual">{{ getEmoji(item.category) }}</div>
          
          <div class="item-details">
            <h3 class="item-name">{{ item.product_name }}</h3>
            <p class="item-meta">{{ item.quantity }} {{ item.default_unit }} • {{ item.category || 'Allgemein' }}</p>
          </div>

          <div class="actions">
            <UiBadge v-if="item.checked" variant="success">Erledigt & Im Inventar</UiBadge>
            <button class="delete-btn" @click="deleteItem(item)">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Add Panel -->
    <transition name="slide">
      <div v-if="showAddPanel" class="panel-overlay" @click.self="closePanel">
        <div class="panel">
          <UiCard :padding="'40px'" class="panel-card">
            <header class="panel-header">
              <h2>Neuer Artikel</h2>
              <button @click="closePanel" class="close-btn">✕</button>
            </header>

            <form @submit.prevent="saveItem" class="panel-form">
              <UiInput v-model="formData.name" label="Produkt Name" placeholder="z.B. Bio Eier" />
              <div class="form-row">
                <UiInput v-model.number="formData.quantity" label="Menge" type="number" class="flex-1" />
                <UiInput v-model="formData.unit" label="Einheit" placeholder="Stk" class="flex-1" />
              </div>
              <div class="form-group">
                <label class="ui-label">Kategorie</label>
                <select v-model="formData.category" class="modern-select full">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              
              <div class="panel-actions">
                <UiButton variant="secondary" @click="closePanel" type="button">Abbrechen</UiButton>
                <UiButton :loading="isSaving" type="submit">Hinzufügen</UiButton>
              </div>
            </form>
          </UiCard>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.shopping-view {
  max-width: 1000px;
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
.page-subtitle { color: var(--text-muted); margin-top: 8px; }

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 16px;
  border: 1px solid var(--panel-border);
}

.tab-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 8px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active { background: var(--green); color: white; }

.search-input { max-width: 300px; }

.items-list { display: flex; flex-direction: column; gap: 12px; }

.shopping-card { transition: all 0.3s ease; }
.shopping-card.checked { opacity: 0.6; }

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.check-toggle {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.check-toggle:hover { color: var(--green); }
.icon-checked { color: var(--green); }

.item-visual { font-size: 1.5rem; }

.item-details { flex: 1; }
.item-name { font-size: 1.1rem; font-weight: 700; margin: 0; }
.item-meta { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }

.actions { display: flex; align-items: center; gap: 16px; }
.delete-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
.delete-btn:hover { color: #ef4444; }

.panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); z-index: 2000; display: flex; justify-content: flex-end; }
.panel { width: 100%; max-width: 500px; height: 100%; }
.panel-card { height: 100%; border-radius: 0; border-left: 1px solid var(--panel-border); }

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.close-btn { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

.panel-form { display: flex; flex-direction: column; gap: 24px; }
.form-row { display: flex; gap: 20px; }
.flex-1 { flex: 1; }

.modern-select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  width: 100%;
}

.panel-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; margin-top: 20px; }

.ui-label { font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; display: block; }

.loader { display: flex; justify-content: center; padding: 100px; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--green); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 100px 20px; color: var(--text-muted); }
.empty-state h3 { color: var(--text-main); margin: 24px 0 8px; }

.slide-enter-active, .slide-leave-active { transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

@media (max-width: 640px) {
  .list-controls { flex-direction: column; align-items: stretch; }
  .search-input { max-width: 100%; }
  .card-content { gap: 12px; }
  .item-visual { display: none; }
}
</style>
