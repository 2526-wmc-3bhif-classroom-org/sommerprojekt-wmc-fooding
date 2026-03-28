<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div class="layout-container">
    <Sidebar />
    <div class="content-wrapper">
      <Navbar />
      <main class="content">
        <h1>Dashboard / Main View</h1>
        <p>Hier siehst du nun die Sidebar und die Navbar in Aktion.</p>
        <router-link to="/">Zurück zur einfachen Home-Seite</router-link>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fcfdfc;
  min-width: 0;
}

.content {
  padding: 40px;
  overflow-y: auto;
  color: #2d5a27;
}

h1 {
  font-weight: 700;
  margin-bottom: 10px;
}

p {
  color: #556b2f;
  margin-bottom: 20px;
}


@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
    overflow-y: auto;
  }

  .content-wrapper {
    height: auto;
    overflow: visible;
  }

  .content {
    padding: 20px;
  }
}
</style>
