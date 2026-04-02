<template>
  <div class="page" :class="theme">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>

    <header class="topbar glass">
      <nav class="nav-links" aria-label="Main navigation">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/inventory" class="nav-link">Inventar</router-link>
        <router-link to="/products" class="nav-link">Produkte</router-link>
      </nav>

      <div class="header-actions">
        <div v-if="user" class="user-section">
          <span class="user-email">{{ user.email }}</span>
          <button class="logout-btn" type="button" @click="handleLogout">
            Logout
          </button>
        </div>

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

    <main class="hero-layout">
      <!-- Form Panel -->
      <section class="intro-panel glass">
        <div class="intro-content">
          <p class="eyebrow">Produkt • Verwaltung • System</p>
          <h1 class="headline">PRODUKTE</h1>
          <p class="sub-accent">VERWALTE DEIN INVENTAR!</p>

          <form @submit.prevent="handleSubmit" class="product-form">
            <div class="form-group">
              <label for="name">Produktname</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="z.B. Tomaten, Milch, Brot..."
                required
              />
            </div>

            <div class="form-group">
              <label for="unit">Einheit</label>
              <input
                id="unit"
                v-model="formData.default_unit"
                type="text"
                placeholder="z.B. kg, Liter, Stück..."
                required
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Speichert...' : '+ Produkt hinzufügen' }}
              </button>
              <button type="button" @click="resetForm" class="btn-secondary">
                Zurücksetzen
              </button>
            </div>

            <div v-if="formError" class="message error-message">{{ formError }}</div>
            <div v-if="formSuccess" class="message success-message">{{ formSuccess }}</div>
          </form>
        </div>
      </section>

      <!-- Products List Panel -->
      <section class="visual-panel glass">
        <div class="products-container">
          <div class="products-header">
            <h2 class="section-title">Meine Produkte</h2>
            <span class="product-count">{{ products.length }} Produkt{{ products.length !== 1 ? 'e' : '' }}</span>
          </div>

          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Lade Produkte...</p>
          </div>

          <div v-else-if="loadError" class="empty-state">
            <p class="error-text">❌ {{ loadError }}</p>
          </div>

          <div v-else-if="products.length === 0" class="empty-state">
            <p class="empty-icon">📦</p>
            <p>Noch keine Produkte vorhanden.</p>
            <p class="empty-hint">Füge dein erstes Produkt hinzu!</p>
          </div>

          <div v-else class="products-list">
            <div
              v-for="product in products"
              :key="product.product_id"
              class="product-card"
            >
              <div v-if="editingId === product.product_id" class="edit-mode">
                <input
                  v-model="editData.name"
                  type="text"
                  placeholder="Produktname"
                  class="edit-input"
                />
                <input
                  v-model="editData.default_unit"
                  type="text"
                  placeholder="Einheit"
                  class="edit-input"
                />
                <div class="card-actions">
                  <button @click="saveEdit(product.product_id!)" class="btn-save">
                    ✓ Speichern
                  </button>
                  <button @click="cancelEdit" class="btn-cancel">
                    ✕ Abbrechen
                  </button>
                </div>
              </div>

              <div v-else class="view-mode">
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <span class="product-unit">{{ product.default_unit }}</span>
                </div>
                <div class="card-actions">
                  <button @click="startEdit(product)" class="btn-edit" title="Bearbeiten">
                  </button>
                  <button @click="confirmDelete(product)" class="btn-delete" title="Löschen">
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="bottom-nav">
      <!-- Vielleicht für zukünftige Funktionen -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { productService, type Product } from '@/services/product'
import { authService } from '@/services/auth'

type ThemeMode = 'dark' | 'light'

const router = useRouter()
const theme = ref<ThemeMode>('light')
const user = computed(() => authService.user)

const products = ref<Product[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const formData = ref({
  name: '',
  default_unit: ''
})

const isSubmitting = ref(false)
const formError = ref<string | null>(null)
const formSuccess = ref<string | null>(null)

const editingId = ref<number | null>(null)
const editData = ref({
  name: '',
  default_unit: ''
})

const updateDocumentTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  updateDocumentTheme()
}

const handleLogout = () => {
  authService.logout()
  router.push('/')
}

async function loadProducts() {
  isLoading.value = true
  loadError.value = null

  try {
    products.value = await productService.getProducts()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Fehler beim Laden der Produkte'
    console.error('Error loading products:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  if (!formData.value.name.trim() || !formData.value.default_unit.trim()) {
    formError.value = 'Bitte alle Felder ausfüllen'
    return
  }

  isSubmitting.value = true
  formError.value = null
  formSuccess.value = null

  try {
    await productService.createProduct(
      formData.value.name.trim(),
      formData.value.default_unit.trim()
    )

    formSuccess.value = ' Produkt erfolgreich hinzugefügt!'
    resetForm()
    await loadProducts()

    setTimeout(() => {
      formSuccess.value = null
    }, 3000)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Fehler beim Hinzufügen'
    console.error('Error creating product:', error)
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  formData.value = {
    name: '',
    default_unit: ''
  }
  formError.value = null
}

function startEdit(product: Product) {
  editingId.value = product.product_id!
  editData.value = {
    name: product.name,
    default_unit: product.default_unit
  }
}

function cancelEdit() {
  editingId.value = null
  editData.value = { name: '', default_unit: '' }
}

async function saveEdit(productId: number) {
  if (!editData.value.name.trim() || !editData.value.default_unit.trim()) {
    alert('Bitte alle Felder ausfüllen')
    return
  }

  try {
    await productService.updateProduct(
      productId,
      editData.value.name.trim(),
      editData.value.default_unit.trim()
    )

    cancelEdit()
    await loadProducts()
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Fehler beim Aktualisieren')
    console.error('Error updating product:', error)
  }
}

async function confirmDelete(product: Product) {
  if (!confirm(`Möchten Sie "${product.name}"  löschen?`)) {
    return
  }

  try {
    await productService.deleteProduct(product.product_id!)
    await loadProducts()
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Fehler beim Löschen')
    console.error('Error deleting product:', error)
  }
}

onMounted(() => {
  updateDocumentTheme()
  loadProducts()
})

onBeforeUnmount(() => {
  // Cleanup if needed
})
</script>
