<template>
  <div class="templates-page">
    <div class="header-section">
      <h1 class="page-title">Templates</h1>
      <button class="btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i> Nouveau Template
      </button>
    </div>

    <div class="templates-grid">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="templates.length === 0" class="empty-state">
        <i class="bi bi-file-text"></i>
        <p>Aucun template trouve</p>
      </div>

      <div v-else class="template-card" v-for="template in templates?.templates" :key="template.id">
        <div class="card-header">
          <h3>{{ template.name }}</h3>
          <span class="badge" :class="template.status">{{ template.status }}</span>
        </div>
        <div class="card-body">
          <p class="template-text">{{ template.components?.[0]?.text || 'No text preview' }}</p>
          <div class="template-meta">
            <span><i class="bi bi-translate"></i> {{ template.language }}</span>
            <span><i class="bi bi-grid"></i> {{ template.category }}</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-icon" @click="editTemplate(template)" title="Modifier">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-icon delete" @click="deleteTemplate(template.id)" title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Create/Edit would go here -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/config/axios'
import { useStore } from 'vuex'


const loading = ref(false)
const store = useStore()

onMounted(() => {
  fetchTemplates()
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    const response = await api.get('/whatsapp-templates') // Assuming endpoint exists
    store.state.data.templates = response.data || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    // Mock data for UI demonstration since backend might not be ready
    store.state.data.templates = [
      { id: 1, name: 'hello_world', status: 'approved', language: 'en_US', category: 'UTILITY', components: [{ type: 'BODY', text: 'Hello World' }] }
    ]
  } finally {
    loading.value = false
  }
}

const templates = computed(() => store.state.data.templates)
const openCreateModal = () => {
  alert('Fonctionnalite de creation de template a implementer')
}

const editTemplate = (template) => {
  console.log('Edit', template)
}

const deleteTemplate = async (id) => {
  if(confirm('Supprimer ce template ?')) {
    // await api.delete(`/templates/${id}`)
    fetchTemplates()
  }
}
</script>

<style scoped>
.templates-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #334155;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: #e2e8f0;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.badge.approved {
  background: #dcfce7;
  color: #166534;
}

.card-body {
  padding: 1.25rem;
}

.template-text {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  display: flex;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.template-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-footer {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}

.btn-icon.delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-primary {
  background: #00a884;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-state, .empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #00a884;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
