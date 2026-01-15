<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Creer un groupe</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="groupName">Nom du groupe *</label>
          <input
            id="groupName"
            type="text"
            v-model="groupName"
            placeholder="Ex: Equipe Marketing"
            :class="{ error: errors.name }"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="description">Description (optionnel)</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Decrivez le groupe..."
            rows="2"
          ></textarea>
        </div>

        <GroupMemberSelect v-model="selectedContacts" />
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          Annuler
        </button>
        <button
          class="btn btn-primary"
          @click="createGroup"
          :disabled="!isValid || loading"
        >
          <i v-if="loading" class="bi bi-arrow-repeat spinner"></i>
          {{ loading ? 'Creation...' : 'Creer le groupe' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import GroupMemberSelect from './GroupMemberSelect.vue'

const store = useStore()

const emit = defineEmits(['close', 'created'])

const groupName = ref('')
const description = ref('')
const selectedContacts = ref([])
const loading = ref(false)
const errors = ref({})

const isValid = computed(() => {
  return groupName.value.trim().length > 0
})

const validate = () => {
  errors.value = {}

  if (!groupName.value.trim()) {
    errors.value.name = 'Le nom du groupe est requis'
    return false
  }

  if (groupName.value.trim().length > 255) {
    errors.value.name = 'Le nom ne peut pas depasser 255 caracteres'
    return false
  }

  return true
}

const createGroup = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const payload = {
      name: groupName.value.trim(),
      description: description.value.trim() || null,
      contact_ids: selectedContacts.value.map(c => c.id)
    }

    const group = await store.dispatch('groups/createGroup', payload)
    emit('created', group)
  } catch (error) {
    console.error('Error creating group:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value.general = 'Une erreur est survenue lors de la creation du groupe'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  font-size: 1.2rem;
  color: #111b21;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #54656f;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}

.close-btn:hover {
  background-color: #f0f2f5;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #111b21;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9edef;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111b21;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00a884;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ea0038;
}

.error-text {
  color: #ea0038;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e9edef;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #f0f2f5;
  border: none;
  color: #54656f;
}

.btn-secondary:hover {
  background-color: #e9edef;
}

.btn-primary {
  background-color: #00a884;
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #008f6f;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
