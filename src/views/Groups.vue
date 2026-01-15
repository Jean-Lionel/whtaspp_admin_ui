<template>
  <div class="groups-page">
    <div class="page-header">
      <h1>Groupes</h1>
      <button class="btn-create" @click="showCreateModal = true">
        <i class="bi bi-plus-lg"></i>
        Nouveau groupe
      </button>
    </div>

    <div class="groups-container">
      <!-- Loading state -->
      <div v-if="loading && groups.length === 0" class="loading-state">
        <i class="bi bi-arrow-repeat spinner"></i>
        <p>Chargement des groupes...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="groups.length === 0" class="empty-state">
        <i class="bi bi-people"></i>
        <h3>Aucun groupe</h3>
        <p>Creez votre premier groupe pour envoyer des messages a plusieurs contacts</p>
        <button class="btn-primary" @click="showCreateModal = true">
          <i class="bi bi-plus-lg"></i>
          Creer un groupe
        </button>
      </div>

      <!-- Groups grid -->
      <div v-else class="groups-grid">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-card"
          @click="goToGroup(group.id)"
        >
          <div class="group-avatar">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="group-info">
            <h3 class="group-name">{{ group.name }}</h3>
            <p class="group-description">{{ group.description || 'Aucune description' }}</p>
            <div class="group-meta">
              <span class="member-count">
                <i class="bi bi-person"></i>
                {{ group.member_count || 0 }} membre(s)
              </span>
              <span class="last-message" v-if="group.lastMessage">
                <i class="bi bi-chat"></i>
                {{ formatDate(group.lastMessage?.created_at) }}
              </span>
            </div>
          </div>
          <div class="group-actions">
            <button class="action-btn" @click.stop="editGroup(group)" title="Modifier">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="action-btn danger" @click.stop="confirmDelete(group)" title="Supprimer">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <GroupCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleGroupCreated"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="confirm-modal">
        <h3>Supprimer le groupe</h3>
        <p>Etes-vous sur de vouloir supprimer le groupe "{{ groupToDelete?.name }}" ?</p>
        <p class="warning">Cette action est irreversible.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Annuler</button>
          <button class="btn-danger" @click="deleteGroup" :disabled="deleting">
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import GroupCreateModal from '@/components/whatsapp/GroupCreateModal.vue'

const store = useStore()
const router = useRouter()

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const groupToDelete = ref(null)
const deleting = ref(false)

const loading = computed(() => store.state.groups.loading)
const groups = computed(() => store.state.groups.groups)

onMounted(() => {
  store.dispatch('groups/fetchGroups')
})

const goToGroup = (id) => {
  router.push(`/groups/${id}`)
}

const handleGroupCreated = (group) => {
  showCreateModal.value = false
  router.push(`/groups/${group.id}`)
}

const editGroup = (group) => {
  router.push(`/groups/${group.id}`)
}

const confirmDelete = (group) => {
  groupToDelete.value = group
  showDeleteModal.value = true
}

const deleteGroup = async () => {
  if (!groupToDelete.value) return

  deleting.value = true
  try {
    await store.dispatch('groups/deleteGroup', groupToDelete.value.id)
    showDeleteModal.value = false
    groupToDelete.value = null
  } catch (error) {
    console.error('Error deleting group:', error)
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.groups-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #111b21;
  margin: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #00a884;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-create:hover {
  background-color: #008f6f;
}

.groups-container {
  min-height: 400px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #667781;
}

.loading-state i, .empty-state i {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #111b21;
}

.empty-state p {
  margin-bottom: 20px;
  text-align: center;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #00a884;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.group-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e9edef;
  cursor: pointer;
  transition: all 0.15s;
}

.group-card:hover {
  border-color: #00a884;
  box-shadow: 0 4px 12px rgba(0, 168, 132, 0.1);
}

.group-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a884 0%, #25d366 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-right: 16px;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111b21;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-description {
  font-size: 0.85rem;
  color: #667781;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: #667781;
}

.group-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s;
}

.group-card:hover .group-actions {
  opacity: 1;
}

.action-btn {
  padding: 8px;
  border: none;
  background-color: #f0f2f5;
  border-radius: 50%;
  cursor: pointer;
  color: #54656f;
  transition: all 0.15s;
}

.action-btn:hover {
  background-color: #e9edef;
}

.action-btn.danger:hover {
  background-color: #ffe5e5;
  color: #ea0038;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.confirm-modal h3 {
  margin: 0 0 12px 0;
  color: #111b21;
}

.confirm-modal p {
  color: #667781;
  margin: 0 0 8px 0;
}

.confirm-modal .warning {
  color: #ea0038;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  padding: 10px 20px;
  background-color: #f0f2f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #54656f;
}

.btn-danger {
  padding: 10px 20px;
  background-color: #ea0038;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c00030;
}

.btn-danger:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
