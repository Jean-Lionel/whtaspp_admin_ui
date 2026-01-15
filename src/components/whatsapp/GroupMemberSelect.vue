<template>
  <div class="member-select">
    <label class="label">Membres du groupe</label>

    <!-- Search input -->
    <div class="search-wrapper">
      <i class="bi bi-search"></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Rechercher des contacts..."
        class="search-input"
      />
    </div>

    <!-- Selected members chips -->
    <div v-if="selectedContacts.length > 0" class="selected-chips">
      <div
        v-for="contact in selectedContacts"
        :key="contact.id"
        class="chip"
      >
        <span>{{ contact.name }}</span>
        <button type="button" class="chip-remove" @click="removeContact(contact)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <!-- Contact list -->
    <div class="contact-list" v-if="filteredContacts.length > 0">
      <div
        v-for="contact in filteredContacts"
        :key="contact.id"
        class="contact-item"
        :class="{ selected: isSelected(contact) }"
        @click="toggleContact(contact)"
      >
        <div class="contact-avatar">
          <img
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=25d366&color=fff`"
            :alt="contact.name"
          />
        </div>
        <div class="contact-info">
          <span class="contact-name">{{ contact.name }}</span>
          <span class="contact-phone">{{ contact.full_phone || contact.phone }}</span>
        </div>
        <div class="contact-check">
          <i v-if="isSelected(contact)" class="bi bi-check-circle-fill"></i>
          <i v-else class="bi bi-circle"></i>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading">
      <i class="bi bi-arrow-repeat spinner"></i>
      Chargement...
    </div>

    <div v-else class="empty">
      <i class="bi bi-people"></i>
      <p>Aucun contact disponible</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  excludeIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const loading = ref(false)

const selectedContacts = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const contacts = computed(() => store.state.contacts.contacts || [])

const filteredContacts = computed(() => {
  let list = contacts.value.filter(c => !props.excludeIds.includes(c.id))

  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase()
    list = list.filter(c => {
      return c.name?.toLowerCase().includes(term) ||
             c.phone?.includes(term) ||
             c.full_phone?.includes(term)
    })
  }

  return list
})

const isSelected = (contact) => {
  return selectedContacts.value.some(c => c.id === contact.id)
}

const toggleContact = (contact) => {
  if (isSelected(contact)) {
    removeContact(contact)
  } else {
    selectedContacts.value = [...selectedContacts.value, contact]
  }
}

const removeContact = (contact) => {
  selectedContacts.value = selectedContacts.value.filter(c => c.id !== contact.id)
}

onMounted(async () => {
  if (contacts.value.length === 0) {
    loading.value = true
    try {
      await store.dispatch('contacts/fetchContacts')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.member-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  font-weight: 500;
  color: #111b21;
  font-size: 0.9rem;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
}

.search-wrapper i {
  color: #54656f;
  margin-right: 10px;
}

.search-input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
  font-size: 0.9rem;
  color: #111b21;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #e7fce8;
  color: #00a884;
  padding: 4px 8px 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a884;
  border-radius: 50%;
  transition: background-color 0.15s;
}

.chip-remove:hover {
  background-color: rgba(0, 168, 132, 0.2);
}

.contact-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e9edef;
  border-radius: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f0f2f5;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item:hover {
  background-color: #f5f6f6;
}

.contact-item.selected {
  background-color: #e7fce8;
}

.contact-avatar {
  margin-right: 12px;
}

.contact-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 0.95rem;
  color: #111b21;
  font-weight: 500;
}

.contact-phone {
  font-size: 0.8rem;
  color: #667781;
}

.contact-check {
  font-size: 1.2rem;
}

.contact-check .bi-check-circle-fill {
  color: #00a884;
}

.contact-check .bi-circle {
  color: #c5c5c5;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #667781;
}

.loading i, .empty i {
  font-size: 2rem;
  margin-bottom: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
