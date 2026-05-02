design ai made
<script setup lang="ts">
interface Props {
  hoverable?: boolean
  glass?: boolean
  padding?: string
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  glass: true,
  padding: '24px'
})
</script>

<template>
  <div
    class="ui-card"
    :class="{ hoverable, glass }"
    :style="{ padding }"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.ui-card {
  border-radius: 24px;
  border: 1px solid var(--panel-border);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
}

.glass {
  background: linear-gradient(145deg, var(--bg-secondary), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.hoverable:hover {
  transform: translateY(-8px);
  border-color: var(--blue);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

[data-theme='light'] .glass {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
}
</style>
