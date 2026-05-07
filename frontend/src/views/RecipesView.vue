<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { recipeService, type Recipe, type RecipeWithIngredients } from '@/services/recipe'
import { productService, type Product } from '@/services/product'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiInput from '@/components/ui/UiInput.vue'
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ChefHat,
  ShoppingCart,
  Sparkles,
  BookOpen,
  X
} from 'lucide-vue-next'

const router = useRouter()
const navbarControl = inject<{ setNavbarRecede: (state: boolean) => void }>('navbarControl')

const activeTab = ref<'all' | 'cookable'>('all')
const searchQuery = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const isLoadingDetail = ref(false)
const isAddingToList = ref(false)

const recipes = ref<Recipe[]>([])
const cookableIds = ref<Set<number>>(new Set())
const selectedRecipe = ref<RecipeWithIngredients | null>(null)
const allProducts = ref<Product[]>([])

const showDetailPanel = ref(false)
const showFormPanel = ref(false)
const editingRecipe = ref<Recipe | null>(null)

const formData = ref({
  title: '',
  instructions: '',
  ingredients: [] as { productId: number; quantity: number; name: string; unit: string }[]
})

const ingredientDraft = ref({
  productId: 0,
  quantity: 1
})

const saveError = ref('')

const getEmoji = (title: string) => {
  const t = title.toLowerCase()
  if (t.includes('pasta') || t.includes('nudel') || t.includes('spaghetti')) return '🍝'
  if (t.includes('salat') || t.includes('salad')) return '🥗'
  if (t.includes('suppe') || t.includes('soup')) return '🍲'
  if (t.includes('pizza')) return '🍕'
  if (t.includes('burger')) return '🍔'
  if (t.includes('reis') || t.includes('rice')) return '🍚'
  if (t.includes('hähnchen') || t.includes('chicken') || t.includes('hühnchen')) return '🍗'
  if (t.includes('fisch') || t.includes('fish') || t.includes('lachs')) return '🐟'
  if (t.includes('steak') || t.includes('fleisch')) return '🥩'
  if (t.includes('kuchen') || t.includes('cake') || t.includes('torte')) return '🎂'
  if (t.includes('pfannkuchen') || t.includes('pancake')) return '🥞'
  if (t.includes('wrap') || t.includes('tortilla')) return '🌯'
  if (t.includes('toast') || t.includes('brot')) return '🍞'
  if (t.includes('curry')) return '🍛'
  if (t.includes('omelette') || t.includes('ei') || t.includes('egg')) return '🍳'
  if (t.includes('smoothie') || t.includes('shake')) return '🥤'
  return '🍽️'
}

const displayedRecipes = computed(() => {
  let source = activeTab.value === 'cookable'
    ? recipes.value.filter(r => cookableIds.value.has(r.recipe_id!))
    : recipes.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    source = source.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.instructions.toLowerCase().includes(q)
    )
  }
  return source
})

const cookableCount = computed(() =>
  recipes.value.filter(r => cookableIds.value.has(r.recipe_id!)).length
)

const selectedProductForDraft = computed(() =>
  allProducts.value.find(p => p.product_id === ingredientDraft.value.productId) ?? null
)

const loadData = async () => {
  isLoading.value = true
  try {
    const [recipesData, productsData, suggestionsData] = await Promise.all([
      recipeService.getRecipes(),
      productService.getProducts(),
      recipeService.getSuggestions()
    ])
    recipes.value = recipesData
    allProducts.value = productsData
    cookableIds.value = new Set(suggestionsData.map(r => r.recipe_id!))
  } catch (error: unknown) {
    if (error?.toString().includes('401')) router.push('/login')
  } finally {
    isLoading.value = false
  }
}

const openDetail = async (recipe: Recipe) => {
  isLoadingDetail.value = true
  showDetailPanel.value = true
  showFormPanel.value = false
  navbarControl?.setNavbarRecede(true)
  try {
    selectedRecipe.value = await recipeService.getRecipeById(recipe.recipe_id!)
  } catch {
    selectedRecipe.value = null
  } finally {
    isLoadingDetail.value = false
  }
}

const closeDetail = () => {
  showDetailPanel.value = false
  selectedRecipe.value = null
  navbarControl?.setNavbarRecede(false)
}

const openCreateForm = () => {
  editingRecipe.value = null
  formData.value = { title: '', instructions: '', ingredients: [] }
  ingredientDraft.value = { productId: 0, quantity: 1 }
  saveError.value = ''
  showFormPanel.value = true
  showDetailPanel.value = false
  navbarControl?.setNavbarRecede(true)
}

const openEditForm = (recipe: RecipeWithIngredients) => {
  editingRecipe.value = recipe
  formData.value = {
    title: recipe.title,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map(i => ({
      productId: i.product_id,
      quantity: i.quantity,
      name: i.name ?? '',
      unit: i.default_unit ?? ''
    }))
  }
  ingredientDraft.value = { productId: 0, quantity: 1 }
  saveError.value = ''
  showDetailPanel.value = false
  showFormPanel.value = true
}

const closeForm = () => {
  showFormPanel.value = false
  editingRecipe.value = null
  navbarControl?.setNavbarRecede(showDetailPanel.value)
}

const addIngredientToDraft = () => {
  if (!ingredientDraft.value.productId) return
  const product = allProducts.value.find(p => p.product_id === ingredientDraft.value.productId)
  if (!product) return
  const already = formData.value.ingredients.find(i => i.productId === ingredientDraft.value.productId)
  if (already) return
  formData.value.ingredients.push({
    productId: product.product_id!,
    quantity: ingredientDraft.value.quantity,
    name: product.name,
    unit: product.default_unit
  })
  ingredientDraft.value = { productId: 0, quantity: 1 }
}

const removeIngredient = (index: number) => {
  formData.value.ingredients.splice(index, 1)
}

const saveRecipe = async () => {
  if (!formData.value.title.trim() || !formData.value.instructions.trim()) {
    saveError.value = 'Titel und Anleitung sind erforderlich.'
    return
  }
  isSaving.value = true
  saveError.value = ''
  try {
    if (editingRecipe.value && editingRecipe.value.recipe_id != null) {
      await recipeService.updateRecipe(editingRecipe.value.recipe_id, {
        title: formData.value.title.trim(),
        instructions: formData.value.instructions.trim()
      })
    } else {
      await recipeService.createRecipe(
        formData.value.title.trim(),
        formData.value.instructions.trim(),
        formData.value.ingredients.map(i => ({ productId: i.productId, quantity: i.quantity }))
      )
    }
    await loadData()
    closeForm()
  } catch (error: unknown) {
    const err = error as Error
    saveError.value = err?.message || 'Unbekannter Fehler.'
  } finally {
    isSaving.value = false
  }
}

const deleteRecipe = async (recipe: Recipe) => {
  if (!confirm(`"${recipe.title}" wirklich löschen?`)) return
  try {
    await recipeService.deleteRecipe(recipe.recipe_id!)
    recipes.value = recipes.value.filter(r => r.recipe_id !== recipe.recipe_id)
    closeDetail()
  } catch {
    alert('Fehler beim Löschen.')
  }
}

const addMissingToShoppingList = async (recipe: Recipe) => {
  isAddingToList.value = true
  try {
    await recipeService.addMissingToShoppingList(recipe.recipe_id!)
    router.push('/shopping-list')
  } catch {
    alert('Fehler beim Hinzufügen zur Einkaufsliste.')
  } finally {
    isAddingToList.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="recipes-view">

    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">Rezepte</h1>
        <p class="page-subtitle">Entdecke was du kochen kannst oder erstelle neue Rezepte.</p>
      </div>
      <UiButton @click="openCreateForm">
        <Plus :size="20" />
        Neues Rezept
      </UiButton>
    </div>

    <div class="controls-bar">
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          <BookOpen :size="16" />
          Alle
          <span class="tab-count">{{ recipes.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'cookable' }"
          @click="activeTab = 'cookable'"
        >
          <Sparkles :size="16" />
          Aus Vorrat kochbar
          <span class="tab-count cookable">{{ cookableCount }}</span>
        </button>
      </div>
      <UiInput
        v-model="searchQuery"
        placeholder="Rezepte suchen..."
        :icon="Search"
        class="search-input"
      />
    </div>

    <div v-if="isLoading" class="loader">
      <div class="spinner"></div>
    </div>

    <div v-else-if="displayedRecipes.length === 0" class="empty-state">
      <ChefHat :size="64" />
      <h3>{{ activeTab === 'cookable' ? 'Keine Rezepte kochbar' : 'Noch keine Rezepte' }}</h3>
      <p v-if="activeTab === 'cookable'">Fülle deinen Vorrat oder erstelle Rezepte die zu deinen Zutaten passen.</p>
      <p v-else>Erstelle dein erstes Rezept und plane deine Mahlzeiten.</p>
      <UiButton class="mt-4" @click="activeTab === 'cookable' ? activeTab = 'all' : openCreateForm()">
        {{ activeTab === 'cookable' ? 'Alle Rezepte anzeigen' : 'Rezept erstellen' }}
      </UiButton>
    </div>

    <div v-else class="recipes-grid">
      <UiCard
        v-for="recipe in displayedRecipes"
        :key="recipe.recipe_id"
        hoverable
        class="recipe-card"
        padding="0"
        @click="openDetail(recipe)"
      >
        <div class="card-emoji-header">
          <span class="recipe-emoji">{{ getEmoji(recipe.title) }}</span>
          <UiBadge v-if="cookableIds.has(recipe.recipe_id!)" variant="success">
            Jetzt kochbar
          </UiBadge>
        </div>

        <div class="card-body">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-preview">{{ recipe.instructions }}</p>
        </div>

        <div class="card-footer">
          <span class="cook-label">Rezept anzeigen →</span>
        </div>
      </UiCard>
    </div>


    <transition name="slide">
      <div v-if="showDetailPanel" class="panel-overlay" @click.self="closeDetail">
        <div class="panel">
          <UiCard padding="0" class="panel-card">

            <div v-if="isLoadingDetail" class="panel-loader">
              <div class="spinner"></div>
            </div>

            <template v-else-if="selectedRecipe">
              <div class="panel-emoji-header">
                <span class="panel-emoji">{{ getEmoji(selectedRecipe.title) }}</span>
                <UiBadge v-if="cookableIds.has(selectedRecipe.recipe_id!)" variant="success">
                  Jetzt kochbar
                </UiBadge>
              </div>

              <div class="panel-content">
                <div class="panel-title-row">
                  <h2 class="panel-title">{{ selectedRecipe.title }}</h2>
                  <div class="panel-tool-actions">
                    <button class="tool-btn" @click="openEditForm(selectedRecipe)" title="Bearbeiten">
                      <Edit2 :size="18" />
                    </button>
                    <button class="tool-btn danger" @click="deleteRecipe(selectedRecipe)" title="Löschen">
                      <Trash2 :size="18" />
                    </button>
                    <button class="tool-btn close" @click="closeDetail" title="Schließen">
                      <X :size="18" />
                    </button>
                  </div>
                </div>

                <section class="panel-section">
                  <h4 class="section-label">Zutaten</h4>
                  <div v-if="selectedRecipe.ingredients.length === 0" class="no-ingredients">
                    Keine Zutaten hinterlegt.
                  </div>
                  <ul v-else class="ingredients-list">
                    <li
                      v-for="ing in selectedRecipe.ingredients"
                      :key="ing.product_id"
                      class="ingredient-row"
                    >
                      <span class="ing-name">{{ ing.name }}</span>
                      <span class="ing-qty">{{ ing.quantity }} {{ ing.default_unit }}</span>
                    </li>
                  </ul>
                </section>

                <section class="panel-section">
                  <h4 class="section-label">Zubereitung</h4>
                  <p class="instructions-text">{{ selectedRecipe.instructions }}</p>
                </section>

                <div class="panel-actions-footer">
                  <UiButton
                    variant="secondary"
                    @click="addMissingToShoppingList(selectedRecipe)"
                    :loading="isAddingToList"
                    class="full-width-btn"
                  >
                    <ShoppingCart :size="18" />
                    Fehlende Zutaten zur Einkaufsliste
                  </UiButton>
                </div>
              </div>
            </template>
          </UiCard>
        </div>
      </div>
    </transition>


    <transition name="slide">
      <div v-if="showFormPanel" class="panel-overlay" @click.self="closeForm">
        <div class="panel">
          <UiCard padding="0" class="panel-card">
            <div class="panel-content">
              <div class="panel-title-row">
                <h2 class="panel-title">
                  {{ editingRecipe ? 'Rezept bearbeiten' : 'Neues Rezept' }}
                </h2>
                <button class="tool-btn close" @click="closeForm">
                  <X :size="18" />
                </button>
              </div>

              <form @submit.prevent="saveRecipe" class="panel-form">

                <UiInput
                  v-model="formData.title"
                  label="Titel"
                  placeholder="z.B. Pasta Carbonara"
                />

                <div class="form-group">
                  <label class="ui-label">Zubereitung</label>
                  <textarea
                    v-model="formData.instructions"
                    class="modern-textarea"
                    placeholder="Schritt-für-Schritt Anleitung..."
                    rows="5"
                  ></textarea>
                </div>

                <div v-if="!editingRecipe" class="form-group">
                  <label class="ui-label">Zutaten</label>

                  <div v-if="formData.ingredients.length > 0" class="ingredients-added">
                    <div
                      v-for="(ing, idx) in formData.ingredients"
                      :key="ing.productId"
                      class="added-ingredient"
                    >
                      <span class="added-ing-name">{{ ing.name }}</span>
                      <span class="added-ing-qty">{{ ing.quantity }} {{ ing.unit }}</span>
                      <button type="button" @click="removeIngredient(idx)" class="remove-ing-btn">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>

                  <div class="ingredient-draft-row">
                    <select v-model="ingredientDraft.productId" class="modern-select flex-1">
                      <option :value="0" disabled>Produkt wählen</option>
                      <option
                        v-for="product in allProducts"
                        :key="product.product_id"
                        :value="product.product_id"
                        :disabled="formData.ingredients.some(i => i.productId === product.product_id)"
                      >
                        {{ product.name }} ({{ product.default_unit }})
                      </option>
                    </select>
                    <input
                      type="number"
                      v-model.number="ingredientDraft.quantity"
                      min="0.1"
                      step="0.1"
                      class="qty-input"
                    />
                    <button
                      type="button"
                      class="add-ing-btn"
                      @click="addIngredientToDraft"
                      :disabled="!ingredientDraft.productId"
                    >
                      <Plus :size="18" />
                    </button>
                  </div>

                  <p v-if="selectedProductForDraft" class="draft-unit-hint">
                    Einheit: {{ selectedProductForDraft.default_unit }}
                  </p>
                </div>

                <p v-if="editingRecipe" class="edit-note">
                  Zutaten können aktuell nur beim Erstellen hinzugefügt werden.
                </p>

                <p v-if="saveError" class="form-error">⚠️ {{ saveError }}</p>

                <div class="form-actions">
                  <UiButton variant="secondary" type="button" @click="closeForm">Abbrechen</UiButton>
                  <UiButton :loading="isSaving" type="submit">
                    {{ editingRecipe ? 'Speichern' : 'Erstellen' }}
                  </UiButton>
                </div>

              </form>
            </div>
          </UiCard>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.recipes-view {
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

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 8px 0 0;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 9px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { color: var(--text-main); }

.tab-btn.active {
  background: var(--green);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

.tab-count {
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tab-count.cookable {
  background: rgba(255, 255, 255, 0.2);
}

.tab-btn.active .tab-count {
  background: rgba(0, 0, 0, 0.15);
}

.search-input {
  max-width: 320px;
  flex: 1;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.recipe-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-emoji-header {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03));
  border-bottom: 1px solid var(--panel-border);
  padding: 28px 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.recipe-emoji {
  font-size: 3rem;
  line-height: 1;
}

.card-body {
  padding: 20px 24px 16px;
  flex: 1;
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: var(--text-main);
}

.recipe-preview {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  padding: 14px 24px 20px;
  border-top: 1px solid var(--panel-border);
}

.cook-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--green);
  transition: letter-spacing 0.2s;
}

.recipe-card:hover .cook-label {
  letter-spacing: 0.02em;
}

.loader {
  display: flex;
  justify-content: center;
  padding: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: var(--text-muted);
}

.empty-state h3 {
  color: var(--text-main);
  margin: 24px 0 8px;
  font-size: 1.5rem;
}

.empty-state p { margin: 0; }
.mt-4 { margin-top: 1.5rem; }

.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 100%;
  max-width: 520px;
  height: 100%;
  overflow-y: auto;
}

.panel-card {
  min-height: 100%;
  border-radius: 0;
  border-left: 1px solid var(--panel-border);
  border-top: none;
  border-bottom: none;
  border-right: none;
}

.panel-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.panel-emoji-header {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.04));
  border-bottom: 1px solid var(--panel-border);
  padding: 36px 36px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.panel-emoji {
  font-size: 4rem;
  line-height: 1;
}

.panel-content {
  padding: 32px 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.panel-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  flex: 1;
  line-height: 1.2;
}

.panel-tool-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
}

.tool-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.tool-btn.close:hover {
  background: rgba(255, 255, 255, 0.05);
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 0;
}

.no-ingredients {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
}

.ingredients-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
}

.ing-name {
  font-weight: 600;
  color: var(--text-main);
}

.ing-qty {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.instructions-text {
  color: var(--text-muted);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.panel-actions-footer {
  padding-top: 8px;
}

.full-width-btn {
  width: 100%;
}

.panel-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ui-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  padding-left: 4px;
}

.modern-textarea {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 14px 16px;
  color: var(--text-main);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.2s;
}

.modern-textarea:focus {
  border-color: var(--green);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.08);
}

.ingredients-added {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
}

.added-ingredient {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 12px;
}

.added-ing-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-main);
}

.added-ing-qty {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.remove-ing-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: color 0.2s;
}

.remove-ing-btn:hover { color: #ef4444; }

.ingredient-draft-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.modern-select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 16px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  font-size: 0.95rem;
}

.modern-select:focus { border-color: var(--green); }

.flex-1 { flex: 1; min-width: 0; }

.qty-input {
  width: 72px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 10px;
  color: var(--text-main);
  text-align: center;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.qty-input:focus { border-color: var(--green); }

.add-ing-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

.add-ing-btn:hover:not(:disabled) {
  background: var(--green-strong);
  transform: translateY(-1px);
}

.add-ing-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.draft-unit-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  padding-left: 4px;
}

.edit-note {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

.form-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  margin: 0;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  padding-top: 8px;
}
</style>

<style>
/* noinspection CssUnusedSymbol */
.slide-enter-active,
/* noinspection CssUnusedSymbol */
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* noinspection CssUnusedSymbol */
.slide-enter-from,
/* noinspection CssUnusedSymbol */
.slide-leave-to {
  transform: translateX(100%);
}
</style>

<style scoped>
@media (max-width: 900px) {
  .controls-bar { flex-direction: column; align-items: stretch; }
  .search-input { max-width: 100%; }
  .recipes-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 16px; }
  .tabs { flex-direction: column; }
  .panel { max-width: 100%; }
  .panel-content { padding: 24px 20px 32px; }
  .panel-emoji-header { padding: 24px 20px 20px; }
  .form-actions { grid-template-columns: 1fr 1fr; }
}
</style>
