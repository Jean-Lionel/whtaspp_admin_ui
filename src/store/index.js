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
        throw error
      }
    },
  },
  modules: {
    contacts,
    groups,
  },
})
