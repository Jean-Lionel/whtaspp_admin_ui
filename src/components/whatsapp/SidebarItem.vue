<template>
  <div
    class="sidebar-item"
    :class="{ active: selected, group: item.type === 'group' }"
    @click="$emit('click', item)"
  >
    <div class="item-avatar">
      <template v-if="item.type === 'group'">
        <div class="group-avatar">
          <i class="bi bi-people-fill"></i>
        </div>
      </template>
      <template v-else>
        <img
          :src="item.avatar || defaultAvatar"
          :alt="item.name || item.phone"
        />
      </template>
    </div>

    <div class="item-info">
      <div class="item-top-row">
        <span class="item-name">{{ item.name || item.phone }}</span>
        <span class="item-time">{{ formatTime(item.last_message_at) }}</span>
      </div>
      <div class="item-bottom-row">
        <span class="item-preview">
          <template v-if="item.type === 'group'">
            <i class="bi bi-people-fill group-icon-small"></i>
            {{ item.member_count }} membres
          </template>
          <template v-else>
            {{ item.last_message || 'Aucun message' }}
          </template>
        </span>
        <span v-if="item.unread_count > 0" class="unread-badge">
          {{ item.unread_count }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const defaultAvatar = computed(() => {
  const name = props.item.name || props.item.phone || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=25d366&color=fff`
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }
}
</script>

<style scoped>
.sidebar-item {
  display: flex;
  padding: 0 15px;
  height: 72px;
  cursor: pointer;
  align-items: center;
  position: relative;
  transition: background-color 0.15s ease;
}

.sidebar-item:hover {
  background-color: #f5f6f6;
}

.sidebar-item.active {
  background-color: #f0f2f5;
}

.item-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

.item-avatar img {
  width: 49px;
  height: 49px;
  border-radius: 50%;
  object-fit: cover;
}

.group-avatar {
  width: 49px;
  height: 49px;
  border-radius: 50%;
  background-color: #00a884;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  border-bottom: 1px solid #e9edef;
  padding-right: 15px;
  min-width: 0;
}

.item-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 3px;
}

.item-name {
  font-size: 1.05rem;
  color: #111b21;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 0.75rem;
  color: #667781;
  flex-shrink: 0;
}

.item-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-preview {
  font-size: 0.85rem;
  color: #667781;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-icon-small {
  font-size: 0.8rem;
  color: #00a884;
}

.unread-badge {
  background-color: #25d366;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  flex-shrink: 0;
}

.sidebar-item.group .item-name {
  color: #111b21;
}

.sidebar-item.group .group-avatar {
  background: linear-gradient(135deg, #00a884 0%, #25d366 100%);
}
</style>
