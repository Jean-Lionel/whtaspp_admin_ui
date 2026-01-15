import { get, post, put, remove } from '@/config/axios'

export default {
  namespaced: true,

  state: {
    contacts: [],
    loading: false,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
    },
  },

  getters: {
    allContacts: (state) => state.contacts,
    isLoading: (state) => state.loading,
    getContactById: (state) => (id) => state.contacts.find((c) => c.id === id),
  },

  mutations: {
    SET_CONTACTS(state, contacts) {
      state.contacts = contacts
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_PAGINATION(state, { currentPage, lastPage, total }) {
      state.pagination = { currentPage, lastPage, total }
    },
    ADD_CONTACT(state, contact) {
      state.contacts.unshift(contact)
    },
    UPDATE_CONTACT(state, updatedContact) {
      const index = state.contacts.findIndex((c) => c.id === updatedContact.id)
      if (index !== -1) {
        state.contacts.splice(index, 1, updatedContact)
      }
    },
    REMOVE_CONTACT(state, id) {
      state.contacts = state.contacts.filter((c) => c.id !== id)
    },
  },

  actions: {
    async fetchContacts({ commit }, { page = 1, search = '' } = {}) {
      commit('SET_LOADING', true)
      try {
        const params = { page }
        if (search) params.search = search

        const response = await get('/contacts', { params })
        const { data, current_page, last_page, total } = response.data

        commit('SET_CONTACTS', data || response.data)
        commit('SET_PAGINATION', {
          currentPage: current_page || 1,
          lastPage: last_page || 1,
          total: total || 0,
        })

        return response.data
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createContact({ commit }, payload) {
      const response = await post('/contacts', payload)
      commit('ADD_CONTACT', response.data)
      return response.data
    },

    async updateContact({ commit }, { id, payload }) {
      const response = await put(`/contacts/${id}`, payload)
      commit('UPDATE_CONTACT', response.data)
      return response.data
    },

    async deleteContact({ commit }, id) {
      await remove(`/contacts/${id}`)
      commit('REMOVE_CONTACT', id)
    },
  },
}
