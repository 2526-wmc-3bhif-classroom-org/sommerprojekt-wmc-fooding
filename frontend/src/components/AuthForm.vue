// ai used here in styling
<template>
  <div class="auth-form">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">E-Mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Passwort</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="isLoading">
        {{ isLoading ? 'Wird verarbeitet...' : isLoginMode ? 'Anmelden' : 'Registrieren' }}
      </button>
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

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth'



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


<style scoped>
.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #c33;
}


.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-mode {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 0.9rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
  font-size: 0.9rem;
}

.toggle-btn:hover {
  color: #764ba2;
}
</style>
