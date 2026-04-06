Vor allem hier sehr viel KI. Hauptsächlich wieder beim styling also css und beim template. wird natürlich nachgelernt
<template>
  <div class="inventory-layout">

    <aside class="inventory-sidebar">
      <div class="sidebar-section">
        <p class="section-title">Filter</p>
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeFilter === item.id }"
          @click="activeFilter = item.id"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </div>
    </aside>


    <div class="inventory-main">
      <header class="content-header">
        <div class="header-top">
          <h1 class="page-title">{{ activeNavLabel }}</h1>
          <div class="header-actions">
            <!-- Quick Add -->
            <div class="quick-add">
              <input
                v-model="quickAddText"
                @keyup.enter="handleQuickAdd"
                type="text"
                placeholder="Milch +2"
                class="input-quick"
              />
              <span class="quick-tip">Enter to add</span>
            </div>
            <button @click="showAddPanel = true" class="btn-add-main">
              <span class="plus-icon">+</span> Add Item
            </button>
          </div>
        </div>


        <div class="filter-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="Search items..." />
          </div>

          <div class="filters-group">
            <select v-model="categoryFilter" class="filter-select">
              <option value="">Kategorie: Alle</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <select v-model="expirationFilter" class="filter-select">
              <option value="all">Datum: Alle</option>
              <option value="critical">🚨 < 3 Tage</option>
              <option value="week">📅 Diese Woche</option>
            </select>

            <select v-model="sortBy" class="filter-select">
              <option value="name">Sort: Name</option>
              <option value="date">Sort: Datum</option>
              <option value="quantity">Sort: Menge</option>
            </select>

            <div class="view-toggle">
              <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">田</button>
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">≡</button>
            </div>
          </div>
        </div>
      </header>


      <section v-if="isLoading" class="state-container">
        <div class="spinner"></div>
        <p>Bestand wird geladen...</p>
      </section>

      <section v-else-if="filteredItems.length === 0" class="state-container">
        <div class="empty-state">
          <span class="empty-icon">📦</span>
          <h3>Keine Artikel gefunden</h3>
          <p>Füge einen Artikel hinzu oder ändere deine Filter.</p>
          <button @click="showAddPanel = true" class="btn-primary">Artikel hinzufügen</button>
        </div>
      </section>

      <section v-else :class="['content-view', viewMode]">

        <div v-for="item in filteredItems" :key="item.inventory_id" class="product-card">
          <div class="card-top">
            <div class="product-visual">
              <span class="product-emoji">{{ getEmoji(item.category) }}</span>
            </div>
            <div :class="['status-dot', getStatusClass(item.expiration_date)]"></div>
          </div>

          <div class="card-body">
            <h3 class="product-title">{{ item.product_name }}</h3>
            <div class="product-info-small">
              <span>Menge: {{ item.quantity }}{{ item.default_unit }}</span>
              <span class="separator">•</span>
              <span>Ort: {{ item.location }}</span>
            </div>
            <div class="expiration-label" :class="getStatusClass(item.expiration_date)">
              {{ getExpirationText(item.expiration_date) }}
            </div>
          </div>

          <!-- Hover Actions -->
          <div class="card-hover-actions">
            <button @click="changeQuantity(item, -1)" class="action-btn" title="Menge reduzieren">➖</button>
            <button @click="changeQuantity(item, 1)" class="action-btn" title="Menge hinzufügen">➕</button>
            <div class="action-spacer"></div>
            <button @click="editItem(item)" class="action-btn" title="Edit">✏️</button>
            <button @click="deleteItem(item)" class="action-btn delete" title="Delete">❌</button>
          </div>
        </div>
      </section>
    </div>

    <!-- ➕ Add Item Flow (Slide-in Panel) -->
    <transition name="panel-slide">
      <div v-if="showAddPanel" class="side-panel-overlay" @click.self="closePanel">
        <div class="side-panel">
          <header class="panel-header">
            <h2>{{ editingItem ? '✏️ Edit Item' : '✨ New Item' }}</h2>
            <button @click="closePanel" class="btn-close">✕</button>
          </header>

          <form @submit.prevent="saveItem" class="panel-form">
            <div class="form-group">
              <label>Produkt Name</label>
              <input
                v-model="formData.product_name"
                type="text"
                placeholder="z.B. Milch, Äpfel..."
                required
                :disabled="!!editingItem"
                class="input-modern"
              />
            </div>

            <div v-if="!editingItem" class="form-row">
              <div class="form-group flex-1">
                <label>Einheit</label>
                <input
                  v-model="formData.default_unit"
                  type="text"
                  placeholder="z.B. Liter, kg, Stk"
                  required
                  class="input-modern"
                />
              </div>
              <div class="form-group flex-1">
                <label>Kategorie</label>
                <select v-model="formData.category" class="input-modern">
                  <option value="">Keine</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Menge</label>
                <div class="quantity-stepper">
                  <button type="button" @click="formData.quantity > 1 && formData.quantity--">−</button>
                  <input type="number" v-model.number="formData.quantity" min="1" required />
                  <button type="button" @click="formData.quantity++">+</button>
                </div>
              </div>

              <div class="form-group flex-1">
                <label>Ort</label>
                <select v-model="formData.location" class="input-modern">
                  <option value="Kühlschrank">❄️ Kühlschrank</option>
                  <option value="Gefrierfach">🧊 Gefrierfach</option>
                  <option value="Vorratsschrank">🥫 Vorratsschrank</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Ablaufdatum</label>
              <input type="date" v-model="formData.expiration_date" required class="input-modern" />
            </div>

            <div class="panel-actions">
              <button type="button" @click="closePanel" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { inventoryService, type InventoryItem } from '@/services/inventory'
import { productService, type Product } from '@/services/product'

const router = useRouter()

// UI State
const activeFilter = ref('all')
const viewMode = ref('grid')
const searchQuery = ref('')
const categoryFilter = ref('')
const expirationFilter = ref('all')
const sortBy = ref('date')
const isLoading = ref(true)
const isSaving = ref(false)
const showAddPanel = ref(false)
const quickAddText = ref('')

// Data State
const items = ref<InventoryItem[]>([])
const allProducts = ref<Product[]>([])
const editingItem = ref<InventoryItem | null>(null)

const formData = ref({
  product_name: '',
  default_unit: '',
  category: '',
  quantity: 1,
  location: 'Kühlschrank',
  expiration_date: new Date().toISOString().split('T')[0]
})

const navItems = [
  { id: 'all', label: 'All Items', icon: '🥦' },
  { id: 'Kühlschrank', label: 'Kühlschrank', icon: '❄️' },
  { id: 'Gefrierfach', label: 'Gefrierfach', icon: '🧊' },
  { id: 'Vorratsschrank', label: 'Vorratsschrank', icon: '🥫' },
  { id: 'expiring', label: 'Bald ablaufend', icon: '⚠️' }
]

const categories = ['Obst & Gemüse', 'Milchprodukte', 'Fleisch & Fisch', 'Getränke', 'Konserven', 'Backwaren', 'Snacks', 'Tiefkühl']

// Computed
const activeNavLabel = computed(() => {
  return navItems.find(n => n.id === activeFilter.value)?.label || 'Bestand'
})

const filteredItems = computed(() => {
  let result = [...items.value]

  // Sidebar Filter
  if (activeFilter.value === 'expiring') {
    const today = new Date()
    const soon = new Date()
    soon.setDate(today.getDate() + 3)
    result = result.filter(i => new Date(i.expiration_date) <= soon)
  } else if (activeFilter.value !== 'all') {
    result = result.filter(i => i.location === activeFilter.value)
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.product_name?.toLowerCase().includes(q))
  }

  // Category Filter Bar
  if (categoryFilter.value) {
    result = result.filter(i => i.category === categoryFilter.value)
  }

  // Expiration Filter Bar
  if (expirationFilter.value === 'critical') {
    const soon = new Date()
    soon.setDate(new Date().getDate() + 3)
    result = result.filter(i => new Date(i.expiration_date) <= soon)
  } else if (expirationFilter.value === 'week') {
    const soon = new Date()
    soon.setDate(new Date().getDate() + 7)
    result = result.filter(i => i.expiration_date && new Date(i.expiration_date) <= soon)
  }

  // Sorting
  result.sort((a, b) => {
    if (sortBy.value === 'name') return (a.product_name || '').localeCompare(b.product_name || '')
    if (sortBy.value === 'quantity') return b.quantity - a.quantity
    return new Date(a.expiration_date || 0).getTime() - new Date(b.expiration_date || 0).getTime()
  })

  return result
})

// Methods
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
    if (error?.toString().includes('401')) {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const handleQuickAdd = async () => {
  const parts = quickAddText.value.split(' ')
  if (parts.length >= 1) {
    const name = parts[0]
    if (!name) return

    const qtyPart = parts.find(p => p.startsWith('+'))
    const qty = qtyPart ? parseInt(qtyPart.substring(1)) : 1

    let product = allProducts.value.find(p => p.name.toLowerCase() === name.toLowerCase())

    try {
      if (!product) {
        const resp = await productService.createProduct(name, 'Stk', 'Allgemein')
        product = { product_id: resp.product_id, name, default_unit: 'Stk', category: 'Allgemein' }
      }

      if (product && product.product_id) {
        await inventoryService.addItem({
          product_id: product.product_id,
          quantity: qty,
          location: 'Kühlschrank',
          expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        await loadData()
        quickAddText.value = ''
      }
    } catch (e) {
      alert('Quick Add failed')
    }
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

const getStatusClass = (date: string) => {
  if (!date) return 'ok'
  const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'critical'
  if (diff <= 3) return 'warning'
  return 'ok'
}

const getExpirationText = (date: string) => {
  if (!date) return 'Kein Datum'
  const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `Abgelaufen vor ${Math.abs(diff)} Tagen`
  if (diff === 0) return 'Läuft heute ab'
  if (diff === 1) return 'Läuft morgen ab'
  return `läuft ab in ${diff} Tagen`
}

const closePanel = () => {
  showAddPanel.value = false
  editingItem.value = null
  formData.value = {
    product_name: '',
    default_unit: '',
    category: '',
    quantity: 1,
    location: 'Kühlschrank',
    expiration_date: new Date().toISOString().split('T')[0]
  }
}

const editItem = (item: InventoryItem) => {
  editingItem.value = item
  formData.value = {
    product_name: item.product_name || '',
    default_unit: item.default_unit || '',
    category: item.category || '',
    quantity: item.quantity,
    location: item.location || 'Kühlschrank',
    expiration_date: item.expiration_date
  }
  showAddPanel.value = true
}

const saveItem = async () => {
  isSaving.value = true
  try {
    let productId = editingItem.value?.product_id

    if (!editingItem.value) {
      // Find or create product
      let product = allProducts.value.find(p =>
        p.name.toLowerCase() === formData.value.product_name.toLowerCase() &&
        p.default_unit.toLowerCase() === formData.value.default_unit.toLowerCase()
      )

      if (!product) {
        const resp = await productService.createProduct(
          formData.value.product_name,
          formData.value.default_unit,
          formData.value.category
        )
        productId = resp.product_id
      } else {
        productId = product.product_id
      }
    }

    const payload = {
      product_id: productId,
      quantity: formData.value.quantity,
      location: formData.value.location,
      expiration_date: formData.value.expiration_date
    }

    if (editingItem.value) {
      await inventoryService.updateItem(editingItem.value.inventory_id!, payload)
    } else {
      await inventoryService.addItem(payload)
    }

    await loadData()
    closePanel()
  } catch (error: any) {
    console.error('Error saving item:', error)
    alert('Fehler beim Speichern: ' + (error.message || 'Unbekannter Fehler'))
  } finally {
    isSaving.value = false
  }
}

const changeQuantity = async (item: InventoryItem, delta: number) => {
  const newQty = item.quantity + delta
  if (newQty < 1) return deleteItem(item)
  try {
    await inventoryService.updateItem(item.inventory_id!, { quantity: newQty })
    item.quantity = newQty
  } catch (error) {
    console.error('Error updating quantity')
  }
}

const deleteItem = async (item: InventoryItem) => {
  if (!confirm(`Möchtest du "${item.product_name}" wirklich löschen?`)) return
  try {
    await inventoryService.deleteItem(item.inventory_id!)
    items.value = items.value.filter(i => i.inventory_id !== item.inventory_id)
  } catch (error) {
    alert('Fehler beim Löschen')
  }
}

onMounted(loadData)
</script>

<style scoped>
.inventory-layout {
  display: flex;
  gap: 30px;
  min-height: calc(100vh - 150px);
}

/* Lokale Sidebar */
.inventory-sidebar {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #86868b;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.8;
}

.nav-item:hover {
  background-color: rgba(0,0,0,0.05);
  opacity: 1;
}

.nav-item.active {
  background-color: rgba(45, 90, 39, 0.1);
  color: #2d5a27;
  opacity: 1;
}

[data-theme='dark'] .nav-item.active {
  background-color: rgba(168, 224, 99, 0.1);
  color: #a8e063;
}

.nav-icon { font-size: 1.1rem; }

/* Main Content Area */
.inventory-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-add {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.input-quick {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 8px;
  font-size: 14px;
  width: 150px;
  outline: none;
  transition: width 0.3s;
}

.input-quick:focus { width: 220px; border-color: #0071e3; background: var(--bg-color); }
.quick-tip { font-size: 10px; color: #86868b; margin-top: 4px; }

.btn-add-main {
  background: #0071e3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
}

.btn-add-main:hover { background: #0077ed; transform: translateY(-1px); }

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--input-bg);
  padding: 8px 16px;
  border-radius: 10px;
  width: 320px;
}

.search-box input { border: none; background: none; outline: none; width: 100%; font-size: 15px; color: var(--text-color); }

.filters-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.view-toggle {
  display: flex;
  background: var(--input-bg);
  padding: 3px;
  border-radius: 8px;
}

.view-toggle button {
  border: none;
  background: none;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: #86868b;
}

.view-toggle button.active {
  background: var(--bg-color);
  color: var(--text-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Card Grid */
.content-view.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 28px;
}

.product-card {
  background: var(--navbar-bg);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--border-color);
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.product-visual {
  width: 52px;
  height: 52px;
  background: var(--bg-color);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
}

.status-dot.ok { background: #34c759; }
.status-dot.warning { background: #ff9500; }
.status-dot.critical { background: #ff3b30; }

.product-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--text-color);
}

.product-info-small {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 16px;
  display: flex;
  align-items: center; gap: 6px;
}

.separator { color: #d2d2d7; }

.expiration-label {
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  display: inline-block;
  align-self: flex-start;
  margin-top: auto;
}

.expiration-label.ok { color: #1a8a34; background: rgba(52, 199, 89, 0.1); }
.expiration-label.warning { color: #b25e00; background: rgba(255, 149, 0, 0.1); }
.expiration-label.critical { color: #c91b10; background: rgba(255, 59, 48, 0.1); }

/* Card Hover Actions */
.card-hover-actions {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--navbar-bg);
  opacity: 0.96;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.25s;
  z-index: 10;
}

.product-card:hover .card-hover-actions { opacity: 1; }

.action-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover { background: var(--input-bg); transform: scale(1.08); }
.action-btn.delete:hover { background: rgba(255, 59, 48, 0.1); border-color: #ff3b30; }

.action-spacer { width: 1px; height: 24px; background: var(--border-color); margin: 0 4px; }

/* Side Panel */
.side-panel-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.side-panel {
  width: 440px;
  background: var(--bg-color);
  color: var(--text-color);
  height: 100%;
  padding: 40px;
  box-shadow: -20px 0 50px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.btn-close {
  background: var(--input-bg);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
}

.panel-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.form-group label { font-size: 14px; font-weight: 600; }
.form-row { display: flex; gap: 16px; }
.flex-1 { flex: 1; min-width: 0; }

.input-modern {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
}

.quantity-stepper {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.quantity-stepper button {
  width: 40px;
  border: none;
  background: var(--input-bg);
  color: var(--text-color);
  cursor: pointer;
  font-size: 18px;
}

.quantity-stepper input {
  flex: 1;
  border: none;
  text-align: center;
  background: var(--bg-color);
  color: var(--text-color);
}

.panel-actions {
  margin-top: 30px;
  display: flex;
  gap: 12px;
}

.btn-save {
  flex: 2;
  background: #0071e3;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  background: var(--input-bg);
  color: var(--text-color);
  border: none;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-layout { flex-direction: column; }
  .inventory-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding-bottom: 10px; }
  .sidebar-section { flex-direction: row; }
  .section-title { display: none; }
  .filter-bar { flex-direction: column; gap: 16px; align-items: stretch; }
  .search-box { width: 100%; }
  .side-panel { width: 100%; }
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* Transitions */
.panel-slide-enter-active, .panel-slide-leave-active { transition: transform 0.3s ease-out; }
.panel-slide-enter-from, .panel-slide-leave-to { transform: translateX(100%); }

/* CSS Variables for this view */
.inventory-layout {
  --border-color: #e0e6df;
  --input-bg: #ffffff;
}

[data-theme='dark'] .inventory-layout {
  --border-color: #3d3d3d;
  --input-bg: #2a2a2a;
}
</style>
