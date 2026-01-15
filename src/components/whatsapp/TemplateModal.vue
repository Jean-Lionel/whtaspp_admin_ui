<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Envoyer un modèle WhatsApp</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Chargement des modèles...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchTemplates">Réessayer</button>
        </div>

        <template v-else>
          <!-- List View -->
          <div v-if="!selectedTemplate" class="templates-list-container">
            <div class="search-box">
              <input type="text" v-model="searchQuery" placeholder="Rechercher un modèle...">
            </div>
            
            <div class="templates-list">
              <div 
                v-for="tpl in filteredTemplates" 
                :key="tpl.id" 
                class="template-item" 
                @click="selectTemplate(tpl)"
              >
                <div class="tpl-main">
                  <span class="tpl-name">{{ tpl.name }}</span>
                  <span class="status-badge" :class="tpl.status.toLowerCase()">{{ tpl.status }}</span>
                </div>
                <div class="tpl-meta">
                  <span class="tpl-lang">{{ tpl.language }}</span>
                  <span class="tpl-cat">{{ tpl.category }}</span>
                </div>
              </div>
              <div v-if="filteredTemplates.length === 0" class="no-results">
                Aucun modèle trouvé
              </div>
            </div>
          </div>

          <!-- Detail/Form View -->
          <div v-else class="template-form">
            <button class="back-link" @click="selectedTemplate = null">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Retour à la liste
            </button>
            
            <div class="selected-header">
              <h4>{{ selectedTemplate.name }}</h4>
              <div class="badges">
                <span class="badge">{{ selectedTemplate.language }}</span>
                <span class="badge">{{ selectedTemplate.category }}</span>
              </div>
            </div>

            <div class="form-content">
              <div v-if="selectedTemplate.parameters && selectedTemplate.parameters.length > 0" class="parameters-section">
                <p class="section-title">Paramètres à remplir</p>
                <div class="params-grid">
                  <div v-for="param in selectedTemplate.parameters" :key="param.position" class="param-group">
                    <label>Variable {{ param.placeholder }}</label>
                    <input 
                      type="text" 
                      v-model="inputParameters[param.position]" 
                      :placeholder="`Valeur pour ${param.placeholder}`"
                    >
                  </div>
                </div>
              </div>
              <div v-else class="no-params-message">
                <svg viewBox="0 0 24 24" width="48" height="48" class="info-icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <p>Ce modèle ne nécessite aucun paramètre.</p>
                <p class="sub-text">Vous pouvez l'envoyer directement.</p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button 
          v-if="selectedTemplate" 
          class="btn-send" 
          :disabled="!isValid" 
          @click="handleSend"
        >
          Envoyer le modèle
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/config/axios'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'send-template'])

const loading = ref(false)
const error = ref(null)
const templates = ref([])
const selectedTemplate = ref(null)
const inputParameters = ref({})
const searchQuery = ref('')

const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value
  const query = searchQuery.value.toLowerCase()
  return templates.value.filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.category.toLowerCase().includes(query)
  )
})

const isValid = computed(() => {
  if (!selectedTemplate.value) return false
  if (!selectedTemplate.value.parameters || selectedTemplate.value.parameters.length === 0) return true
  
  // Check if all parameters are filled
  return selectedTemplate.value.parameters.every(p => {
    const val = inputParameters.value[p.position]
    return val && val.trim().length > 0
  })
})

const fetchTemplates = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/whatsapp-templates')
    if (response.data && response.data.success) {
      templates.value = response.data.templates
    } else {
      error.value = 'Impossible de charger les modèles'
    }
  } catch (err) {
    console.error('Error fetching templates:', err)
    error.value = 'Erreur lors du chargement des modèles'
  } finally {
    loading.value = false
  }
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
  inputParameters.value = {}
  // Initialize parameters
  if (template.parameters) {
    template.parameters.forEach(p => {
      inputParameters.value[p.position] = ''
    })
  }
}

const handleSend = () => {
  // Convert parameters object to array expected by backend if needed, or keep as is.
  // The request didn't specify the exact format for parameters in the send request, 
  // but usually it's ordered or key-based. 
  // I'll emit the raw data and let the parent handle the API formatting.
  
  const params = []
  if (selectedTemplate.value.parameters) {
    // Ensuring order by position
    const sortedParams = [...selectedTemplate.value.parameters].sort((a, b) => a.position - b.position)
    sortedParams.forEach(p => {
      params.push(inputParameters.value[p.position])
    })
  }

  emit('send-template', {
    template: selectedTemplate.value,
    parameters: params // Sending as array of values
  })
  
  // Reset and close
  selectedTemplate.value = null
  inputParameters.value = {}
  emit('close')
}

// Fetch templates when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal && templates.value.length === 0) {
    fetchTemplates()
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9edef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #111b21;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #54656f;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 15px;
  color: #54656f;
}

.templates-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-box {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  background: #fcfcfc;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e9edef;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

.search-box input:focus {
  border-color: #00a884;
}

.templates-list {
  padding: 8px 0;
}

.template-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;
}

.template-item:hover {
  background-color: #f5f6f6;
}

.tpl-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tpl-name {
  font-weight: 500;
  color: #111b21;
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e9edef;
  color: #54656f;
}

.status-badge.approved {
  background-color: #dcf8c6;
  color: #0b4f17;
}

.tpl-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #667781;
}

.template-form {
  padding: 20px;
}

.back-link {
  background: none;
  border: none;
  color: #00a884;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 0;
}

.selected-header {
  margin-bottom: 20px;
}

.selected-header h4 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #111b21;
}

.badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 12px;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  color: #54656f;
}

.section-title {
  font-weight: 500;
  color: #111b21;
  margin-bottom: 15px;
  font-size: 14px;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-group label {
  font-size: 12px;
  color: #54656f;
  font-weight: 500;
}

.param-group input {
  padding: 10px;
  border: 1px solid #e9edef;
  border-radius: 6px;
  outline: none;
}

.param-group input:focus {
  border-color: #00a884;
  box-shadow: 0 0 0 1px #00a884;
}

.no-params-message {
  text-align: center;
  color: #54656f;
  padding: 30px 0;
}

.info-icon {
  color: #e9edef;
  margin-bottom: 10px;
}

.sub-text {
  font-size: 12px;
  color: #8696a0;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9edef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #e9edef;
  background: white;
  color: #54656f;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.btn-send {
  padding: 8px 24px;
  border: none;
  background: #00a884;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.btn-send:disabled {
  background: #e9edef;
  color: #aebac1;
  cursor: not-allowed;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e9edef;
  border-top-color: #00a884;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
