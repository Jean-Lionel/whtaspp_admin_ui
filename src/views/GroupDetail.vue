<template>
  <div class="group-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <i class="bi bi-arrow-repeat spinner"></i>
      <p>Chargement...</p>
    </div>

    <template v-else-if="group">
      <!-- Group Header -->
      <div class="group-header">
        <button class="back-btn" @click="$router.push('/groups')">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="group-avatar">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="group-info">
          <h1>{{ group.name }}</h1>
          <p>{{ group.member_count }} membre(s)</p>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="showAddMembers = true" title="Ajouter des membres">
            <i class="bi bi-person-plus"></i>
          </button>
          <button class="action-btn" @click="showEditModal = true" title="Modifier">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-btn" @click="$router.push(`/send-files?type=group&id=${group.id}`)" title="Envoyer un fichier">
            <i class="bi bi-file-earmark-arrow-up"></i>
          </button>
        </div>
      </div>

      <div class="group-content">
        <!-- Members Panel -->
        <div class="members-panel">
          <div class="panel-header">
            <h3>Membres</h3>
            <button class="add-btn" @click="showAddMembers = true">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <div class="members-list">
            <div
              v-for="member in group.members"
              :key="member.id"
              class="member-item"
            >
              <img
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=25d366&color=fff`"
                :alt="member.name"
                class="member-avatar"
              />
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-phone">{{ member.phone }}</span>
              </div>
              <span v-if="member.is_admin" class="admin-badge">Admin</span>
              <button
                class="remove-btn"
                @click="removeMember(member)"
                title="Retirer du groupe"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div v-if="group.members?.length === 0" class="no-members">
              <p>Aucun membre</p>
              <button class="btn-link" @click="showAddMembers = true">
                Ajouter des membres
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel">
          <div class="panel-header">
            <h3>Messages du groupe</h3>
          </div>

          <div class="messages-container" ref="messagesContainer">
            <div v-if="messagesLoading && messages.length === 0" class="loading-messages">
              <i class="bi bi-arrow-repeat spinner"></i>
            </div>
            <div v-else-if="messages.length === 0" class="no-messages">
              <i class="bi bi-chat-text"></i>
              <p>Aucun message envoye a ce groupe</p>
            </div>
            <div v-else class="messages-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-item"
              >
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-type">
                      <i :class="getTypeIcon(msg.type)"></i>
                      {{ msg.type === 'template' ? msg.template_name : 'Message texte' }}
                    </span>
                    <span class="message-time">{{ formatDate(msg.created_at) }}</span>
                  </div>
                  <p class="message-body">{{ msg.body || '[Template]' }}</p>
                  <div class="message-stats">
                    <span class="stat success">
                      <i class="bi bi-check-circle"></i>
                      {{ msg.delivered_count }} envoyes
                    </span>
                    <span v-if="msg.failed_count > 0" class="stat failed">
                      <i class="bi bi-x-circle"></i>
                      {{ msg.failed_count }} echecs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-area">
            <div class="input-wrapper">
              <button class="template-btn" @click="showTemplateModal = true" title="Envoyer un template">
                <i class="bi bi-file-earmark-text"></i>
              </button>
              <input
                type="text"
                v-model="newMessage"
                placeholder="Ecrire un message..."
                @keyup.enter="sendMessage"
              />
              <button
                class="send-btn"
                @click="sendMessage"
                :disabled="!newMessage.trim() || sending"
              >
                <i class="bi bi-send"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Members Modal -->
    <div v-if="showAddMembers" class="modal-overlay" @click.self="showAddMembers = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Ajouter des membres</h3>
          <button class="close-btn" @click="showAddMembers = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <GroupMemberSelect
            v-model="selectedNewMembers"
            :exclude-ids="existingMemberIds"
          />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddMembers = false">Annuler</button>
          <button
            class="btn-primary"
            @click="addMembers"
            :disabled="selectedNewMembers.length === 0 || addingMembers"
          >
            {{ addingMembers ? 'Ajout...' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Template Modal -->
    <TemplateModal
      v-if="showTemplateModal"
      @close="showTemplateModal = false"
      @send-template="sendTemplateMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import GroupMemberSelect from '@/components/whatsapp/GroupMemberSelect.vue'
import TemplateModal from '@/components/whatsapp/TemplateModal.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const newMessage = ref('')
const sending = ref(false)
const showAddMembers = ref(false)
const showEditModal = ref(false)
const showTemplateModal = ref(false)
const selectedNewMembers = ref([])
const addingMembers = ref(false)
const messagesContainer = ref(null)

const loading = computed(() => store.state.groups.loading)
const messagesLoading = computed(() => store.state.groups.messagesLoading)
const group = computed(() => store.state.groups.currentGroup)
const messages = computed(() => store.state.groups.groupMessages)

const existingMemberIds = computed(() => {
  return group.value?.members?.map(m => m.id) || []
})

onMounted(() => {
  const groupId = route.params.id
  if (groupId) {
    store.dispatch('groups/fetchGroup', groupId)
    store.dispatch('groups/fetchGroupMessages', groupId)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    store.dispatch('groups/fetchGroup', newId)
    store.dispatch('groups/fetchGroupMessages', newId)
  }
})

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return

  sending.value = true
  try {
    await store.dispatch('groups/sendGroupMessage', {
      groupId: group.value.id,
      payload: {
        type: 'text',
        message: newMessage.value.trim()
      }
    })
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    sending.value = false
  }
}

const sendTemplateMessage = async (data) => {
  showTemplateModal.value = false
  sending.value = true
  try {
    await store.dispatch('groups/sendGroupMessage', {
      groupId: group.value.id,
      payload: {
        type: 'template',
        template_name: data.template.name,
        language: data.template.language,
        parameters: data.parameters
      }
    })
  } catch (error) {
    console.error('Error sending template:', error)
  } finally {
    sending.value = false
  }
}

const addMembers = async () => {
  if (selectedNewMembers.value.length === 0) return

  addingMembers.value = true
  try {
    await store.dispatch('groups/addMembers', {
      groupId: group.value.id,
      contactIds: selectedNewMembers.value.map(c => c.id)
    })
    showAddMembers.value = false
    selectedNewMembers.value = []
  } catch (error) {
    console.error('Error adding members:', error)
  } finally {
    addingMembers.value = false
  }
}

const removeMember = async (member) => {
  if (!confirm(`Retirer ${member.name} du groupe ?`)) return

  try {
    await store.dispatch('groups/removeMember', {
      groupId: group.value.id,
      contactId: member.id
    })
  } catch (error) {
    console.error('Error removing member:', error)
  }
}

const getTypeIcon = (type) => {
  return type === 'template' ? 'bi bi-file-earmark-text' : 'bi bi-chat-text'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.group-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #667781;
}

.spinner {
  animation: spin 1s linear infinite;
  font-size: 2rem;
  margin-bottom: 10px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e9edef;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #54656f;
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
}

.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a884 0%, #25d366 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  margin-right: 16px;
}

.group-info {
  flex: 1;
}

.group-info h1 {
  font-size: 1.1rem;
  margin: 0;
  color: #111b21;
}

.group-info p {
  font-size: 0.85rem;
  color: #667781;
  margin: 2px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  color: #54656f;
  font-size: 1.1rem;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.group-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.members-panel {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e9edef;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e9edef;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #111b21;
}

.add-btn {
  background-color: #00a884;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.members-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.member-item:hover {
  background-color: #f5f6f6;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  display: block;
  font-size: 0.95rem;
  color: #111b21;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-phone {
  font-size: 0.8rem;
  color: #667781;
}

.admin-badge {
  background-color: #e7fce8;
  color: #00a884;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: #667781;
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.member-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ea0038;
}

.no-members {
  text-align: center;
  padding: 20px;
  color: #667781;
}

.btn-link {
  background: none;
  border: none;
  color: #00a884;
  cursor: pointer;
  font-size: 0.9rem;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4ccc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.chat-panel .panel-header {
  background-color: #f0f2f5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading-messages, .no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #667781;
}

.no-messages i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  justify-content: flex-end;
}

.message-content {
  background-color: #d9fdd3;
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 70%;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
}

.message-type {
  font-size: 0.75rem;
  color: #00a884;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: #667781;
}

.message-body {
  margin: 0;
  font-size: 0.95rem;
  color: #111b21;
  word-wrap: break-word;
}

.message-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat.success {
  color: #00a884;
}

.stat.failed {
  color: #ea0038;
}

.message-input-area {
  padding: 12px 16px;
  background-color: #f0f2f5;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 6px 12px;
}

.template-btn {
  background: none;
  border: none;
  color: #54656f;
  cursor: pointer;
  padding: 8px;
  font-size: 1.1rem;
}

.template-btn:hover {
  color: #00a884;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-size: 0.95rem;
}

.send-btn {
  background-color: #00a884;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

.modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9edef;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #54656f;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e9edef;
}

.btn-secondary {
  padding: 10px 20px;
  background-color: #f0f2f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #00a884;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .group-content {
    flex-direction: column;
  }

  .members-panel {
    width: 100%;
    max-height: 200px;
  }
}
</style>
