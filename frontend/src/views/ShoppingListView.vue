<template>
  <div class="shopping-layout">

    <aside class="shopping-sidebar">
      <div class="sidebar-section">
        <p class="sidebar-section-title">Filter</p>
        <button
          v-for="nav in navItems"
          :key="nav.id"
          class="nav-item"
          :class="{ active: activeFilter === nav.id }"
          @click="activeFilter = nav.id"
        >
          <span class="nav-icon">{{ nav.icon }}</span>
          <span class="nav-label">{{ nav.label }}</span>
          <span class="nav-badge">{{ nav.count }}</span>
        </button>
      </div>

      <div class="sidebar-section">
        <p class="sidebar-section-title">Aktionen</p>
        <button class="sidebar-action-btn" @click="checkAll" :disabled="uncheckedItems.length === 0">
          <span>✅</span> Alle abhaken
        </button>
        <button class="sidebar-action-btn danger" @click="clearChecked" :disabled="checkedItems.length === 0">
          <span>🗑️</span> Erledigte löschen
        </button>
      </div>
    </aside>

    <div class="shopping-main">
      <header class="content-header">
        <div class="header-top">
          <div class="title-area">
            <h1 class="page-title">{{ activeNavLabel }}</h1>
            <p v-if="!isLoading" class="page-subtitle">
              <span class="count-badge open">{{ uncheckedItems.length }} offen</span>
              <span class="count-badge done">{{ checkedItems.length }} erledigt</span>
            </p>
          </div>

          <div class="header-actions">
            <div class="quick-add">
              <input
                v-model="quickAddText"
                @keyup.enter="handleQuickAdd"
                type="text"
                placeholder="Milch 2 ↵"
                class="input-quick"
              />
              <span class="quick-tip">Enter to add</span>
            </div>
            <button @click="openAddPanel" class="btn-add-main">
              <span class="plus-icon">+</span> Artikel
            </button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="search-box">
            <span>🔍</span>
            <input v-model="searchQuery" type="text" placeholder="Artikel suchen..." />
            <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
          </div>
          <div class="filters-group">
            <select v-model="categoryFilter" class="filter-select">
              <option value="">Kategorie: Alle</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select v-model="sortBy" class="filter-select">
              <option value="name">Sort: Name</option>
              <option value="category">Sort: Kategorie</option>
              <option value="quantity">Sort: Menge</option>
            </select>
          </div>
        </div>
      </header>

      <section v-if="isLoading" class="state-container">
        <div class="spinner"></div>
        <p>Einkaufsliste wird geladen...</p>
      </section>

      <section v-else-if="filteredUnchecked.length === 0 && filteredChecked.length === 0" class="state-container">
        <div class="empty-state">
          <span class="empty-icon">🛒</span>
          <h3>Deine Liste ist leer</h3>
          <p>Füge Artikel hinzu, die du einkaufen möchtest.</p>
          <button @click="openAddPanel" class="btn-primary">Artikel hinzufügen</button>
        </div>
      </section>

      <div v-else class="list-content">
        <section v-if="filteredUnchecked.length > 0" class="list-section">
          <div class="list-section-header">
            <span class="list-section-label">🛒 Zu kaufen ({{ filteredUnchecked.length }})</span>
          </div>
          <TransitionGroup name="list-item" tag="div" class="items-list">
            <div
              v-for="item in filteredUnchecked"
              :key="item.shopping_item_id"
              class="shopping-row"
            >
              <button class="check-btn" @click="toggleCheck(item)">
                <span class="check-inner"></span>
              </button>
              <span class="row-emoji">{{ getCategoryEmoji(item.category) }}</span>
              <div class="row-info">
                <span class="row-name">{{ item.product_name }}</span>
                <span class="row-meta">
                  {{ item.quantity }} {{ item.default_unit }}
                  <span v-if="item.category" class="row-category">· {{ item.category }}</span>
                </span>
              </div>
              <div class="qty-controls">
                <button @click="changeQty(item, -1)" class="qty-btn">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button @click="changeQty(item, 1)" class="qty-btn">+</button>
              </div>
              <div class="row-actions">
                <button @click="editItem(item)" class="action-btn">✏️</button>
                <button @click="deleteItem(item)" class="action-btn delete">🗑️</button>
              </div>
            </div>
          </TransitionGroup>
        </section>

        <section v-if="filteredChecked.length > 0" class="list-section">
          <button class="list-section-header toggle-btn" @click="showChecked = !showChecked">
            <span class="list-section-label">✅ Erledigt ({{ filteredChecked.length }})</span>
            <span class="toggle-icon" :class="{ rotated: showChecked }">›</span>
          </button>
          <TransitionGroup name="list-item" tag="div" class="items-list" v-show="showChecked">
            <div
              v-for="item in filteredChecked"
              :key="item.shopping_item_id"
              class="shopping-row checked-row"
            >
              <button class="check-btn checked" @click="toggleCheck(item)">
                <span class="check-inner">✓</span>
              </button>
              <span class="row-emoji faded">{{ getCategoryEmoji(item.category) }}</span>
              <div class="row-info">
                <span class="row-name struck">{{ item.product_name }}</span>
                <span class="row-meta">{{ item.quantity }} {{ item.default_unit }}</span>
              </div>
              <div class="row-actions">
                <button @click="deleteItem(item)" class="action-btn delete">🗑️</button>
              </div>
            </div>
          </TransitionGroup>
        </section>
      </div>
    </div>

    <Transition name="panel-slide">
      <div v-if="showAddPanel" class="side-panel-overlay" @click.self="closePanel">
        <div class="side-panel">
          <header class="panel-header">
            <h2>{{ editingItem ? '✏️ Artikel bearbeiten' : '✨ Neuer Artikel' }}</h2>
            <button @click="closePanel" class="btn-close">✕</button>
          </header>

          <form @submit.prevent="saveItem" class="panel-form">
            <div class="form-group">
              <label>Produktname <span class="required">*</span></label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="z.B. Milch, Äpfel..."
                required
                :disabled="!!editingItem"
                class="input-modern"
                ref="nameInput"
              />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Menge <span class="required">*</span></label>
                <div class="quantity-stepper">
                  <button type="button" @click="formData.quantity > 1 && formData.quantity--">−</button>
                  <input type="number" v-model.number="formData.quantity" min="1" required />
                  <button type="button" @click="formData.quantity++">+</button>
                </div>
              </div>

              <div class="form-group flex-1">
                <label>Einheit</label>
                <input
                  v-model="formData.unit"
                  type="text"
                  placeholder="z.B. Stk, kg, L"
                  class="input-modern"
                  :disabled="!!editingItem"
                  list="unit-suggestions"
                />
                <datalist id="unit-suggestions">
                  <option v-for="u in unitSuggestions" :key="u" :value="u" />
                </datalist>
              </div>
            </div>

            <div v-if="!editingItem" class="form-group">
              <label>Kategorie</label>
              <select v-model="formData.category" class="input-modern">
                <option value="">Keine Kategorie</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ getCategoryEmoji(cat) }} {{ cat }}
                </option>
              </select>
            </div>

            <p v-if="saveError" class="form-error">⚠️ {{ saveError }}</p>

            <div class="panel-actions">
              <button type="button" @click="closePanel" class="btn-cancel">Abbrechen</button>
              <button type="submit" class="btn-save" :disabled="isSaving">
                <span v-if="isSaving" class="saving-spinner"></span>
                {{ isSaving ? 'Speichern...' : (editingItem ? 'Aktualisieren' : 'Hinzufügen') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { shoppingListService, type ShoppingListItem } from '@/services/shoppingLists'

const router = useRouter()

const activeFilter = ref<'all' | 'open' | 'done'>('all')
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref<'name' | 'category' | 'quantity'>('name')
const showChecked = ref(true)
const showAddPanel = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const saveError = ref('')
const quickAddText = ref('')

const items = ref<ShoppingListItem[]>([])
const editingItem = ref<ShoppingListItem | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

const formData = ref({
  name: '',
  quantity: 1,
  unit: 'Stk',
  category: ''
})

// Mithilfe von KI
const categories = [
  'Obst & Gem\u00fcse',
  'Milchprodukte',
  'Fleisch & Fisch',
  'Backwaren',
  'Getr\u00e4nke',
  'Tiefk\u00fchl',
  'Konserven',
  'Snacks'
]

const unitSuggestions = ['Stk', 'kg', 'g', 'L', 'ml', 'Packung', 'Flasche', 'Dose', 'Bund']

// Mithilfe von KI
const categoryEmojiMap: Record<string, string> = {
  'Obst & Gem\u00fcse': '🍎',
  'Milchprodukte': '🥛',
  'Fleisch & Fisch': '🥩',
  'Backwaren': '🍞',
  'Getr\u00e4nke': '🥤',
  'Tiefk\u00fchl': '🧊',
  'Konserven': '🥫',
  'Snacks': '🥨'
}

const uncheckedItems = computed(() => items.value.filter((i: ShoppingListItem) => !i.checked))
const checkedItems = computed(() => items.value.filter((i: ShoppingListItem) => !!i.checked))

const navItems = computed(() => [
  { id: 'all' as const, label: 'Alle Artikel', icon: '🛒', count: items.value.length },
  { id: 'open' as const, label: 'Noch zu kaufen', icon: '📋', count: uncheckedItems.value.length },
  { id: 'done' as const, label: 'Erledigt', icon: '✅', count: checkedItems.value.length }
])

const activeNavLabel = computed(() =>
  navItems.value.find(n => n.id === activeFilter.value)?.label ?? 'Einkaufsliste'
)

const processItems = (source: ShoppingListItem[]) => {
  let result = [...source]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.product_name?.toLowerCase().includes(q))
  }
  if (categoryFilter.value) {
    result = result.filter(i => i.category === categoryFilter.value)
  }
  result.sort((a, b) => {
    if (sortBy.value === 'name') return (a.product_name || '').localeCompare(b.product_name || '')
    if (sortBy.value === 'quantity') return b.quantity - a.quantity
    if (sortBy.value === 'category') return (a.category || '').localeCompare(b.category || '')
    return 0
  })
  return result
}

const filteredUnchecked = computed(() => {
  if (activeFilter.value === 'done') return []
  return processItems(uncheckedItems.value)
})

const filteredChecked = computed(() => {
  if (activeFilter.value === 'open') return []
  return processItems(checkedItems.value)
})

const getCategoryEmoji = (category?: string): string =>
  categoryEmojiMap[category || ''] || '📦'

const resetForm = () => {
  formData.value = { name: '', quantity: 1, unit: 'Stk', category: '' }
  saveError.value = ''
  editingItem.value = null
}

const openAddPanel = async () => {
  resetForm()
  showAddPanel.value = true
  await nextTick()
  nameInput.value?.focus()
}

const closePanel = () => {
  showAddPanel.value = false
  resetForm()
}

const loadData = async () => {
  isLoading.value = true
  try {
    items.value = await shoppingListService.getItems()
  } catch (error: unknown) {
    if (error?.toString().includes('401')) {
      router.push('/login')
    } else {
      console.error('Fehler beim Laden:', error)
    }
  } finally {
    isLoading.value = false
  }
}

const saveItem = async () => {
  if (!formData.value.name.trim()) {
    saveError.value = 'Bitte gib einen Produktnamen ein.'
    return
  }
  isSaving.value = true
  saveError.value = ''
  try {
    if (editingItem.value && editingItem.value.shopping_item_id != null) {
      await shoppingListService.updateQuantity(editingItem.value.shopping_item_id, formData.value.quantity)
    } else {
      const productId = await shoppingListService.findOrCreateProduct(
        formData.value.name.trim(),
        formData.value.unit.trim() || 'Stk',
        formData.value.category
      )
      await shoppingListService.addItem({ product_id: productId, quantity: formData.value.quantity })
    }
    await loadData()
    closePanel()
  } catch (error: unknown) {
    saveError.value = (error instanceof Error ? error.message : 'Unbekannter Fehler beim Speichern.')
  } finally {
    isSaving.value = false
  }
}

const editItem = async (item: ShoppingListItem) => {
  editingItem.value = item
  formData.value = {
    name: item.product_name || '',
    quantity: item.quantity,
    unit: item.default_unit || 'Stk',
    category: item.category || ''
  }
  showAddPanel.value = true
  await nextTick()
  nameInput.value?.focus()
}

const deleteItem = async (item: ShoppingListItem) => {
  if (!confirm(`"${item.product_name}" wirklich löschen?`)) return
  try {
    await shoppingListService.deleteItem(item.shopping_item_id!)
    items.value = items.value.filter((i: ShoppingListItem) => i.shopping_item_id !== item.shopping_item_id)
  } catch (error) {
    console.error(error)
    alert('Fehler beim Löschen.')
  }
}


// Mithilfe von KI
const toggleCheck = async (item: ShoppingListItem) => {
  const newChecked = !item.checked
  item.checked = newChecked ? 1 : 0
  try {
    await shoppingListService.setChecked(item.shopping_item_id!, newChecked)
  } catch (error) {
    console.error(error)
    item.checked = newChecked ? 0 : 1
  }
}

const changeQty = async (item: ShoppingListItem, delta: number) => {
  const newQty = item.quantity + delta
  if (newQty < 1) {
    deleteItem(item)
    return
  }
  const oldQty = item.quantity
  item.quantity = newQty
  try {
    await shoppingListService.updateQuantity(item.shopping_item_id!, newQty)
  } catch (error) {
    console.error(error)
    item.quantity = oldQty
  }
}

const checkAll = async () => {
  const toCheck = items.value.filter((i: ShoppingListItem) => !i.checked)
  if (!toCheck.length) return
  toCheck.forEach((i: ShoppingListItem) => (i.checked = 1))
  try {
    await Promise.all(toCheck.map((i: ShoppingListItem) => shoppingListService.setChecked(i.shopping_item_id!, true)))
  } catch (error) {
    console.error(error)
    toCheck.forEach((i: ShoppingListItem) => (i.checked = 0))
  }
}

const clearChecked = async () => {
  const done = items.value.filter((i: ShoppingListItem) => !!i.checked)
  if (!done.length) return
  if (!confirm(`${done.length} erledigte Artikel endgültig löschen?`)) return
  try {
    await Promise.all(done.map((i: ShoppingListItem) => shoppingListService.deleteItem(i.shopping_item_id!)))
    items.value = items.value.filter((i: ShoppingListItem) => !i.checked)
  } catch (error) {
    console.error(error)
    alert('Fehler beim Löschen. Bitte Seite neu laden.')
  }
}

// Mithilfe von KI
const handleQuickAdd = async () => {
  const raw = quickAddText.value.trim()
  if (!raw) return
  const parts = raw.split(/\s+/)
  const name = parts[0]
  if (!name) return

  let quantity = 1
  if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
    quantity = parseInt((parts[1] as string))
  }
  try {
    const productId = await shoppingListService.findOrCreateProduct(name, 'Stk', '')
    await shoppingListService.addItem({ product_id: productId, quantity })
    await loadData()
    quickAddText.value = ''
  } catch (error) {
    console.error(error)
    alert('Quick Add fehlgeschlagen.')
  }
}

onMounted(loadData)
</script>

<style scoped>

/*
Großteil des Stylings mithilfe von KI
 */
.shopping-layout {
  display: flex;
  gap: 30px;
  min-height: calc(100vh - 150px);
  --border-color: #e0e6df;
  --input-bg: #f5f5f7;
}

[data-theme='dark'] .shopping-layout {
  --border-color: #3d3d3d;
  --input-bg: #2a2a2a;
}

.shopping-sidebar {
  width: 210px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
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
  transition: background 0.2s, opacity 0.2s;
  text-align: left;
  font-size: 0.93rem;
  font-weight: 500;
  opacity: 0.75;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.nav-item.active {
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  opacity: 1;
}

[data-theme='dark'] .nav-item.active {
  background: rgba(0, 113, 227, 0.15);
  color: #4da3ff;
}

.nav-icon { font-size: 1.05rem; }
.nav-label { flex: 1; }

.nav-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--border-color);
  color: #86868b;
  padding: 2px 7px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
}

.nav-item.active .nav-badge {
  background: rgba(0, 113, 227, 0.15);
  color: #0071e3;
}

.sidebar-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  background: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 0.87rem;
  font-weight: 500;
  transition: all 0.2s;
  opacity: 0.8;
}

.sidebar-action-btn:hover:not(:disabled) {
  background: var(--input-bg);
  opacity: 1;
}

.sidebar-action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sidebar-action-btn.danger:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.08);
  border-color: rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}

.shopping-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  line-height: 1;
}

.page-subtitle {
  display: flex;
  gap: 8px;
  margin: 0;
}

.count-badge {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.count-badge.open {
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
}

.count-badge.done {
  background: rgba(52, 199, 89, 0.1);
  color: #1a8a34;
}

[data-theme='dark'] .count-badge.done { color: #34c759; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.quick-add {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.input-quick {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 10px;
  font-size: 14px;
  width: 160px;
  outline: none;
  transition: width 0.3s, border-color 0.2s;
}

.input-quick:focus {
  width: 220px;
  border-color: #0071e3;
  background: var(--bg-color);
}

.quick-tip {
  font-size: 10px;
  color: #86868b;
  margin-top: 4px;
}

.btn-add-main {
  background: #0071e3;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
  transition: background 0.2s, transform 0.2s;
  white-space: nowrap;
}

.btn-add-main:hover {
  background: #0077ed;
  transform: translateY(-1px);
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 28px;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--input-bg);
  padding: 8px 14px;
  border-radius: 10px;
  flex: 1;
  max-width: 340px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.search-box:focus-within { border-color: #0071e3; }

.search-box input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: var(--text-color);
}

.search-clear {
  border: none;
  background: none;
  color: #86868b;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.filters-group {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus { border-color: #0071e3; }

.list-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.list-section {
  display: flex;
  flex-direction: column;
}

.list-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toggle-btn {
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 6px 0;
  text-align: left;
}

.list-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #86868b;
}

.toggle-icon {
  font-size: 1.3rem;
  color: #86868b;
  transition: transform 0.25s;
  display: inline-block;
  transform: rotate(90deg);
}

.toggle-icon.rotated { transform: rotate(-90deg); }

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shopping-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--navbar-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: box-shadow 0.25s, transform 0.25s;
}

.shopping-row:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.checked-row { opacity: 0.55; }
.checked-row:hover { opacity: 0.75; }

.check-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

.check-btn:hover {
  border-color: #34c759;
  background: rgba(52, 199, 89, 0.1);
}

.check-btn.checked {
  background: #34c759;
  border-color: #34c759;
}

.check-inner { line-height: 1; pointer-events: none; }

.row-emoji {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 34px;
  text-align: center;
}

.row-emoji.faded { opacity: 0.5; }

.row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-name.struck {
  text-decoration: line-through;
  color: #86868b;
}

.row-meta {
  font-size: 0.82rem;
  color: #86868b;
}

.row-category { color: #86868b; }

.qty-controls {
  display: flex;
  align-items: center;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-color);
  font-size: 1rem;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover { background: var(--border-color); }

.qty-value {
  min-width: 28px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  padding: 0 2px;
}

.row-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  opacity: 0;
}

.shopping-row:hover .action-btn { opacity: 1; }
.action-btn:hover { background: var(--input-bg); transform: scale(1.08); }
.action-btn.delete:hover { background: rgba(255, 59, 48, 0.1); border-color: rgba(255, 59, 48, 0.4); }

.state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  color: #86868b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon { font-size: 3rem; line-height: 1; }

.empty-state h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.empty-state p { margin: 0; font-size: 0.9rem; }

.btn-primary {
  margin-top: 8px;
  background: #0071e3;
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover { background: #0077ed; }

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top: 3px solid #0071e3;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 14px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.side-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.side-panel {
  width: 440px;
  max-width: 100vw;
  background: var(--bg-color);
  color: var(--text-color);
  height: 100%;
  padding: 40px;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.panel-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
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
  font-size: 14px;
  transition: background 0.2s;
}

.btn-close:hover { background: var(--border-color); }

.panel-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.required { color: #ff3b30; }

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 { flex: 1; min-width: 0; }

.input-modern {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.input-modern:focus { border-color: #0071e3; }
.input-modern:disabled { opacity: 0.5; cursor: not-allowed; }

.quantity-stepper {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--input-bg);
}

.quantity-stepper button {
  width: 40px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.15s;
}

.quantity-stepper button:hover { background: var(--border-color); }

.quantity-stepper input {
  flex: 1;
  border: none;
  text-align: center;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 15px;
  outline: none;
  font-weight: 600;
}

.form-error {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: #c91b10;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  margin: 0;
}

[data-theme='dark'] .form-error { color: #ff6b62; }

.panel-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-save {
  flex: 2;
  background: #0071e3;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save:not(:disabled):hover { background: #0077ed; }

.saving-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.btn-cancel {
  flex: 1;
  background: var(--input-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover { background: var(--border-color); }

:deep(.list-item-enter-active),
:deep(.list-item-leave-active) {
  transition: all 0.3s ease;
}

:deep(.list-item-enter-from) {
  opacity: 0;
  transform: translateY(-8px);
}

:deep(.list-item-leave-to) {
  opacity: 0;
  transform: translateX(20px);
}

:deep(.list-item-move) {
  transition: transform 0.35s ease;
}

@media (max-width: 900px) {
  .shopping-layout {
    flex-direction: column;
    gap: 16px;
  }

  .shopping-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sidebar-section {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sidebar-section-title { display: none; }
}

@media (max-width: 640px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .header-actions { width: 100%; justify-content: space-between; }
  .filter-bar { flex-direction: column; align-items: stretch; gap: 10px; }
  .search-box { max-width: 100%; }
  .filters-group { justify-content: stretch; }
  .filter-select { flex: 1; }
  .side-panel { width: 100%; padding: 28px 20px; }
  .form-row { flex-direction: column; }
  .qty-controls { display: none; }
  .action-btn { opacity: 1 !important; }
}
</style>
