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

    <div class="chat-list">
      <div 
        v-for="chat in filteredChats" 
        :key="chat.id" 
        class="chat-item" 
        :class="{ active: selectedChat && selectedChat.id === chat.id }"
        @click="$emit('select-chat', chat)"
      >
        <div class="chat-avatar">
          <img :src="chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}&background=random`" alt="Avatar" />
        </div>
        <div class="chat-info">
          <div class="chat-top-row">
            <span class="chat-name">{{ chat.name }}</span>
            <span class="chat-time">{{ chat.lastMessageTime }}</span>
          </div>
          <div class="chat-bottom-row">
            <span class="chat-last-message">{{ chat.lastMessage }}</span>
            <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  chats: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedChat: {
    type: Object,
    default: null
  }
})

defineEmits(['select-chat'])

const searchQuery = ref('')

const filteredChats = computed(() => {
  if (!searchQuery.value) return props.chats
  return props.chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
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

@media (max-width: 900px) {
  .sidebar {
    width: 35%;
  }
}
</style>
