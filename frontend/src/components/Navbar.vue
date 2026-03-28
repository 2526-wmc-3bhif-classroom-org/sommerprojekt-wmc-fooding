<template>
  <header class="navbar">
    <div class="search-bar">
      <input type="text" placeholder="Suchen..." v-model="searchQuery">
    </div>
    <div class="user-info">
      <span class="username">Benutzer: {{ username }}</span>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
const username = ref('Max Mustermann');

const logout = () => {
  console.log('User loggt sich aus...');
  // JWT Logout Logik folgt
};
</script>

<style scoped>
.navbar {
  height: 65px;
  background-color: #fcfdfc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 2px solid #e0e6df;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.05);
}

.search-bar input {
  padding: 10px 20px;
  border: 1px solid #d0dccf;
  border-radius: 20px;
  width: 350px;
  background-color: #ffffff;
  transition: all 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: #2d5a27;
  box-shadow: 0 0 0 2px rgba(45, 90, 39, 0.1);
}

.username {
  color: #2d5a27;
  font-weight: 600;
  margin-right: 20px;
}

.logout-btn {
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #e74c3c;
  transform: translateY(-1px);
}

/* RESPONSIVE ANPASSUNGEN */
@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;
    height: auto;
    flex-direction: column;
    gap: 10px;
    padding: 15px 20px;
  }

  .search-bar {
    width: 100%;
  }

  .search-bar input {
    width: 100%;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
