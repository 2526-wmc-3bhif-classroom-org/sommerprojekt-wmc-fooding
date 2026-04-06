<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { themeStore } from '@/store/theme'

const route = useRoute()
const layout = computed(() => {
     return route.meta.requiresAuth || route.path === '/' ? DefaultLayout : 'div'
})

themeStore.updateDocument()
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<style>
* {
  transition: background-color 0.2s, border-color 0.2s;
}
</style>
