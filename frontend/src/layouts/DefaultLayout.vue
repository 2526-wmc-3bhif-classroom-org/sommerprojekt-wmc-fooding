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
  width: 320px;
  height: 320px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.16;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-5deg);
}

.fruit-apple {
  top: 10%;
  left: 4%;
  width: 360px;
  height: 360px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 260'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='50%25' x2='50%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f44336'/%3E%3Cstop offset='100%25' stop-color='%23d32f2f'/%3E%3C/linearGradient%3E%3ClinearGradient id='lg' x1='0%25' x2='100%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%232e7d32'/%3E%3Cstop offset='100%25' stop-color='%234caf50'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='130' cy='140' r='85' fill='url(%23g)'/%3E%3Cpath d='M110 60 C130 40 150 40 155 60 C170 55 180 65 178 80 C190 90 205 100 210 120 C212 140 205 160 185 167 C190 192 170 210 140 210 C110 210 90 190 90 160 C70 157 60 138 68 120 C70 95 85 85 110 80 Z' fill='url(%23lg)'/%3E%3Cpath d='M150 95 C155 85 170 85 175 95 C178 105 173 112 165 113 C157 115 150 108 150 95 Z' fill='%23fce4ec' opacity='0.7'/%3E%3C/svg%3E");
}

.fruit-lemon {
  top: 50%;
  left: -10%;
  width: 420px;
  height: 240px;
  transform: rotate(8deg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 240'%3E%3Cdefs%3E%3ClinearGradient id='y' x1='0%25' x2='100%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fff176'/%3E%3Cstop offset='100%25' stop-color='%23fbc02d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='210' cy='120' rx='190' ry='95' fill='url(%23y)'/%3E%3Cpath d='M80 55 C120 20 170 20 220 45 C230 35 250 25 275 35 C300 45 305 70 290 85 C260 75 235 60 215 60 C190 60 170 75 160 100 C130 95 95 85 80 55 Z' fill='%23fdd835'/%3E%3C/svg%3E");
}

.fruit-berry {
  top: 4%;
  right: 8%;
  width: 320px;
  height: 360px;
  transform: rotate(-10deg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 320'%3E%3Cdefs%3E%3ClinearGradient id='r' x1='0%25' x2='0%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ef5350'/%3E%3Cstop offset='100%25' stop-color='%23c62828'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M130 20 C170 20 210 60 220 110 C230 160 210 210 170 260 C140 300 100 300 70 260 C30 210 10 160 20 110 C30 60 90 20 130 20 Z' fill='url(%23r)'/%3E%3Cpath d='M100 110 C98 104 102 96 112 95 C122 94 130 102 128 110 C126 118 118 124 110 122 C102 120 101 116 100 110 Z M140 140 C138 134 142 126 152 125 C162 124 170 132 168 140 C166 148 158 154 150 152 C142 150 141 146 140 140 Z M120 170 C118 164 122 156 132 155 C142 154 150 162 148 170 C146 178 138 184 130 182 C122 180 121 176 120 170 Z' fill='%23ffebee' opacity='0.8'/%3E%3C/svg%3E");
}

.fruit-melon {
  bottom: 8%;
  right: 12%;
  width: 420px;
  height: 260px;
  transform: rotate(6deg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 260'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' x2='0%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff8a65'/%3E%3Cstop offset='100%25' stop-color='%23ff7043'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M20 140 C20 65 85 20 210 20 C335 20 400 65 400 140 C400 215 335 260 210 260 C85 260 20 215 20 140 Z' fill='%233e7d21'/%3E%3Cpath d='M40 140 C40 84 92 44 210 44 C328 44 380 84 380 140 C380 196 328 236 210 236 C92 236 40 196 40 140 Z' fill='url(%23g2)'/%3E%3Cpath d='M70 120 C75 90 110 80 145 95 C155 70 185 58 215 72 C235 60 265 62 280 90 C310 80 345 96 342 120 C347 150 320 170 295 155 C280 170 255 182 215 180 C175 178 130 162 110 140 C95 150 80 150 70 120 Z' fill='%231b5e20' opacity='0.7'/%3E%3C/svg%3E");
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
