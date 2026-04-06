<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { themeStore } from '@/store/theme'
</script>

<template>
  <div class="layout-wrapper" :class="themeStore.theme">
    <Navbar class="layout-navbar" />
    <main class="layout-content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.layout-navbar {
  flex-shrink: 0;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scroll in content area */
  padding: 40px 60px;
}

/* Base theme variables */
:global(:root) {
  --bg-color: #f8f9f8;
  --text-color: #2d5a27;
  --navbar-bg: #fcfdfc;
}

:global([data-theme='dark']) {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --navbar-bg: #242424;
}

@media (max-width: 1024px) {
  .layout-content { padding: 30px 40px; }
}

@media (max-width: 768px) {
  .layout-content { padding: 20px; }
}
</style>
