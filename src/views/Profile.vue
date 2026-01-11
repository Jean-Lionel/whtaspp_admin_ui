<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="avatar-section">
        <div class="avatar">
          <span>{{ initials }}</span>
        </div>
      </div>
      <div class="info-section">
        <h2>{{ user?.name }}</h2>
        <p class="email">{{ user?.email }}</p>

        <div class="details">
          <div class="detail-item">
            <span class="label">ID Utilisateur</span>
            <span class="value">#{{ user?.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Membre depuis</span>
            <span class="value">{{ formattedDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const user = computed(() => store.state.user)

const initials = computed(() => {
  if (!user.value || !user.value.name) return '?'
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const formattedDate = computed(() => {
  if (!user.value || !user.value.created_at) return '-'
  return new Date(user.value.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.profile-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-align: center;
  padding: 40px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  background-color: #25d366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.info-section h2 {
  margin: 0 0 5px;
  color: #2c3e50;
}

.email {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.details {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #95a5a6;
  font-weight: 500;
}

.value {
  color: #34495e;
  font-weight: 600;
}
</style>
