import { createStore } from 'vuex'
import { post, get } from '@/config/axios'
import contacts from './modules/contacts'
import groups from './modules/groups'

export default createStore({
  state: {
    data: {
      whatsappData: [],
      contacts: [],
      chatsContacts: [],
      messages_chats: [],
      sidebarItems: [],
      sidebarData : [],
      templates: [],
    },
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    currenUser: (state) => state.user,
    userName: (state) => state.user?.name || 'Utilisateur',
    sidebarItems: (state) => state.data.sidebarItems,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    SET_DATA(state, data) {
      state.data = data
    },
    SET_SIDEBAR_ITEMS(state, items) {
      state.data.sidebarItems = items
    },
    ADD_SIDEBAR_ITEM(state, item) {
      if (!state.data.sidebarItems) state.data.sidebarItems = []
      state.data.sidebarItems.unshift(item)
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await post('/login', credentials)
        const { user, token } = response.data

        commit('SET_USER', user)
        commit('SET_TOKEN', token)

        return response
      } catch (error) {
        throw error
      }
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
    async getData({ commit }) {
      try {
        const response = await get('/data')
        commit('SET_DATA', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async fetchSidebar({ commit }) {
      try {
        const response = await get('/sidebar')
        commit('SET_SIDEBAR_ITEMS', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching sidebar:', error)
        // Fallback to old endpoint if new one not available
        try {
          const fallbackResponse = await get('/side_bar_contacts')
          const mappedData = (fallbackResponse.data.data || []).map(item => ({
            ...item,
            type: 'contact',
            last_message: item.last_message,
            last_message_at: item.last_message_at,
            unread_count: item.unread_count
          }))
          commit('SET_SIDEBAR_ITEMS', mappedData)
          return mappedData
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          throw fallbackError
        }
      }
    },
  },
  modules: {
    contacts,
    groups,
  },
})
