<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Menu, 
  X, 
  Home, 
  Box, 
  ChefHat, 
  ShoppingCart, 
  Moon, 
  Sun,
  Utensils,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-vue-next'
import { themeStore } from '@/store/theme'
import { authService } from '@/services/auth'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'

interface Props {
  recede?: boolean
}

defineProps<Props>()

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isProfileOpen = ref(false)

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Inventar', path: '/inventory', icon: Box },
  { name: 'Rezepte', path: '/recipes', icon: ChefHat },
  { name: 'Einkaufsliste', path: '/shopping-list', icon: ShoppingCart },
]

const isAuthenticated = computed(() => authService.isAuthenticated)
const user = computed(() => authService.user)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const navigate = (path: string) => {
  router.push(path)
  isMenuOpen.value = false
  isProfileOpen.value = false
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const handleLogout = () => {
  authService.logout()
  isProfileOpen.value = false
  router.push('/')
}
</script>

<template>
  <nav class="navbar glass" :class="{ recede }">
    <div class="nav-container">
      <div class="nav-logo" @click="navigate('/')">
        <div class="logo-icon">
          <Utensils :size="24" />
        </div>
        <span class="logo-text">FOODING</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-links-desktop">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: route.path === item.path }"
        >
          <component :is="item.icon" :size="18" v-if="item.icon" />
          {{ item.name }}
        </router-link>
      </div>

      <div class="nav-actions">
        <button class="theme-toggle-btn" @click="toggleTheme" aria-label="Toggle Theme">
          <Sun v-if="themeStore.theme === 'dark'" :size="20" />
          <Moon v-else :size="20" />
        </button>

        <template v-if="!isAuthenticated">
          <div class="auth-buttons">
            <button class="nav-btn-outline" @click="navigate('/login')">
              <LogIn :size="18" />
              <span>Login</span>
            </button>
            <button class="nav-btn-filled" @click="navigate('/login')">
              <UserPlus :size="18" />
              <span>Registrieren</span>
            </button>
          </div>
        </template>
        
        <template v-else>
          <div class="profile-section">
            <div class="user-avatar" @click="toggleProfile">
              <div class="avatar-placeholder">
                {{ user?.email.charAt(0).toUpperCase() || 'U' }}
              </div>
              <ChevronDown :size="14" class="chevron" :class="{ open: isProfileOpen }" />
            </div>

            <!-- Profile Dropdown -->
            <transition name="pop">
              <div v-if="isProfileOpen" class="profile-dropdown glass">
                <div class="dropdown-header">
                  <p class="user-name">User</p>
                  <p class="user-email">{{ user?.email }}</p>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" @click="navigate('/profile')">
                  <UserIcon :size="18" />
                  Mein Profil
                </button>
                <button class="dropdown-item logout" @click="handleLogout">
                  <LogOut :size="18" />
                  Abmelden
                </button>
              </div>
            </transition>
          </div>
        </template>

        <button class="mobile-menu-toggle" @click="toggleMenu">
          <Menu v-if="!isMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition name="slide-down">
      <div v-if="isMenuOpen" class="mobile-nav glass">
        <div class="mobile-nav-links">
          <div 
            v-for="item in navItems" 
            :key="item.path"
            class="mobile-nav-item"
            :class="{ active: route.path === item.path }"
            @click="navigate(item.path)"
          >
            <component :is="item.icon" :size="20" />
            <span>{{ item.name }}</span>
          </div>
          
          <template v-if="!isAuthenticated">
            <div class="mobile-nav-item login" @click="navigate('/login')">
              <LogIn :size="20" />
              <span>Login</span>
            </div>
            <div class="mobile-nav-item register" @click="navigate('/login')">
              <UserPlus :size="20" />
              <span>Registrieren</span>
            </div>
          </template>
          <template v-else>
            <div class="mobile-nav-item profile" @click="navigate('/profile')">
              <UserIcon :size="20" />
              <span>Mein Profil ({{ user?.email }})</span>
            </div>
            <div class="mobile-nav-item logout" @click="handleLogout">
              <LogOut :size="20" />
              <span>Abmelden</span>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 1200px;
  height: 74px;
  z-index: 1000;
  border-radius: 22px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  border: 1px solid var(--panel-border);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.navbar.recede {
  transform: translateX(-50%) translateY(-10px) scale(0.98);
  opacity: 0.5;
  filter: blur(2px);
  z-index: 10;
  pointer-events: none;
}

.nav-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--green), var(--green-strong));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
}

.nav-links-desktop {
  display: none;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 16px;
  border: 1px solid var(--panel-border);
}

@media (min-width: 900px) {
  .nav-links-desktop {
    display: flex;
  }
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
  color: white;
  background: var(--green);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-buttons {
  display: none;
  gap: 12px;
}

@media (min-width: 640px) {
  .auth-buttons {
    display: flex;
  }
}

.nav-btn-outline {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--panel-border);
  padding: 8px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.nav-btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--green);
}

.nav-btn-filled {
  background: var(--green);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.nav-btn-filled:hover {
  background: var(--green-strong);
  transform: translateY(-1px);
}

.profile-section {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--green);
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.3s;
}

.chevron.open {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 240px;
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  padding: 16px;
  z-index: 1001;
  box-shadow: var(--shadow-lg);
}

.dropdown-header {
  padding: 4px 8px 12px;
}

.user-name {
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.dropdown-divider {
  height: 1px;
  background: var(--panel-border);
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
}

.mobile-menu-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  color: var(--text-main);
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
}

@media (min-width: 900px) {
  .mobile-menu-toggle {
    display: none;
  }
}

.mobile-nav {
  position: absolute;
  top: 84px;
  left: 0;
  width: 100%;
  border-radius: 22px;
  border: 1px solid var(--panel-border);
  padding: 12px;
  overflow: hidden;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.mobile-nav-item:hover, .mobile-nav-item.active {
  background: rgba(34, 197, 94, 0.1);
  color: var(--text-main);
}

.mobile-nav-item.active {
  color: var(--green);
}

.mobile-nav-item.login { margin-top: 6px; border: 1px solid var(--panel-border); }
.mobile-nav-item.register { background: var(--green); color: white; }
.mobile-nav-item.logout { color: #ef4444; border-top: 1px solid var(--panel-border); margin-top: 6px; }

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.pop-enter-active, .pop-leave-active {
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.glass {
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>
