<template>
  <div class="dashboard">
    <div class="header">
      <h1>Tableau de bord - Messages</h1>
      <div class="controls">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher par expéditeur..."
          class="search-input"
        />
        <select v-model="sortBy" class="sort-select">
          <option value="desc">Plus récent</option>
          <option value="asc">Plus ancien</option>
        </select>
      </div>
    </div>

    <div v-if="loading && !whatsappData.data" class="loading-state">Chargement...</div>

    <div v-else class="message-list-card">
      <table class="message-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Expéditeur</th>
            <th>Contenu</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredMessages" :key="item.id">
            <td>
              <span :class="['type-badge', getMessageType(item)]">
                {{ getMessageType(item) }}
              </span>
            </td>
            <td class="sender">{{ getSender(item) }}</td>
            <td class="content-preview">
              <span v-if="getMessageType(item) === 'text'">{{
                truncate(getMessageContent(item), 50)
              }}</span>
              <span v-else-if="getMessageType(item) === 'document'"
                >📎 Document: {{ getMessageContent(item).filename }}</span
              >
              <span v-else-if="getMessageType(item) === 'image'">📷 Image</span>
              <span v-else-if="getMessageType(item) === 'status'">ℹ️ Mise à jour statut</span>
              <span v-else>Autre</span>
            </td>
            <td class="date">{{ formatDate(item.created_at) }}</td>
            <td>
              <span :class="['status-badge', getMessageStatus(item)]">
                {{ getMessageStatus(item) }}
              </span>
            </td>
            <td>
              <button class="btn-view" @click="viewMessage(item)">Voir</button>
            </td>
          </tr>
          <tr v-if="filteredMessages.length === 0">
            <td colspan="6" class="no-data">Aucun message trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="whatsappData.current_page">
      <button
        :disabled="!whatsappData.prev_page_url"
        @click="fetchData(whatsappData.current_page - 1)"
        class="page-btn"
      >
        &laquo; Précédent
      </button>
      <span class="page-info">
        Page {{ whatsappData.current_page }} sur {{ whatsappData.last_page }}
      </span>
      <button
        :disabled="!whatsappData.next_page_url"
        @click="fetchData(whatsappData.current_page + 1)"
        class="page-btn"
      >
        Suivant &raquo;
      </button>
    </div>

    <!-- Modal Détail -->
    <div v-if="selectedMessage" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Détail du message</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-row">
            <strong>ID:</strong> <span>{{ selectedMessage.id }}</span>
          </div>
          <div class="info-row">
            <strong>De :</strong> <span>{{ getSender(selectedMessage) }}</span>
          </div>
          <div class="info-row">
            <strong>Date :</strong> <span>{{ formatDate(selectedMessage.created_at) }}</span>
          </div>
          <div class="info-row">
            <strong>Type :</strong> <span>{{ getMessageType(selectedMessage) }}</span>
          </div>
          <hr />
          <div class="message-content">
            <p v-if="getMessageType(selectedMessage) === 'text'" class="full-message">
              {{ getMessageContent(selectedMessage) }}
            </p>
            <div
              v-else-if="getMessageType(selectedMessage) === 'document'"
              class="document-message"
            >
              <p>📎 <strong>Fichier :</strong> {{ getMessageContent(selectedMessage).filename }}</p>
              <p>
                <small>Mime Type: {{ getMessageContent(selectedMessage).mime_type }}</small>
              </p>
              <!-- Note: URL might expire or need auth not provided in this context -->
              <a
                :href="getMessageContent(selectedMessage).url"
                target="_blank"
                class="download-link"
                >Télécharger / Voir</a
              >
            </div>
            <div v-else-if="getMessageType(selectedMessage) === 'status'" class="status-message">
              <p>
                Statut mis à jour : <strong>{{ getMessageContent(selectedMessage) }}</strong>
              </p>
            </div>
            <div v-else>
              <pre>{{ getMessageContent(selectedMessage) }}</pre>
            </div>
          </div>
          <div class="raw-data-toggle">
            <button @click="showRaw = !showRaw" class="btn-text">
              {{ showRaw ? 'Masquer' : 'Voir' }} les données brutes
            </button>
            <pre v-if="showRaw" class="raw-json">{{
              JSON.stringify(selectedMessage, null, 2)
            }}</pre>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" @click="closeModal">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import api from '@/config/axios'
import store from '@/store'

// State
const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref('desc')
const selectedMessage = ref(null)
const showRaw = ref(false)
let pollingInterval = null

// Store Data
const whatsappData = computed(() => store.state.data.whatsappData || { data: [] })

// Methods to extract data from the complex JSON structure
const getEntryValue = (item) => {
  return item.body?.data?.entry?.[0]?.changes?.[0]?.value || {}
}

const getMessageType = (item) => {
  const value = getEntryValue(item)
  if (value.messages && value.messages.length > 0) {
    return value.messages[0].type
  }
  if (value.statuses && value.statuses.length > 0) {
    return 'status'
  }
  return 'unknown'
}

const getSender = (item) => {
  const value = getEntryValue(item)
  if (value.contacts && value.contacts.length > 0) {
    return value.contacts[0].profile.name + ` (${value.contacts[0].wa_id})`
  }
  if (value.messages && value.messages.length > 0) {
    return value.messages[0].from
  }
  if (value.statuses && value.statuses.length > 0) {
    return value.statuses[0].recipient_id || 'System'
  }
  return 'Inconnu'
}

const getMessageContent = (item) => {
  const value = getEntryValue(item)
  if (value.messages && value.messages.length > 0) {
    const msg = value.messages[0]
    if (msg.type === 'text') return msg.text.body
    if (msg.type === 'document') return msg.document
    if (msg.type === 'image') return msg.image
  }
  if (value.statuses && value.statuses.length > 0) {
    return value.statuses[0].status
  }
  return 'Contenu non disponible'
}

const getMessageStatus = (item) => {
  const value = getEntryValue(item)
  if (value.statuses && value.statuses.length > 0) {
    return value.statuses[0].status
  }
  return getMessageType(item) === 'status' ? 'N/A' : 'Reçu'
}

// Filtering and Sorting
const filteredMessages = computed(() => {
  let items = whatsappData.value.data || []

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item) => {
      const sender = getSender(item).toLowerCase()
      const content = JSON.stringify(getMessageContent(item)).toLowerCase()
      return sender.includes(query) || content.includes(query)
    })
  }

  // Sort
  items = [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortBy.value === 'desc' ? dateB - dateA : dateA - dateB
  })

  return items
})

// Actions
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get(`/whatsapp-data?page=${page}`)
    store.commit('SET_DATA', { whatsappData: response.data })
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    loading.value = false
  }
}

const viewMessage = (item) => {
  selectedMessage.value = item
  showRaw.value = false
}

const closeModal = () => {
  selectedMessage.value = null
}

const truncate = (text, length) => {
  if (!text || typeof text !== 'string') return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchData()
  // Auto refresh every 5s
  pollingInterval = setInterval(() => {
    // Only refresh if on first page and not searching to avoid disrupting user
    if (whatsappData.value.current_page === 1 && !searchQuery.value) {
      fetchData(1)
    }
  }, 5000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
.dashboard {
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.controls {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message-list-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.message-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px; /* Ensure table doesn't squish too much */
}

.message-table th,
.message-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.message-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.message-table tr:hover {
  background-color: #f8fff9;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.type-badge.text {
  background-color: #e3f2fd;
  color: #1976d2;
}
.type-badge.document {
  background-color: #fff3e0;
  color: #f57c00;
}
.type-badge.status {
  background-color: #f3e5f5;
  color: #7b1fa2;
}
.type-badge.unknown {
  background-color: #eceff1;
  color: #607d8b;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
.status-badge.sent {
  color: #f39c12;
  background: #fef5e7;
}
.status-badge.delivered {
  color: #3498db;
  background: #ebf5fb;
}
.status-badge.read {
  color: #2ecc71;
  background: #eafaf1;
}
.status-badge.Reçu {
  color: #27ae60;
  background: #e9f7ef;
  font-weight: bold;
}
.status-badge.N\/A {
  color: #95a5a6;
  background: #f4f6f6;
}

.sender {
  font-weight: 500;
}
.date {
  color: #888;
  white-space: nowrap;
  font-size: 0.9rem;
}
.content-preview {
  color: #555;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-view {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-view:hover {
  border-color: #25d366;
  color: #25d366;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 0;
  gap: 15px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
}
.info-row strong {
  width: 80px;
  color: #555;
}

.full-message {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #25d366;
  line-height: 1.5;
  white-space: pre-wrap;
}

.raw-data-toggle {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.btn-text {
  background: none;
  border: none;
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.raw-json {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.8rem;
  margin-top: 10px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  .controls {
    flex-direction: column;
  }
  .search-input {
    width: 100%;
    min-width: 0;
  }
}
</style>
