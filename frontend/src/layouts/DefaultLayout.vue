<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { themeStore } from '@/store/theme'
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isReceded = ref(false)


// wenn  die route gewechselt wird neuer wert durch berechnet, wenn es login ist ist showNavbar dann false
const showNavbar = computed(() => route.name !== 'login')

// dafür da um navbar auszublenden wenn man sie nicht braucht
const setNavbarRecede = (state: boolean) => {
  isReceded.value = state
}

// damit man kann man die Funktion unter dem Namen navbarControll speichern,const navbarControl = inject('navbarControl')
provide('navbarControl', { setNavbarRecede })
</script>

<template>
  <div class="default-layout" :class="[themeStore.theme, { 'no-navbar': !showNavbar }]">
    <!-- Ambients shared across all pages -->
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="fruit fruit-apple"></div>
    <div class="fruit fruit-lemon"></div>
    <div class="fruit fruit-berry"></div>
    <div class="fruit fruit-melon"></div>

    <Navbar v-if="showNavbar" :recede="isReceded" />

    <main class="main-content">
      <slot></slot>
    </main>

    <ToastContainer />
    <ConfirmDialog />
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

.fruit {
  position: absolute;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fruit-apple {
  top: 8%;
  left: 2%;
  width: 260px;
  height: 260px;
  transform: rotate(-15deg);
  background-image: url("../assets/images/apple.png");
}

.fruit-lemon {
  top: 60%;
  left: -5%;
  width: 280px;
  height: 280px;
  transform: rotate(20deg);
  background-image: url("../assets/images/lemon.png");
}

.fruit-berry {
  top: 32%;
  right: 3%;
  width: 220px;
  height: 220px;
  transform: rotate(12deg);
  background-image: url("../assets/images/strawberry.png");
}

.fruit-melon {
  top: 85%;
  right: 2%;
  width: 320px;
  height: 320px;
  transform: rotate(-10deg);
  background-image: url("../assets/images/watermelon.png");
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
