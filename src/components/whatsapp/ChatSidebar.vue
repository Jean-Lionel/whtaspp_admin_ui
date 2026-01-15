<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="user-avatar">
        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="User Avatar" />
      </div>
      <div class="header-icons">
        <button class="icon-btn" title="New Chat">
             <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3.938-3.621H7.041V7.48h10.913v1.943z"></path></svg>
        </button>
        <button class="icon-btn" title="Menu">
          <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
        </button>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 1 0-5.56 5.561l.219.22h.635l5.44 5.44 1.62-1.62-5.498-5.382zm-9.228-5.38a3.879 3.879 0 1 1 3.879 3.879 3.882 3.882 0 0 1-3.879-3.879z"></path></svg>
        </span>
        <input type="text" placeholder="Rechercher ou démarrer une discussion" v-model="searchQuery" />
      </div>
    </div>

    <div class="chat-list" @scroll="handleScroll">
      <div 
        v-for="chat in filteredChats" 
        :key="chat.id || chat.phone" 
        class="chat-item" 
        :class="{ active: selectedChat && selectedChat.id === chat.id }"
        @click="$emit('select-chat', chat)"
      >
        <div class="chat-avatar">
          <img :src="chat.avatar || `https://ui-avatars.com/api/?name=${chat.name || chat.phone}&background=random`" alt="Avatar" />
        </div>
        <div class="chat-info">
          <div class="chat-top-row">
            <span class="chat-name">{{ chat.name || chat.phone }}</span>
            <span class="chat-time">{{ formatTime(chat.lastMessageTime) }}</span>
          </div>
          <div class="chat-bottom-row">
            <span class="chat-last-message">{{ chat.lastMessage }}</span>
            <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading-spinner">
        <svg viewBox="0 0 24 24" width="24" height="24" class="spinner-icon"><path fill="currentColor" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path></svg>
      </div>
      <div v-else-if="!hasMore && filteredChats.length > 0" class="end-of-list">
        Fin de la liste
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/config/axios';
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore();
const searchQuery = ref('');
const loading = ref(false);
const hasMore = ref(true);

const props = defineProps({
  chats: {
    type: Array,
    default: () => []
  },
  selectedChat: {
    type: Object,
    default: null
  }
})

defineEmits(['select-chat'])

onMounted(() => {
  getChats();
});

const getChats = (page = 1) => {
  loading.value = true;
  api.get('/side_bar_contacts', {
    params: {
      page: page
    }
  })
    .then(response => {
      store.state.data.chatsContacts = response.data;
      // Vérifier s'il y a plus de pages
      hasMore.value = response.data.current_page < response.data.last_page;
    })
    .catch(error => {
      console.error('Error fetching chats:', error);
    })
    .finally(() => {
      loading.value = false;
    });
}

const chatsContacts = computed(() => {
  return store.state.data.chatsContacts || {};
})

const filteredChats = computed(() => {
  const sourceData = chatsContacts.value.data || [];

  const formattedData = sourceData.map(chat => ({
    ...chat,
    id: chat.id || chat.phone,
    name: chat.name,
    phone: chat.phone,
    lastMessage: chat.last_message,
    lastMessageTime: chat.last_message_at,
    unreadCount: chat.unread_count,
    avatar: chat.avatar
  }));

  if (!searchQuery.value) return formattedData;

  return formattedData.filter(chat => {
    const term = searchQuery.value.toLowerCase();
    const nameMatch = chat.name && chat.name.toLowerCase().includes(term);
    const phoneMatch = chat.phone && chat.phone.includes(term);
    return nameMatch || phoneMatch;
  });
})

let scrollTimeout = null;
const handleScroll = (e) => {
  if (loading.value || !hasMore.value) return;
  if (scrollTimeout) return;

  scrollTimeout = setTimeout(() => {
    const element = e.target;
    // Check if close to bottom (100px threshold)
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 100) {
      loadMoreChats();
    }
    scrollTimeout = null;
  }, 100);
}

const loadMoreChats = () => {
  if (loading.value || !hasMore.value) return;

  const metadata = chatsContacts.value;
  if (!metadata || !metadata.current_page) return;

  const currentPage = parseInt(metadata.current_page);
  const lastPage = parseInt(metadata.last_page);

  // Stop if we are already at the last page
  if (currentPage >= lastPage) {
    hasMore.value = false;
    return;
  }

  const nextPage = currentPage + 1;
  console.log(`Loading page ${nextPage} of ${lastPage}`);

  loading.value = true;

  api.get("/side_bar_contacts", {
    params: {
      page: nextPage
    }
  })
    .then(response => {
      const newData = response.data;
      const currentChats = store.state.data.chatsContacts.data || [];

      console.log('Loaded new chats:', newData.data.length);

      // Update store with new data and new metadata (e.g. current_page becomes 2, etc.)
      store.state.data.chatsContacts = {
        ...newData,
        data: [...currentChats, ...newData.data]
      };

      // Mettre à jour hasMore
      hasMore.value = newData.current_page < newData.last_page;
    })
    .catch(error => {
      console.error("Error loading more chats", error);
    })
    .finally(() => {
      loading.value = false;
    });
}

// Nettoyer le timeout au démontage
onUnmounted(() => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
})

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
/* Sidebar Styles */
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
  gap: 20px;
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

.chat-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: white;
}

.chat-item {
  display: flex;
  padding: 0 15px;
  height: 72px;
  cursor: pointer;
  align-items: center;
  position: relative;
}

.chat-item:hover {
  background-color: #f5f6f6;
}

.chat-item.active {
  background-color: #f0f2f5;
}

.chat-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

.chat-avatar img {
  width: 49px;
  height: 49px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  border-bottom: 1px solid #e9edef;
  padding-right: 15px;
  min-width: 0; /* allows text truncation */
}

.chat-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 3px;
}

.chat-name {
  font-size: 1.05rem;
  color: #111b21;
  font-weight: 500; /* slightly bolder */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 0.75rem;
  color: #667781;
  flex-shrink: 0;
}

.chat-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-last-message {
  font-size: 0.85rem;
  color: #667781;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-badge {
  background-color: #25d366;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  flex-shrink: 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  color: #25d366;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.end-of-list {
  text-align: center;
  padding: 15px;
  color: #667781;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .sidebar {
    width: 35%;
  }
}
</style>
