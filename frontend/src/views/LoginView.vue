<template>
  <div class="login-container">
    <UiCard class="login-box" :padding="'40px'">
      <div class="login-header">
        <div class="logo-icon">
          <Utensils :size="32" />
        </div>
        <h1>FOODING</h1>
        <p class="subtitle">Melde dich an oder erstelle ein Konto</p>
      </div>
      
      <AuthForm @success="handleSuccess" />
      
      <div class="login-footer">
        <p>Eat like never before!</p>
      </div>
    </UiCard>
    
    <!-- Background Ambients -->
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'
import UiCard from '@/components/ui/UiCard.vue'
import { Utensils } from 'lucide-vue-next'

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
  background-color: var(--bg-main);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 100%;
  max-width: 440px;
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--green), var(--green-strong));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
}

h1 {
  color: var(--text-main);
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-muted);
  margin: 8px 0 0;
  font-size: 1rem;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid var(--panel-border);
  padding-top: 24px;
}

.login-footer p {
  color: var(--green);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Background Ambients */
.ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
}

.ambient-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: var(--green);
}

.ambient-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  background: #059669;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 24px !important;
  }
}
</style>
