<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { Camera, Package, ChefHat, ShoppingCart, AlertTriangle, User } from 'lucide-vue-next'
import { authService } from '@/services/auth'
import { inventoryService } from '@/services/inventory'
import { recipeService } from '@/services/recipe'
import { shoppingListService } from '@/services/shoppingLists'

const PREFS_KEY = 'fooding_diet_prefs'
const apiUrl = import.meta.env.VITE_API_URL

const PREFERENCE_OPTIONS = [
  { id: 'vegetarisch', label: 'Vegetarisch' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'laktosefrei', label: 'Laktosefrei' },
  { id: 'glutenfrei', label: 'Glutenfrei' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'halal', label: 'Halal' },
]

// Profile image
const userImage = ref('')
const selectedFile = ref<File | null>(null)
const previewImage = ref('')
const isUploadingImage = ref(false)

// Stats
const isLoadingStats = ref(true)
const inventoryCount = ref(0)
const expiringSoonCount = ref(0)
const recipeCount = ref(0)
const openShoppingCount = ref(0)

// Preferences
const selectedPrefs = ref<string[]>([])

const loadPrefs = () => {
  try {
    const stored = localStorage.getItem(PREFS_KEY)
    selectedPrefs.value = stored ? JSON.parse(stored) : []
  } catch {
    selectedPrefs.value = []
  }
}

const togglePref = (id: string) => {
  if (selectedPrefs.value.includes(id)) {
    selectedPrefs.value = selectedPrefs.value.filter(p => p !== id)
  } else {
    selectedPrefs.value = [...selectedPrefs.value, id]
  }
  localStorage.setItem(PREFS_KEY, JSON.stringify(selectedPrefs.value))
}

const loadStats = async () => {
  isLoadingStats.value = true
  try {
    const [inventory, recipes, shoppingItems] = await Promise.all([
      inventoryService.getInventory(),
      recipeService.getRecipes(),
      shoppingListService.getItems()
    ])

    inventoryCount.value = inventory.length

    const soon = new Date()
    soon.setDate(soon.getDate() + 3)
    expiringSoonCount.value = inventory.filter(
      i => i.expiration_date && new Date(i.expiration_date) <= soon
    ).length

    recipeCount.value = recipes.length
    openShoppingCount.value = shoppingItems.filter(i => !i.checked).length
  } catch {
    // stats stay at 0
  } finally {
    isLoadingStats.value = false
  }
}

// Image handling
const triggerFileInput = () => {
  (document.getElementById('fileInput') as HTMLInputElement)?.click()
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = e => { previewImage.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

const saveImage = async () => {
  if (!selectedFile.value) return
  isUploadingImage.value = true
  try {
    const imageUrl = await authService.uploadProfileImage(selectedFile.value)
    userImage.value = imageUrl
    authService.updateUserImage(imageUrl)
    selectedFile.value = null
    previewImage.value = ''
  } finally {
    isUploadingImage.value = false
  }
}

const cancelImage = () => {
  selectedFile.value = null
  previewImage.value = ''
  const input = document.getElementById('fileInput') as HTMLInputElement
  if (input) input.value = ''
}

onMounted(() => {
  if (authService.user?.image) userImage.value = authService.user.image
  loadPrefs()
  loadStats()
})
</script>

<template>
  <div class="profile-page">
    <div class="profile-grid">

      <!-- Left column: Avatar + Info -->
      <div class="left-col">
        <UiCard padding="32px" class="avatar-card">
          <div class="avatar-section">
            <div class="avatar-wrap">
              <img v-if="previewImage" :src="previewImage" class="avatar-img" alt="Vorschau" />
              <img v-else-if="userImage" :src="`${apiUrl}${userImage}`" class="avatar-img" alt="Profilbild" />
              <div v-else class="avatar-placeholder">
                <User :size="48" />
              </div>
            </div>

            <input id="fileInput" type="file" accept="image/*" style="display:none" @change="handleFileSelect" />

            <div v-if="!previewImage">
              <UiButton size="sm" variant="secondary" @click="triggerFileInput">
                <Camera :size="16" />
                Bild ändern
              </UiButton>
            </div>
            <div v-else class="preview-actions">
              <UiButton size="sm" :loading="isUploadingImage" @click="saveImage">Speichern</UiButton>
              <UiButton size="sm" variant="secondary" @click="cancelImage">Abbrechen</UiButton>
            </div>
          </div>

          <div class="user-info">
            <p class="user-email">{{ authService.user?.email }}</p>
            <p class="user-role">{{ authService.user?.role ?? 'User' }}</p>
          </div>
        </UiCard>
      </div>

      <!-- Right column: Stats + Preferences -->
      <div class="right-col">

        <!-- Stats -->
        <UiCard padding="32px">
          <h2 class="section-title">Übersicht</h2>

          <div v-if="isLoadingStats" class="stats-loader">
            <div class="spinner"></div>
          </div>

          <div v-else class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon inventory">
                <Package :size="22" />
              </div>
              <div class="stat-body">
                <p class="stat-value">{{ inventoryCount }}</p>
                <p class="stat-label">Artikel im Vorrat</p>
              </div>
            </div>

            <div class="stat-item" :class="{ 'stat-warn': expiringSoonCount > 0 }">
              <div class="stat-icon expiring">
                <AlertTriangle :size="22" />
              </div>
              <div class="stat-body">
                <p class="stat-value">{{ expiringSoonCount }}</p>
                <p class="stat-label">Laufen bald ab</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon recipes">
                <ChefHat :size="22" />
              </div>
              <div class="stat-body">
                <p class="stat-value">{{ recipeCount }}</p>
                <p class="stat-label">Rezepte</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon shopping">
                <ShoppingCart :size="22" />
              </div>
              <div class="stat-body">
                <p class="stat-value">{{ openShoppingCount }}</p>
                <p class="stat-label">Offene Einkäufe</p>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Dietary Preferences -->
        <UiCard padding="32px">
          <h2 class="section-title">Ernährungspräferenzen</h2>
          <p class="section-subtitle">Die KI berücksichtigt diese Einstellungen bei Rezeptvorschlägen und Rezeptwünschen.</p>

          <div class="prefs-grid">
            <button
              v-for="pref in PREFERENCE_OPTIONS"
              :key="pref.id"
              class="pref-chip"
              :class="{ active: selectedPrefs.includes(pref.id) }"
              @click="togglePref(pref.id)"
            >
              {{ pref.label }}
            </button>
          </div>

          <p v-if="selectedPrefs.length === 0" class="prefs-hint">Keine Einschränkungen ausgewählt.</p>
        </UiCard>

      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 700px) {
  .profile-grid { grid-template-columns: 1fr; }
}

.left-col { display: flex; flex-direction: column; gap: 24px; }
.right-col { display: flex; flex-direction: column; gap: 24px; }

/* Avatar */
.avatar-card { display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center; }

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-wrap {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--panel-border);
  background: var(--surface-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-bg);
  color: var(--text-muted);
}

.preview-actions { display: flex; gap: 8px; }

.user-info { text-align: center; }
.user-email { font-weight: 700; font-size: 1rem; margin: 0; }
.user-role { color: var(--text-muted); font-size: 0.85rem; margin: 4px 0 0; text-transform: capitalize; }

/* Stats */
.section-title { font-size: 1.2rem; font-weight: 800; margin: 0 0 20px; }
.section-subtitle { color: var(--text-muted); font-size: 0.9rem; margin: -12px 0 20px; line-height: 1.5; }

.stats-loader { display: flex; justify-content: center; padding: 24px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--panel-border); border-top-color: var(--green); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface-bg);
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  transition: border-color 0.2s;
}

.stat-item.stat-warn { border-color: rgba(251, 146, 60, 0.4); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.inventory { background: rgba(34, 197, 94, 0.1); color: var(--green); }
.stat-icon.expiring { background: rgba(251, 146, 60, 0.1); color: #fb923c; }
.stat-icon.recipes { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.stat-icon.shopping { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.stat-value { font-size: 1.6rem; font-weight: 800; margin: 0; line-height: 1; }
.stat-label { font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 0; }

/* Preferences */
.prefs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pref-chip {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  background: var(--surface-bg);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pref-chip:hover { border-color: var(--green); color: var(--text-main); }

.pref-chip.active {
  background: rgba(34, 197, 94, 0.12);
  border-color: var(--green);
  color: var(--green);
}

.prefs-hint { color: var(--text-muted); font-size: 0.85rem; margin: 12px 0 0; }
</style>
