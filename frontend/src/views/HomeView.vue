<script setup lang="ts">
</script>
<template>
  <div class="page">
    <h1>Dashboard</h1>
    <p>Willkommen im Kitchen Management System.</p>
    <div class="info-card">
      <p>Dies ist die Hauptseite (Main).</p>
      <router-link to="/main" class="test-link">Gehe zur Layout-Seite (Sidebar & Navbar)</router-link>
      <br><br>
      <router-link to="/inventory" class="test-link">Gehe zum Vorrat (Test-Link)</router-link>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 20px; }
.info-card {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.test-link {
  display: inline-block;
  margin-top: 15px;
  color: #27ae60;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 2px solid #27ae60;
}
</style>
