import { get, post, put, remove } from '@/config/axios'

export default {
  namespaced: true,

  state: {
    groups: [],
    currentGroup: null,
    groupMessages: [],
    loading: false,
    messagesLoading: false,
  },

  getters: {
    allGroups: (state) => state.groups,
    currentGroup: (state) => state.currentGroup,
    groupMessages: (state) => state.groupMessages,
    isLoading: (state) => state.loading,
    getGroupById: (state) => (id) => state.groups.find((g) => g.id === id),
  },

  mutations: {
    SET_GROUPS(state, groups) {
      state.groups = groups
    },
    SET_CURRENT_GROUP(state, group) {
      state.currentGroup = group
    },
    SET_GROUP_MESSAGES(state, messages) {
      state.groupMessages = messages
    },
    ADD_GROUP_MESSAGE(state, message) {
      state.groupMessages.push(message)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_MESSAGES_LOADING(state, loading) {
      state.messagesLoading = loading
    },
    ADD_GROUP(state, group) {
      state.groups.unshift(group)
    },
    UPDATE_GROUP(state, updatedGroup) {
      const index = state.groups.findIndex((g) => g.id === updatedGroup.id)
      if (index !== -1) {
        state.groups.splice(index, 1, updatedGroup)
      }
      if (state.currentGroup?.id === updatedGroup.id) {
        state.currentGroup = updatedGroup
      }
    },
    REMOVE_GROUP(state, id) {
      state.groups = state.groups.filter((g) => g.id !== id)
      if (state.currentGroup?.id === id) {
        state.currentGroup = null
      }
    },
  },

  actions: {
    async fetchGroups({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await get('/groups')
        commit('SET_GROUPS', response.data)
        return response.data
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchGroup({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await get(`/groups/${id}`)
        commit('SET_CURRENT_GROUP', response.data)
        return response.data
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createGroup({ commit }, payload) {
      const response = await post('/groups', payload)
      commit('ADD_GROUP', response.data)
      return response.data
    },

    async updateGroup({ commit }, { id, payload }) {
      const response = await put(`/groups/${id}`, payload)
      commit('UPDATE_GROUP', response.data)
      return response.data
    },

    async deleteGroup({ commit }, id) {
      await remove(`/groups/${id}`)
      commit('REMOVE_GROUP', id)
    },

    async addMembers({ commit }, { groupId, contactIds }) {
      const response = await post(`/groups/${groupId}/contacts`, {
        contact_ids: contactIds,
      })
      commit('SET_CURRENT_GROUP', response.data)
      return response.data
    },

    async removeMember({ commit }, { groupId, contactId }) {
      const response = await remove(`/groups/${groupId}/contacts/${contactId}`)
      commit('SET_CURRENT_GROUP', response.data)
      return response.data
    },

    async fetchGroupMessages({ commit }, groupId) {
      commit('SET_MESSAGES_LOADING', true)
      try {
        const response = await get(`/groups/${groupId}/messages`)
        const messages = response.data.data || response.data
        commit('SET_GROUP_MESSAGES', messages)
        return messages
      } finally {
        commit('SET_MESSAGES_LOADING', false)
      }
    },

    async sendGroupMessage({ commit }, { groupId, payload }) {
      const response = await post(`/groups/${groupId}/send`, payload)
      if (response.data.success && response.data.message) {
        commit('ADD_GROUP_MESSAGE', response.data.message)
      }
      return response.data
    },
  },
}
