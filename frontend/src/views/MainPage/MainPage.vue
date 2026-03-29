<template>
  <div class="page" :class="theme">
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>

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

    <main class="hero-layout">
      <section class="intro-panel glass">
        <div class="intro-content">
          <p class="eyebrow">Smart • Modern • Delicious</p>
          <h1 class="headline">FOODING</h1>
          <p class="sub-accent">EAT LIKE NEVER BEFORE!</p>
          <p class="description"></p>

          <!-- Mithilfe von KI -->
          <div class="intro-image-wrap">
            <img
              class="intro-image"
              src="https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80"
              alt="Food preview"
            />
          </div>
        </div>
      </section>

      <section class="visual-panel glass">
        <div class="slider-frame">
          <transition name="fade" mode="out-in">
            <div
              :key="currentSlide.id"
              class="slide"
              :style="{
                backgroundImage: `linear-gradient(135deg, rgba(14, 11, 8, 0.24), rgba(77, 163, 255, 0.12)), url(${currentSlide.image})`
              }"
            >
              <div class="slide-overlay">
                <p class="slide-kicker">Text</p>
                <h2 class="slide-title">{{ currentSlide.title }}</h2>
                <p class="slide-text">{{ currentSlide.text }}</p>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>

    <footer class="bottom-nav">
      <button
        v-for="button in buttons"
        :key="button"
        type="button"
        class="action-card"
        @click="handlePlaceholder(button)"
      >
        <span class="action-glow"></span>
        <span class="action-label">{{ button }}</span>
        <span class="action-arrow">↗</span>
      </button>
    </footer>
  </div>
</template>

<script lang="ts" src="./MainPage.ts"></script>
<style scoped src="./MainPage.css"></style>
