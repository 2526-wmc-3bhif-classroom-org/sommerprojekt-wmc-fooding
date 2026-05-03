<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { themeStore } from '@/store/theme'
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isReceded = ref(false)

const showNavbar = computed(() => route.name !== 'login')

// Provide a way for child components to control navbar state
const setNavbarRecede = (state: boolean) => {
  isReceded.value = state
}

provide('navbarControl', { setNavbarRecede })
</script>

<template>
  <div class="default-layout" :class="[themeStore.theme, { 'no-navbar': !showNavbar }]">
    <!-- Ambients shared across all pages -->
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    
    <Navbar v-if="showNavbar" :recede="isReceded" />
    
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  position: relative;
  overflow-x: hidden;
}

.main-content {
  position: relative;
  z-index: 1;
  padding-top: 120px; /* Space for fixed navbar */
  width: 100%;
  transition: padding 0.3s ease;
}

.no-navbar .main-content {
  padding-top: 0;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.ambient-1 {
  width: 600px;
  height: 600px;
  top: -150px;
  left: -150px;
  background: var(--green);
}

.ambient-2 {
  width: 700px;
  height: 700px;
  top: 30%;
  right: -250px;
  background: #059669;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
