<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { Mail, Lock } from 'lucide-vue-next'

const props = defineProps<{
  initialMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isLoginMode = ref(props.initialMode ?? true)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    if (isLoginMode.value) {
      await authService.login({
        email: email.value,
        password: password.value
      })
    } else {
      await authService.register({
        email: email.value,
        password: password.value
      })
    }
    emit('success')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Ein Fehler ist aufgetreten'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="inputs-group">
        <UiInput
          v-model="email"
          label="E-Mail"
          placeholder="deine@email.de"
          type="email"
          :icon="Mail"
        />

        <UiInput
          v-model="password"
          label="Passwort"
          placeholder="••••••••"
          type="password"
          :icon="Lock"
        />
      </div>

      <UiButton 
        type="submit" 
        class="submit-btn" 
        :loading="isLoading"
        size="lg"
      >
        {{ isLoginMode ? 'Anmelden' : 'Registrieren' }}
      </UiButton>
    </form>

    <div class="toggle-mode">
      <p>
        {{ isLoginMode ? 'Noch kein Konto?' : 'Konto vorhanden?' }}
        <button type="button" @click="toggleMode" class="toggle-btn">
          {{ isLoginMode ? 'Hier registrieren' : 'Hier anmelden' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  width: 100%;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.inputs-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.submit-btn {
  width: 100%;
}

.toggle-mode {
  text-align: center;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--green);
  cursor: pointer;
  font-weight: 700;
  padding: 0 4px;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: var(--green-strong);
  text-decoration: underline;
}
</style>
