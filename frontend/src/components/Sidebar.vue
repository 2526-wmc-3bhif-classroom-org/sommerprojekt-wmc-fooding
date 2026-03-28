<template>
  <aside class="sidebar">
    <div class="logo">Kitchen Management System</div>
    <nav>
      <ul>
        <li><router-link to="/" exact-active-class="active">Dashboard</router-link></li>
        <li><router-link to="/inventory" active-class="active">Vorrat</router-link></li>
        <li><router-link to="/recipes" active-class="active">Rezepte</router-link></li>
        <li><router-link to="/shopping-list" active-class="active">Einkaufsliste</router-link></li>
        <li><router-link to="/products" active-class="active">Produkte</router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #2d5a27;
  color: #f8f9f8;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.logo {
  padding: 30px 20px;
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: #ffffff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

nav ul {
  list-style: none;
  padding: 20px 0;
}

nav ul li a {
  display: block;
  padding: 15px 30px;
  color: #d1e2d0;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

nav ul li a:hover {
  background-color: rgba(255,255,255,0.1);
  color: white;
  padding-left: 35px;
}

.active {
  background-color: rgba(255,255,255,0.15);
  color: white !important;
  border-left: 6px solid #a8e063; /* Akzent-Hellgrün */
}

/* RESPONSIVE ANPASSUNGEN */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .logo {
    padding: 20px;
  }

  nav ul {
    display: flex;
    overflow-x: auto;
    padding: 0;
  }

  nav ul li {
    flex: 0 0 auto;
  }

  nav ul li a {
    padding: 15px 20px;
    white-space: nowrap;
  }

  .active {
    border-left: none;
    border-bottom: 4px solid #a8e063;
  }
}
</style>
