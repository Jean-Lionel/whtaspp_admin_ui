<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="user-avatar">
        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="User Avatar" />
      </div>
      <div class="header-icons">
        <button class="icon-btn" title="Nouveau groupe" @click="showCreateGroup = true">
          <i class="bi bi-people-fill"></i>
        </button>
        <button class="icon-btn" title="Menu">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
        </button>
      </div>
    </div>

    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 1 0-5.56 5.561l.219.22h.635l5.44 5.44 1.62-1.62-5.498-5.382zm-9.228-5.38a3.879 3.879 0 1 1 3.879 3.879 3.882 3.882 0 0 1-3.879-3.879z"></path></svg>
        </span>
        <input type="text" placeholder="Rechercher ou demarrer une discussion" v-model="searchQuery" />
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button
        class="filter-tab"
        :class="{ active: activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Tout
      </button>
      <button
        class="filter-tab"
        :class="{ active: activeFilter === 'contacts' }"
        @click="activeFilter = 'contacts'"
      >
        Contacts
      </button>
      <button
        class="filter-tab"
        :class="{ active: activeFilter === 'groups' }"
        @click="activeFilter = 'groups'"
      >
        Groupes
      </button>
    </div>

    <div class="chat-list" @scroll="handleScroll">
      <SidebarItem
        v-for="item in filteredItems"
        :key="`${item.type}-${item.id}`"
        :item="item"
        :selected="isSelected(item)"
        @click="handleSelectItem"
      />

      <div v-if="loading && filteredItems.length === 0" class="loading-spinner">
        <svg viewBox="0 0 24 24" width="24" height="24" class="spinner-icon"><path fill="currentColor" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path></svg>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <i class="bi bi-chat-text"></i>
        <p>Aucune conversation</p>
      </div>
    </div>

    <!-- Modal de creation de groupe -->
    <GroupCreateModal
      v-if="showCreateGroup"
      @close="showCreateGroup = false"
      @created="handleGroupCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import GroupCreateModal from './GroupCreateModal.vue'

const store = useStore()
const router = useRouter()
const searchQuery = ref('')
const loading = ref(false)
const activeFilter = ref('all')
const showCreateGroup = ref(false)
//const sidebarData = ref([])

const props = defineProps({
  selectedChat: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-chat', 'select-group'])

onMounted(() => {
  fetchSidebarData()
})

const fetchSidebarData = async () => {
  loading.value = true
  try {
    await store.dispatch('fetchSidebar')
  } catch (error) {
    console.error('Error fetching sidebar:', error)
  } finally {
    loading.value = false
  }
}

const filteredItems = computed(() => {
  let items = store.getters.sidebarItems || []

  // Filter by type
  if (activeFilter.value === 'contacts') {
    items = items.filter(item => item.type === 'contact')
  } else if (activeFilter.value === 'groups') {
    items = items.filter(item => item.type === 'group')
  }

  // Filter by search query
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase()
    items = items.filter(item => {
      const nameMatch = item.name && item.name.toLowerCase().includes(term)
      const phoneMatch = item.phone && item.phone.includes(term)
      return nameMatch || phoneMatch
    })
  }

  return items
})

const isSelected = (item) => {
  if (!props.selectedChat) return false
  return props.selectedChat.type === item.type && props.selectedChat.id === item.id
}

const handleSelectItem = (item) => {
  if (item.type === 'group') {
    emit('select-group', item)
    router.push(`/groups/${item.id}`)
  } else {
    emit('select-chat', {
      ...item,
      id: item.id || item.phone,
      name: item.name,
      phone: item.phone,
      lastMessage: item.last_message,
      lastMessageTime: item.last_message_at,
      unreadCount: item.unread_count,
      avatar: item.avatar
    })
  }
}

const handleGroupCreated = (group) => {
  showCreateGroup.value = false
  // Add the new group to the sidebar
  store.commit('ADD_SIDEBAR_ITEM', {
    ...group,
    type: 'group',
    last_message: null,
    last_message_at: group.created_at
  })
  // Navigate to the group
  router.push(`/groups/${group.id}`)
}

let scrollTimeout = null
const handleScroll = (e) => {
  // Scroll handling for future pagination if needed
}

onUnmounted(() => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})

// Expose refresh method for parent components
defineExpose({
  refresh: fetchSidebarData
})
</script>

<style scoped>
.sidebar {
  width: 30%;
  max-width: 420px;
  min-width: 300px;
  background-color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9edef;
  z-index: 100;
  height: 100%;
}

.sidebar-header {
  padding: 10px 16px;
  background-color: #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.header-icons {
  display: flex;
  gap: 12px;
  color: #54656f;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #54656f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background-color 0.15s ease;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.search-bar {
  background-color: white;
  padding: 8px 12px;
  border-bottom: 1px solid #e9edef;
}

.search-input-wrapper {
  background-color: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 35px;
}

.search-icon {
  color: #54656f;
  margin-right: 15px;
  margin-top: 4px;
}

.search-input-wrapper input {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
  color: #3b4a54;
}

.filter-tabs {
  display: flex;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #e9edef;
  background-color: white;
}

.filter-tab {
  padding: 6px 14px;
  border: none;
  border-radius: 20px;
  background-color: #f0f2f5;
  color: #54656f;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-tab:hover {
  background-color: #e9edef;
}

.filter-tab.active {
  background-color: #e7fce8;
  color: #00a884;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: white;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  color: #25d366;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #667781;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .sidebar {
    width: 35%;
  }
}
</style>
