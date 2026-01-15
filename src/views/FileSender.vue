<template>
  <div class="file-sender-page">
    <div class="header-section">
      <h1 class="page-title">Envoyer des Fichiers</h1>
      <p class="subtitle">Envoyez des documents, images et videos a vos contacts ou groupes</p>
    </div>

    <div class="content-grid">
      <!-- File Upload Section -->
      <div class="upload-section">
        <div 
          class="dropzone" 
          @dragover.prevent 
          @drop.prevent="handleDrop"
          :class="{ 'has-file': file }"
        >
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            class="hidden-input" 
          />
          
          <div v-if="!file" class="upload-placeholder" @click="$refs.fileInput.click()">
            <i class="bi bi-cloud-arrow-up"></i>
            <h3>Glissez-deposez un fichier ici</h3>
            <p>ou cliquez pour parcourir</p>
            <span class="limit-info">Max 100MB • Images, PDF, Video</span>
          </div>

          <div v-else class="file-preview">
            <div class="file-icon">
              <i :class="getFileIcon(file.type)"></i>
            </div>
            <div class="file-info">
              <span class="filename">{{ file.name }}</span>
              <span class="filesize">{{ formatSize(file.size) }}</span>
            </div>
            <button class="remove-btn" @click.stop="file = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div class="form-group caption-group">
          <label>Message / Legende (Optionnel)</label>
          <textarea 
            v-model="caption" 
            placeholder="Ajouter une description..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Recipients Section -->
      <div class="recipients-section">
        <div class="section-header">
          <h3>Destinataires</h3>
          <div class="recipient-tabs">
            <button 
              :class="{ active: recipientType === 'contact' }" 
              @click="recipientType = 'contact'"
            >Contacts</button>
            <button 
              :class="{ active: recipientType === 'group' }" 
              @click="recipientType = 'group'"
            >Groupes</button>
          </div>
        </div>

        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="`Rechercher des ${recipientType === 'contact' ? 'contacts' : 'groupes'}...`"
          />
        </div>

        <div class="recipients-list">
          <div 
            v-for="item in filteredRecipients" 
            :key="item.id"
            class="recipient-item"
            :class="{ selected: selectedRecipients.includes(item.id) }"
            @click="toggleRecipient(item.id)"
          >
            <div class="checkbox">
              <i class="bi bi-check" v-if="selectedRecipients.includes(item.id)"></i>
            </div>
            <div class="recipient-info">
              <span class="name">{{ item.name }}</span>
              <span class="detail">{{ item.phone || `${item.member_count} membres` }}</span>
            </div>
          </div>

          <div v-if="loadingRecipients" class="loading-state">
            <div class="spinner"></div>
          </div>
        </div>

        <div class="action-footer">
          <div class="selection-count">
            {{ selectedRecipients.length }} selectionne(s)
          </div>
          <button 
            class="send-btn" 
            @click="sendFile" 
            :disabled="!file || selectedRecipients.length === 0 || sending"
          >
            <span v-if="!sending">
              <i class="bi bi-send"></i> Envoyer
            </span>
            <span v-else>
               Envoi...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import api from '@/config/axios'

const file = ref(null)
const caption = ref('')
const recipientType = ref('contact')
const searchQuery = ref('')
const selectedRecipients = ref([])
const sending = ref(false)
const loadingRecipients = ref(false)
const contactsList = ref([])
const groupsList = ref([])

const route = useRoute()
const store = useStore()

onMounted(async () => {
  // Check for query params to pre-select
  if (route.query.type) {
    recipientType.value = route.query.type
  }
  
  await Promise.all([fetchContacts(), fetchGroups()])
  
  if (route.query.id) {
    selectedRecipients.value = [route.query.id]
    // If type wasn't specified, try to guess or use default
  }
})

const fetchContacts = async () => {
  try {
    const res = await api.get('/contacts?all=true') // Assuming all contacts endpoint
    contactsList.value = res.data.data || res.data
  } catch (e) {
    console.error('Error fetching contacts', e)
    // Mock
    contactsList.value = store.state.data.contacts.data || []
  }
}

const fetchGroups = async () => {
  try {
    const res = await api.get('/groups')
    groupsList.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  }
}

const filteredRecipients = computed(() => {
  const list = recipientType.value === 'contact' ? contactsList.value : groupsList.value
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(item => 
    item.name.toLowerCase().includes(q) || 
    (item.phone && item.phone.includes(q))
  )
})

const handleFileSelect = (event) => {
  if (event.target.files.length) {
    file.value = event.target.files[0]
  }
}

const handleDrop = (event) => {
  if (event.dataTransfer.files.length) {
    file.value = event.dataTransfer.files[0]
  }
}

const toggleRecipient = (id) => {
  const index = selectedRecipients.value.indexOf(id)
  if (index === -1) {
    selectedRecipients.value.push(id)
  } else {
    selectedRecipients.value.splice(index, 1)
  }
}

const getFileIcon = (mimeType) => {
  if (mimeType.includes('image')) return 'bi bi-file-image'
  if (mimeType.includes('pdf')) return 'bi bi-file-pdf'
  if (mimeType.includes('video')) return 'bi bi-file-play'
  return 'bi bi-file-earmark'
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const sendFile = async () => {
  if (!file.value || selectedRecipients.value.length === 0) return
  
  sending.value = true
  const formData = new FormData()
  formData.append('file', file.value)
  if (caption.value) formData.append('caption', caption.value)
  
  // Handling multiple recipients usually requires backend support for bulk or loops
  // Assuming backend accepts 'recipient_id' and 'recipient_type'
  
  try {
    // We might need to send one by one or bulk
    // For demo, let's assume one call per recipient or a bulk endpoint
    // Using a loop for safety if no bulk endpoint
    for (const id of selectedRecipients.value) {
      const data = new FormData()
      data.append('file', file.value)
      data.append('caption', caption.value)
      data.append('recipient_id', id)
      data.append('recipient_type', recipientType.value)
      
      // await api.post('/messages/send-file', data) // Hypothetical
      console.log(`Sending to ${id} (${recipientType.value})`)
    }
    
    alert('Fichier envoye avec succes!')
    file.value = null
    caption.value = ''
    selectedRecipients.value = []
  } catch (error) {
    console.error('Send failed', error)
    alert('Erreur lors de l\'envoi')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.file-sender-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin-top: 0.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  min-height: 0; /* Important for scroll */
}

/* Upload Section */
.upload-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  background: #f8fafc;
  min-height: 300px;
}

.dropzone:hover, .dropzone.has-file {
  border-color: #3b82f6;
  background: #eff6ff;
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  text-align: center;
  color: #64748b;
}

.upload-placeholder i {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  display: block;
}

.upload-placeholder h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.limit-info {
  display: block;
  font-size: 0.8rem;
  margin-top: 1rem;
  color: #94a3b8;
}

.file-preview {
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 4rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filename {
  font-weight: 600;
  color: #1e293b;
}

.filesize {
  font-size: 0.85rem;
  color: #64748b;
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.caption-group {
  margin-top: 1.5rem;
}

.caption-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
}

.caption-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
}

/* Recipients Section */
.recipients-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipient-tabs {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  gap: 4px;
}

.recipient-tabs button {
  padding: 6px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.recipient-tabs button.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-box {
  padding: 1rem 1.5rem;
  position: relative;
  border-bottom: 1px solid #f1f5f9;
}

.search-box i {
  position: absolute;
  left: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.recipients-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.recipient-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.recipient-item:hover {
  background: #f8fafc;
}

.recipient-item.selected {
  background: #eff6ff;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.recipient-item.selected .checkbox {
  background: #3b82f6;
  border-color: #3b82f6;
}

.recipient-info {
  display: flex;
  flex-direction: column;
}

.recipient-info .name {
  font-weight: 500;
  color: #1e293b;
}

.recipient-info .detail {
  font-size: 0.8rem;
  color: #94a3b8;
}

.action-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.selection-count {
  font-size: 0.9rem;
  color: #64748b;
}

.send-btn {
  background: linear-gradient(135deg, #00a884 0%, #008f6f 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(1);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 168, 132, 0.4);
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
