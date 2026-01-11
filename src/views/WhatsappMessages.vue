<template>
  <div class="whatsapp-layout">
    <!-- Left Sidebar: Chat List -->
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
          @click="selectChat(chat)"
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

    <!-- Right Side: Chat Window -->
    <div class="chat-window" v-if="selectedChat">
      <div class="chat-header">
        <div class="chat-avatar-header">
           <img :src="selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.name}&background=random`" alt="Avatar" />
        </div>
        <div class="chat-header-info">
          <div class="chat-header-name">{{ selectedChat.name }}</div>
          <div class="chat-header-status">cliquez ici pour les infos du contact</div>
        </div>
        <div class="header-icons">
          <button class="icon-btn">
             <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.9l5.1 5.1 1.5-1.5-5-5.1zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg>
          </button>
          <button class="icon-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="msg in selectedChat.messages" 
          :key="msg.id" 
          class="message-wrapper" 
          :class="{ 'message-out': msg.isMine, 'message-in': !msg.isMine }"
        >
          <div class="message-bubble">
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-meta">
              <span class="message-time">{{ msg.time }}</span>
              <span v-if="msg.isMine" class="message-status">
                <svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.473-.018l5.358-7.717a.42.42 0 0 0-.063-.518z"></path><path fill="currentColor" d="M6.8 12.048L1.616 7.076a.42.42 0 0 0-.546-.057l-.46.398a.364.364 0 0 0-.075.526l6.303 6.96h.043L6.8 12.048z"></path></svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.062 0-6.062 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.112 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path></svg>
        </button>
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.646 3.972 1.646h13.556c.506 0 .917-.411.917-.917v-13.556c0-.506-.411-.917-.917-.917H7.434c-1.503 0-2.913.584-3.972 1.646s-1.646 2.472-1.646 3.972zM13.424 7.429c.635 0 1.15.515 1.15 1.15s-.515 1.15-1.15 1.15-1.15-.515-1.15-1.15.515-1.15 1.15-1.15zM8.819 7.429c.635 0 1.15.515 1.15 1.15s-.515 1.15-1.15 1.15-1.15-.515-1.15-1.15.515-1.15 1.15-1.15zm6.547 10.97H7.434c-1.013 0-1.965-.394-2.678-1.11s-1.111-1.666-1.111-2.678v-.002c0-1.013.394-1.966 1.111-2.679s1.666-1.11 2.678-1.11h8.133v7.579z"></path></svg>
        </button>
        <div class="input-container">
          <input type="text" placeholder="Tapez un message" v-model="newMessage" @keyup.enter="sendMessage" />
        </div>
        <button class="icon-btn" @click="sendMessage">
          <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div class="chat-placeholder" v-else>
      <div class="placeholder-content">
        <div class="placeholder-image">
           <!-- Placeholder for WhatsApp web generic img -->
           <svg viewBox="0 0 250 250" width="250" height="250" fill="#e9edef" style="opacity: 0.6"><circle cx="125" cy="125" r="120"/></svg>
        </div>
        <h2>WhatsApp Web</h2>
        <p>Envoyez et recevez des messages sans avoir besoin de garder votre téléphone connecté.</p>
        <p class="encryption-note"><span class="lock-icon">🔒</span> Chiffré de bout en bout</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const searchQuery = ref('')
const selectedChat = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)

// Mock Data
const chats = ref([
  {
    id: 1,
    name: 'Jean Dev',
    lastMessage: 'On fait le point demain ?',
    lastMessageTime: '10:30',
    unreadCount: 2,
    avatar: 'https://ui-avatars.com/api/?name=Jean+Dev&background=0D8ABC&color=fff',
    messages: [
      { id: 1, text: 'Salut, ça va ?', time: '10:00', isMine: false },
      { id: 2, text: 'Ça va merci et toi ?', time: '10:01', isMine: true },
      { id: 3, text: 'Super. Tu as avancé sur le ticket ?', time: '10:02', isMine: false },
      { id: 4, text: 'Oui, presque fini.', time: '10:05', isMine: true },
      { id: 5, text: 'On fait le point demain ?', time: '10:30', isMine: false }
    ]
  },
  {
    id: 2,
    name: 'Équipe Marketing',
    lastMessage: 'Alice: Voici les visuels',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=Equipe+Marketing&background=25D366&color=fff',
    messages: [
      { id: 1, text: 'Bonjour tout le monde', time: '09:00', isMine: true },
      { id: 2, text: 'Salut !', time: '09:05', isMine: false }
    ]
  },
  {
    id: 3,
    name: 'Client A',
    lastMessage: 'Merci pour votre aide',
    lastMessageTime: 'Lundi',
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=Client+A&background=random',
    messages: [
      { id: 1, text: 'J\'ai un problème de connexion', time: '14:00', isMine: false },
      { id: 2, text: 'Je regarde ça tout de suite', time: '14:05', isMine: true },
      { id: 3, text: 'C\'est réglé !', time: '14:15', isMine: true },
      { id: 4, text: 'Merci pour votre aide', time: '14:16', isMine: false }
    ]
  },
  {
      id: 4,
      name: 'Support Technique',
      lastMessage: 'Ticket #4582 résolu',
      lastMessageTime: 'Mardi',
      unreadCount: 0,
      avatar: 'https://ui-avatars.com/api/?name=Support+Tech&background=FF5722&color=fff',
      messages: []
  },
  {
      id: 5,
      name: 'Famille',
      lastMessage: 'Bon anniversaire !',
      lastMessageTime: '01/01/2026',
      unreadCount: 5,
      avatar: 'https://ui-avatars.com/api/?name=Famille&background=9C27B0&color=fff',
      messages: []
  }
])

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value
  return chats.value.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectChat = (chat) => {
  selectedChat.value = chat
  chat.unreadCount = 0 // Mark as read
  scrollToBottom()
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedChat.value) return
  
  const now = new Date()
  const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  
  selectedChat.value.messages.push({
    id: Date.now(),
    text: newMessage.value,
    time: timeString,
    isMine: true
  })
  
  // Update last message in sidebar
  selectedChat.value.lastMessage = newMessage.value
  selectedChat.value.lastMessageTime = timeString
  
  newMessage.value = ''
  scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.whatsapp-layout {
  display: flex;
  height: calc(100vh - 100px); /* Adjust based on top bar height */
  background-color: #d1d7db;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,.06), 0 2px 5px 0 rgba(0,0,0,.2);
}

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

/* Chat Window Styles */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #efeae2;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); /* WhatsApp Doodle Bg */
  background-repeat: repeat;
  background-size: 400px;
}

.chat-header {
  height: 60px;
  padding: 10px 16px;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-left: 1px solid #dba6a630;
}

.chat-avatar-header {
  margin-right: 15px;
  cursor: pointer;
}

.chat-avatar-header img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.chat-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
}

.chat-header-name {
  font-size: 1rem;
  color: #111b21;
  font-weight: 500;
}

.chat-header-status {
  font-size: 0.8rem;
  color: #667781;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-wrapper {
  display: flex;
  margin-bottom: 2px;
  width: 100%;
}

.message-in {
  justify-content: flex-start;
}

.message-out {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 65%;
  padding: 6px 7px 8px 9px;
  border-radius: 7.5px;
  position: relative;
  box-shadow: 0 1px 0.5px rgba(11,20,26,.13);
  font-size: 14.2px;
  line-height: 19px;
  color: #111b21;
}

.message-in .message-bubble {
  background-color: white;
  border-top-left-radius: 0;
}

.message-out .message-bubble {
  background-color: #d9fdd3;
  border-top-right-radius: 0;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: -4px; /* Slight overlap for compactness */
  float: right;
  margin-left: 8px;
  padding-top: 4px; /* spacing fix */
}

.message-time {
  font-size: 11px;
  color: #667781;
  margin-top: 5px;
}

.message-status {
  color: #53bdeb; /* Blue ticks */
  display: flex;
  align-items: center;
}

/* Chat Input Area */
.chat-input-area {
  min-height: 62px;
  background-color: #f0f2f5;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.input-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
}

.input-container input {
  border: none;
  width: 100%;
  outline: none;
  font-size: 15px;
  max-height: 100px;
}

/* Placeholder */
.chat-placeholder {
  flex: 1;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
  border-bottom: 6px solid #25d366; 
}

.placeholder-image {
  margin-bottom: 28px;
}

.chat-placeholder h2 {
  font-weight: 300;
  color: #41525d;
  font-size: 32px;
  margin-bottom: 18px;
}

.chat-placeholder p {
  color: #667781;
  font-size: 14px;
  max-width: 500px;
  line-height: 20px;
  margin-bottom: 30px;
}

.encryption-note {
  font-size: 13px;
  color: #8696a0;
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Transitions */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: rgba(11,20,26,.2);
}

@media (max-width: 900px) {
  .sidebar {
    width: 35%;
  }
}
</style>
