<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <div id="main-scene">
      <h1>Welcome to Fooding!</h1>
    </div>

    <div>
      <button class="btn-style"></button>
      <button class="btn-style"></button>
      <button class="btn-style"></button>
      <button class="btn-style"></button>
    </div>
  </main>
</template>
<style>
#main-scene {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

}
.btn-style {
  width: calc(100% - 20px);
  margin: 0 10px;
}
</style>
