<template>
  <div class="contact-page">
    <div class="header-section">
      <h1 class="page-title">Contacts</h1>
      <div class="actions">
        <div class="search-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch" 
            placeholder="Search contacts..." 
            class="search-input"
          />
        </div>
        <button class="btn-primary" @click="openAddModal">
          <i class="bi bi-plus-lg"></i> Add Contact
        </button>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <table v-else class="contacts-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country Code</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts.data" :key="contact.id">
            <td>
              <div class="user-info">
                <div class="avatar-placeholder">{{ getInitials(contact.name) }}</div>
                <span class="user-name">{{ contact.name }}</span>
              </div>
            </td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.phone || '-' }}</td>
            <td>{{ contact.country_code || '-' }}</td>
            <td class="text-right">
              <button class="btn-icon edit" @click="openEditModal(contact)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn-icon delete" @click="deleteContact(contact.id)">
                <i class="bi bi-trash-fill"></i>
              </button>
            </td>
          </tr>
          <tr v-if="contacts.data && contacts.data.length === 0">
            <td colspan="5" class="empty-state">No contacts found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="contacts.links && contacts.links.length > 3">
      <div class="pagination">
        <button 
          v-for="(link, index) in contacts.links" 
          :key="index"
          :disabled="!link.url || link.active"
          :class="{ 'active': link.active }"
          @click="changePage(link.url)"
          v-html="link.label"
        ></button>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Edit Contact' : 'New Contact' }}</h2>
            <button class="close-btn" @click="closeModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Name</label>
              <input type="text" v-model="form.name" placeholder="Enter name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="form.email" placeholder="Enter email" />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>Country Code</label>
                <input type="text" v-model="form.country_code" placeholder="e.g. 257" />
              </div>
              <div class="form-group half">
                <label>Phone</label>
                <input type="text" v-model="form.phone" placeholder="Enter phone number" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn-primary" @click="saveContact" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Contact' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import api from '@/config/axios';
import { ref, onMounted, reactive } from 'vue';

const contacts = ref({});
const loading = ref(false);
const searchQuery = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const currentContactId = ref(null);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  country_code: ''
});

onMounted(() => {
  getContacts();
});

const getContacts = (url = '/contacts') => {
  loading.value = true;
  // If url is full url (from pagination), use it, otherwise append params
  const isFullUrl = url.startsWith('http');
  const requestUrl = isFullUrl ? url : url;
  
  const params = {};
  if (searchQuery.value) {
      params.search = searchQuery.value;
  }

  // To support search properly with pagination, usually we pass params.
  // We'll pass search param always if not empty.
  api.get(requestUrl, { params })
    .then((response) => {
      contacts.value = response.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

let debounceTimer = null;
const handleSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Reset to page 1 when searching
    getContacts('/contacts');
  }, 300);
};

const changePage = (url) => {
  if (url) {
      getContacts(url);
  }
};

const openAddModal = () => {
  isEditing.value = false;
  currentContactId.value = null;
  form.name = '';
  form.email = '';
  form.phone = '';
  form.country_code = '';
  showModal.value = true;
};

const openEditModal = (contact) => {
  isEditing.value = true;
  currentContactId.value = contact.id;
  form.name = contact.name;
  form.email = contact.email;
  form.phone = contact.phone;
  form.country_code = contact.country_code || '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveContact = () => {
  saving.value = true;
  const payload = { ...form };
  
  const request = isEditing.value 
    ? api.put(`/contacts/${currentContactId.value}`, payload)
    : api.post('/contacts', payload);

  request
    .then(() => {
      closeModal();
      getContacts();
    })
    .catch(err => {
      console.error("Failed to save contact", err);
    })
    .finally(() => {
      saving.value = false;
    });
};

const deleteContact = (id) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    api.delete(`/contacts/${id}`)
      .then(() => {
        getContacts();
      });
  }
};

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};
</script>

<style scoped>
/* Core Layout & Typography */
.contact-page {
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #e2e8f0;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* Actions Bar */
.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #1e293b;
  color: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: #334155;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #475569;
}

/* Table container styling */
.table-container {
  background: #1e293b;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #334155;
  margin-bottom: 1.5rem;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.contacts-table th {
  padding: 1rem 1.5rem;
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #334155;
}

.contacts-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.95rem;
  vertical-align: middle;
}

.contacts-table tr:last-child td {
  border-bottom: none;
}

.contacts-table tr:hover {
  background: #27354f; /* Slightly lighter than row bg */
}

/* User Info Cell */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.user-name {
  font-weight: 500;
  color: white;
}

/* Action Buttons */
.text-right {
  text-align: right;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #94a3b8;
  transition: all 0.2s;
  margin-left: 0.25rem;
}

.btn-icon.edit:hover {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.btn-icon.delete:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.pagination {
  display: flex;
  gap: 0.25rem;
  background: #1e293b;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid #334155;
}

.pagination button {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  min-width: 32px;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #334155;
  color: white;
}

.pagination button.active {
  background: #3b82f6;
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
  overflow: hidden;
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  transition: border-color 0.2s;
  box-sizing: border-box; 
}

input:focus {
  outline: none;
  border-color: #60a5fa;
}

.modal-footer {
  padding: 1.5rem;
  background: #0f172a;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Animations */
@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  z-index: 10000;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 3rem !important;
}
</style>