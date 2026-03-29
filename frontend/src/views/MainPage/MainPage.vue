<script lang="ts" src="./MainPage.ts"></script>
<style scoped src="./MainPage.css"></style>

<template>
  <div class="page">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>
  </div>

  <header class="topbar glass">
    <nav class="nav-links" aria-label="Main navigation">
      <a href="#" class="nav-link">Link One</a>
      <a href="#" class="nav-link">Link Two</a>
      <a href="#" class="nav-link">Link Three</a>
      <a href="#" class="nav-link">Link Four</a>
    </nav>

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
  </header>

</template>


