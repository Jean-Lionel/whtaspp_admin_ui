<template>
  <div class="whatsapp-layout">
    <ChatSidebar 
      :chats="chats" 
      :selectedChat="selectedChat" 
      @select-chat="handleSelectChat"
    />
    
    <ChatWindow 
      v-if="selectedChat" 
      :chat="selectedChat" 
      @send-message="handleSendMessage"
    />
    
    <EmptyChatState v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatSidebar from '@/components/whatsapp/ChatSidebar.vue'
import ChatWindow from '@/components/whatsapp/ChatWindow.vue'
import EmptyChatState from '@/components/whatsapp/EmptyChatState.vue'

const selectedChat = ref(null)

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

const handleSelectChat = (chat) => {
  selectedChat.value = chat
  chat.unreadCount = 0 // Mark as read
}

const handleSendMessage = (text) => {
  if (!selectedChat.value) return
  
  const now = new Date()
  const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  
  // Format des données pour le backend (Payload)
  const messagePayload = {
    chat_id: selectedChat.value.id,
    content: text,
    timestamp: now.toISOString(),
    sender_id: 1, // ID de l'admin
    type: 'text'
  }

  console.log('Payload prêt pour le backend:', messagePayload)
  
  selectedChat.value.messages.push({
    id: Date.now(),
    text: messagePayload.content,
    time: timeString,
    isMine: true
  })
  
  // Update last message in sidebar
  selectedChat.value.lastMessage = text
  selectedChat.value.lastMessageTime = timeString
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
</style>
