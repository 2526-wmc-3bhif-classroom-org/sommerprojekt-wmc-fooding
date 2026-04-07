template and script on our own, style helped ai
<template>
  <header class="navbar">
    <div class="navbar-left">
      <div class="brand">
        <span class="brand-name">Fooding</span>
      </div>

      <nav class="nav-links">
        <router-link to="/" class="nav-link" exact-active-class="active">Home</router-link>
        <router-link to="/inventory" class="nav-link" active-class="active">Vorrat</router-link>
        <router-link to="/recipes" class="nav-link" active-class="active">Rezepte</router-link>
        <router-link to="/shopping-list" class="nav-link" active-class="active">Einkaufsliste</router-link>
      </nav>
    </div>

    <div class="navbar-right">
      <div class="search-bar">
        <input type="text" placeholder="Suchen..." v-model="searchQuery">
      </div>

      <!-- Theme Toggle -->
      <button
        class="theme-toggle"
        @click="themeStore.toggleTheme"
        :title="themeStore.theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'"
      >
        <span v-if="themeStore.theme === 'dark'">☀️</span>
        <span v-else>🌙</span>
      </button>

      <div class="user-info">
        <span class="username">{{ authService.user?.email || 'Benutzer' }}</span>
        <button v-if="authService.isAuthenticated" @click="handleLogout" class="logout-btn">Logout</button>
        <button v-else @click="handleLogin" class="login-btn-nav">Login</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { themeStore } from '@/store/theme';
import { authService } from '@/services/auth';

const router = useRouter();
const searchQuery = ref('');

const handleLogout = () => {
  authService.logout();
  router.push('/');
};

const handleLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  height: 70px;
  background-color: var(--navbar-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  z-index: 1000;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-emoji { font-size: 1.8rem; }
.brand-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 600;
  font-size: 1rem;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  opacity: 0.8;
}

.nav-link:hover {
  opacity: 1;
  background-color: rgba(0,0,0,0.05);
}

.nav-link.active {
  opacity: 1;
  color: #2d5a27;
  background-color: rgba(45, 90, 39, 0.1);
}

[data-theme='dark'] .nav-link.active {
  color: #a8e063;
  background-color: rgba(168, 224, 99, 0.1);
}

.search-bar input {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  width: 200px;
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s;
}

.search-bar input:focus {
  width: 250px;
  outline: none;
  border-color: #2d5a27;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.theme-toggle:hover { background-color: rgba(0,0,0,0.05); }

.user-info { display: flex; align-items: center; gap: 15px; }
.username { font-size: 0.9rem; font-weight: 500; }

.logout-btn {
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.logout-btn:hover { background-color: #e74c3c; }

.login-btn-nav {
  background-color: #2d5a27;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.login-btn-nav:hover { background-color: #3e7a36; }

/* Theme specific local variables */
.navbar {
  --border-color: #e0e6df;
  --input-bg: #ffffff;
}

[data-theme='dark'] .navbar {
  --border-color: #3d3d3d;
  --input-bg: #2a2a2a;
}

@media (max-width: 1024px) {
  .brand-name, .search-bar { display: none; }
}

@media (max-width: 768px) {
  .navbar { height: auto; padding: 15px; flex-direction: column; gap: 15px; }
  .nav-links { flex-wrap: wrap; justify-content: center; gap: 10px; }
  .navbar-left, .navbar-right { width: 100%; justify-content: center; }
}
</style>
