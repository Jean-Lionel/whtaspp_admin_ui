<template>
  <div class="layout">
    <div :class="['overlay', { show: isMobileOpen }]" @click="closeMobileSidebar"></div>

    <aside
      :class="['sidebar', { 'desktop-hidden': !isDesktopVisible, 'mobile-open': isMobileOpen }]"
    >
      <div class="brand">
        <h2 v-if="isDesktopVisible">WhatsApp Admin</h2>
        <h2 v-else>WA</h2>
        <!-- Mini brand when collapsed if we went that route, but here we hide it mostly or keep it? -->
        <button class="close-btn-mobile" @click="closeMobileSidebar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <nav class="nav">
        <router-link to="/" class="nav-link" @click="handleNavClick">
          <i class="bi bi-speedometer2 icon"></i>
          <span class="link-text">Dashboard</span>
        </router-link>
        <router-link
          v-for="url in urls"
          :key="url.to"
          :to="url.to"
          class="nav-link"
          @click="handleNavClick"
        >
          <i :class="url.icon"></i>
          <span class="link-text">{{ url.name }}</span>
        </router-link>
      </nav>

      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">
          <i class="bi bi-box-arrow-right icon"></i>
          <span class="link-text" v-if="isDesktopVisible">Déconnexion</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <button class="menu-toggle" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>
        <div class="user-info">
          <div class="user-badge">
            <i class="bi bi-person-circle"></i>
            <span>{{ userName }}</span>
          </div>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const urls = [
  {
    to: '/profile',
    name: 'Profile',
    icon: 'bi bi-person icon',
  },
  {
    to: '/messages',
    name: 'Messages',
    icon: 'bi bi-chat-dots icon',
  },
  {
    to: '/contacts',
    name: 'Contacts',
    icon: 'bi bi-person-lines-fill icon',
  },
  {
    to: '/groups',
    name: 'Groupes',
    icon: 'bi bi-people icon',
  },
  {
    to: '/blogs',
    name: 'Blogs',
    icon: 'bi bi-file-text icon',
  },
]

// State
const isDesktopVisible = ref(true)
const isMobileOpen = ref(false)
const isMobile = ref(false)

const userName = computed(() => store.getters.userName)

// Handlers
const handleLogout = () => {
  store.dispatch('logout')
  router.push('/login')
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isMobileOpen.value = false // Ensure mobile menu is closed on desktop
    // We keep isDesktopVisible as is, or reset it? Let's keep user preference or default
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileOpen.value = !isMobileOpen.value
  } else {
    isDesktopVisible.value = !isDesktopVisible.value
  }
}

const closeMobileSidebar = () => {
  isMobileOpen.value = false
}

const handleNavClick = () => {
  if (isMobile.value) {
    closeMobileSidebar()
  }
}

// Lifecycle
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background-color: #f8f9fa;
  overflow: hidden;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  white-space: nowrap;
}

.sidebar.desktop-hidden {
  width: 0;
  overflow: hidden;
  opacity: 0;
}

/* Brand Section */
.brand {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #25d366;
  letter-spacing: 0.5px;
}

/* Navigation */
.nav {
  flex: 1;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.nav-link.router-link-active {
  background-color: #25d366;
  color: white;
  box-shadow: 0 4px 6px rgba(37, 211, 102, 0.2);
}

.nav-link .icon {
  font-size: 1.2rem;
  margin-right: 15px;
  width: 24px;
  text-align: center;
}

/* Utils */
.close-btn-mobile {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

/* Logout */
.logout-section {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  gap: 10px;
}

.logout-btn:hover {
  background-color: #e74c3c;
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

/* Top Bar */
.top-bar {
  background-color: white;
  padding: 0 25px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  z-index: 100;
}

.menu-toggle {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #2c3e50;
  border-radius: 5px;
  padding: 5px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle:hover {
  background-color: #f1f2f6;
  color: #25d366;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f2f6;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.user-badge i {
  font-size: 1.2rem;
  color: #25d366;
}

.content {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.desktop-hidden {
    width: 280px; /* Reset width override on mobile */
    opacity: 1;
  }

  .close-btn-mobile {
    display: block;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
