<template>
  <div class="chat-window">
    <div class="chat-header">
      <div class="chat-avatar-header">
         <img :src="chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}&background=random`" alt="Avatar" />
      </div>
      <div class="chat-header-info">
        <div class="chat-header-name">{{ chat.name }}</div>
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
        v-for="msg in chat.messages" 
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
        <input type="text" placeholder="Tapez un message" v-model="newMessage" @keyup.enter="handleSend" />
      </div>
      <button class="icon-btn" @click="handleSend">
        <svg viewBox="0 0 24 24" width="24" height="24" class=""><path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['send-message'])

const newMessage = ref('')
const messagesContainer = ref(null)

const handleSend = () => {
  if (!newMessage.value.trim()) return
  emit('send-message', newMessage.value)
  newMessage.value = ''
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for changes in messages array (length) or if the chat itself changes
watch(() => props.chat.messages.length, scrollToBottom)
watch(() => props.chat.id, scrollToBottom)

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
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
</style>
