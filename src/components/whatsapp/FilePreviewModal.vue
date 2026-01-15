<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Aperçu du fichier</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="preview-body">
        <div v-if="previewUrl" class="media-preview">
          <img v-if="isImage" :src="previewUrl" alt="Preview" />
          <video v-else-if="isVideo" :src="previewUrl" controls></video>
          <div v-else class="doc-preview">
            <div class="doc-icon">📄</div>
            <div class="doc-name">{{ file?.name }}</div>
            <div class="doc-size">{{ formatSize(file?.size) }}</div>
          </div>
        </div>

        <div class="caption-input">
          <input 
            type="text" 
            v-model="message" 
            placeholder="Ajouter un message..."
            @keyup.enter="handleSend"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button class="btn-send" @click="handleSend">
          <span class="send-icon">➤</span> Envoyer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  file: File
})

const emit = defineEmits(['close', 'send'])

const message = ref('')
const previewUrl = ref(null)

const isImage = computed(() => props.file?.type.startsWith('image/'))
const isVideo = computed(() => props.file?.type.startsWith('video/'))

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSend = () => {
  emit('send', { file: props.file, message: message.value })
  message.value = '' // Reset message
}

watch(() => props.file, (newFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  
  if (newFile) {
    previewUrl.value = URL.createObjectURL(newFile)
  }
  message.value = ''
}, { immediate: true })

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #00a884;
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.preview-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background-color: #efeae2;
}

.media-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: rgba(0,0,0,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.media-preview img, .media-preview video {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.doc-preview {
  text-align: center;
  padding: 20px;
}

.doc-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.doc-name {
  font-weight: 500;
  margin-bottom: 5px;
  word-break: break-all;
}

.doc-size {
  color: #666;
  font-size: 0.9rem;
}

.caption-input {
  width: 100%;
}

.caption-input input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 1rem;
}

.caption-input input:focus {
  border-color: #00a884;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f0f2f5;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.btn-send {
  padding: 8px 20px;
  background-color: #00a884;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-send:hover {
  background-color: #008f6f;
}

.send-icon {
  font-size: 0.9em;
}
</style>
