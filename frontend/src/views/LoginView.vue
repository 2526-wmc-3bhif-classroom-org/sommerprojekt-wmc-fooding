<template>
  <div class="login-container">
    <div class="login-box">
      <h1>FOODING</h1>
      <p class="subtitle">Melde dich an oder registriere dich</p>
      
      <AuthForm @success="handleSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'

const router = useRouter()

const handleSuccess = () => {
  router.push('/')
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin: 0 0 10px;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 30px;
  font-size: 0.95rem;
}

@media (max-width: 520px) {
  .login-box {
    padding: 30px 20px;
  }

  h1 {
    font-size: 2rem;
  }
}
</style>
