<template>
  <div class="layout">
    <div :class="['overlay', { show: isSidebarOpen }]" @click="toggleSidebar"></div>
    <aside :class="['sidebar', { open: isSidebarOpen }]">
      <div class="brand">
        <h2>WhatsApp Admin</h2>
        <button class="close-btn" @click="toggleSidebar">×</button>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link" @click="isSidebarOpen = false">
          <span class="icon">💬</span> Dashboard
        </router-link>
        <router-link to="/profile" class="nav-link" @click="isSidebarOpen = false">
          <span class="icon">👤</span> Profil
        </router-link>
      </nav>
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">Déconnexion</button>
      </div>
    </aside>
    <main class="main-content">
      <header class="top-bar">
        <button class="menu-toggle" @click="toggleSidebar">☰</button>
        <div class="user-info">
          <h3>Bienvenue, {{ userName }}</h3>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const userName = computed(() => store.getters.userName)

const handleLogout = () => {
  store.dispatch('logout')
  router.push('/login')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f8;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
}

/* Mobile Overlay */
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.brand {
  padding: 20px;
  background-color: #1a252f;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #25d366; /* WhatsApp Green */
}

.close-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.nav {
  flex: 1;
  padding: 20px 0;
}

.nav-link {
  display: block;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
  border-left: 4px solid #25d366;
}

.icon {
  margin-right: 10px;
}

.logout-section {
  padding: 20px;
  border-top: 1px solid #34495e;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.top-bar {
  background-color: white;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between; /* Changed for hamburger */
  align-items: center;
  height: 60px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #2c3e50;
}

.content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    width: 250px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-toggle {
    display: block;
    margin-right: 15px;
  }

  .close-btn {
    display: block;
  }

  .overlay.show {
    display: block;
  }

  .top-bar {
    justify-content: flex-start;
    padding: 10px 20px;
  }

  .user-info {
    margin-left: auto;
  }
}
</style>
