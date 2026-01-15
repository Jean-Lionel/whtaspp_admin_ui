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
      :messages="currentMessages"
      :loading="loadingMessages || sendingMessage"
      @send-message="handleSendMessage"
      @send-template="handleSendTemplate"
      @send-file="handleSendFile"
    />

    <EmptyChatState v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import ChatSidebar from '@/components/whatsapp/ChatSidebar.vue'
import ChatWindow from '@/components/whatsapp/ChatWindow.vue'
import EmptyChatState from '@/components/whatsapp/EmptyChatState.vue'
import api from '@/config/axios'


const store = useStore()


const selectedChat = ref(null)
const currentMessages = ref([])
const loadingMessages = ref(false)
const sendingMessage = ref(false)

// Liste des chats (sera remplie par ChatSidebar)
const chats = ref([])






// Son de notification (optionnel)


const handleSelectChat = async (chat) => {
  selectedChat.value = chat
  chat.unreadCount = 0

  // Charger les messages de ce contact
  await loadMessages(chat.phone)
}

const loadMessages = async (phone) => {
  loadingMessages.value = true
  currentMessages.value = []

  try {
    const response = await api.get(`/message_phone/${encodeURIComponent(phone)}`)
    currentMessages.value = response.data.messages.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

const handleSendMessage = async (text) => {
  if (!selectedChat.value || sendingMessage.value) return

  sendingMessage.value = true

  try {
    const response = await api.post('/send_whatsapp', {
      to: selectedChat.value.phone,
      message: text,
      type: 'text'
    })

    if (response.data.success) {
      // Ajouter le message à la liste
      currentMessages.value.push(response.data.message)

      // Mettre à jour le dernier message dans la sidebar
      selectedChat.value.lastMessage = text
      selectedChat.value.lastMessageTime = response.data.message.time
    } else {
      console.error('Erreur WhatsApp:', response.data.error)
      alert('Erreur lors de l\'envoi: ' + response.data.error)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    alert('Erreur lors de l\'envoi du message')
  } finally {
    sendingMessage.value = false
  }
}

const handleSendTemplate = async (data) => {
  if (!selectedChat.value || sendingMessage.value) return

  sendingMessage.value = true

  try {
    const response = await api.post('/send_whatsapp', {
      to: selectedChat.value.phone,
      type: 'template',
      template_name: data.template.name,
      language: data.template.language,
      parameters: data.parameters
    })

    if (response.data.success) {
      // Ajouter le message à la liste s'il est renvoyé
      if (response.data.message) {
        currentMessages.value.push(response.data.message)
        
        // Mettre à jour la sidebar
        selectedChat.value.lastMessage = `Modèle: ${data.template.name}`
        selectedChat.value.lastMessageTime = response.data.message.time
      } else {
        // Fallback si l'API ne retourne pas le message formate
        // On pourrait recharger les messages ou ajouter un placeholder
        await loadMessages(selectedChat.value.phone)
      }
    } else {
      console.error('Erreur WhatsApp Template:', response.data.error)
      alert('Erreur lors de l\'envoi du modèle: ' + (response.data.error || 'Erreur inconnue'))
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du modèle:', error)
    alert('Erreur lors de l\'envoi du modèle')
  } finally {
    sendingMessage.value = false
  }
}

const handleSendFile = async (data) => {
  if (!selectedChat.value || sendingMessage.value) return

  sendingMessage.value = true
  const { file, caption } = data

  try {
    const formData = new FormData()
    formData.append('to', selectedChat.value.phone)
    formData.append('file', file)
    
    // Determine type roughly
    let type = 'document'
    if (file.type.startsWith('image/')) type = 'image'
    else if (file.type.startsWith('video/')) type = 'video'
    else if (file.type.startsWith('audio/')) type = 'audio'
    
    formData.append('type', type)
    
    if (caption) {
      formData.append('caption', caption)
    }

    const response = await api.post('/send_whatsapp', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      if (response.data.message) {
        currentMessages.value.push(response.data.message)
        
        // Mettre à jour la sidebar
        let icon = '📄'
        if (type === 'image') icon = '📷'
        else if (type === 'video') icon = '🎥'
        else if (type === 'audio') icon = '🎵'
        
        selectedChat.value.lastMessage = `${icon} ${caption || (type === 'document' ? file.name : type)}`
        selectedChat.value.lastMessageTime = response.data.message.time
      } else {
        await loadMessages(selectedChat.value.phone)
      }
    } else {
      console.error('Erreur WhatsApp File:', response.data.error)
      alert('Erreur lors de l\'envoi du fichier: ' + (response.data.error || 'Erreur inconnue'))
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du fichier:', error)
    alert('Erreur lors de l\'envoi du fichier')
  } finally {
    sendingMessage.value = false
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
</style>
