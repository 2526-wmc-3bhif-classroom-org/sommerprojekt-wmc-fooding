<template>
  <div class="profile-container">
    <UiCard class="profile-box" :padding="'40px'">
      <div class="profile-header">
        <h1>Mein Profil</h1>
        <p>Verwalte deine Profilinformationen</p>
      </div>

      <div class="profile-content">
        <div class="avatar-section">
          <div class="avatar-container">
            <img v-if="previewImage" :src="previewImage" alt="Vorschau" class="avatar-image" />
            <img v-else-if="userImage" :src="`http://127.0.0.1:3000${userImage}`" alt="Profilbild" class="avatar-image" />
            <div v-else class="avatar-placeholder">
              {{ authService.user?.email.charAt(0).toUpperCase() || 'U' }}
            </div>
          </div>
          <div class="avatar-actions">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
            <UiButton v-if="!previewImage" @click="triggerFileInput">
              <Camera :size="18" />
              Bild ändern
            </UiButton>
            <div v-else class="preview-actions">
              <UiButton @click="saveImage">
                Speichern
              </UiButton>
              <UiButton variant="secondary" @click="cancelImage">
                Abbrechen
              </UiButton>
            </div>
          </div>
        </div>

        <div class="profile-info">
          <div class="info-item">
            <label>Email:</label>
            <span>{{ authService.user?.email }}</span>
          </div>
          <div class="info-item">
            <label>Registriert seit:</label>
            <span>{{ 'Unbekannt' }}</span>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { Camera } from 'lucide-vue-next'
import { authService } from '@/services/auth'

const userImage = ref<string>('')
const selectedFile = ref<File | null>(null)
const previewImage = ref<string>('')

const triggerFileInput = () => {
  const input = document.getElementById('fileInput') as HTMLInputElement
  input?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const saveImage = async () => {
  if (selectedFile.value) {
    try {
      const imageUrl = await authService.uploadProfileImage(selectedFile.value)
      userImage.value = imageUrl
      authService.updateUserImage(imageUrl)
      selectedFile.value = null
      previewImage.value = ''
    } catch (e) {
      alert('Fehler beim Hochladen des Bildes')
    }
  }
}

const cancelImage = () => {
  selectedFile.value = null
  previewImage.value = ''
  const input = document.getElementById('fileInput') as HTMLInputElement
  if (input) input.value = ''
}

onMounted(() => {
  if (authService.user?.image) {
    userImage.value = authService.user.image
  }
})
</script>

<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-main);
  padding: 20px;
}

.profile-box {
  max-width: 600px;
  width: 100%;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-header p {
  color: var(--text-muted);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--panel-border);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

.info-item label {
  font-weight: 600;
  color: var(--text-main);
}

.info-item span {
  color: var(--text-muted);
}
</style>