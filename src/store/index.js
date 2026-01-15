import { createStore } from 'vuex'
import { post } from '@/config/axios'

export default createStore({
  state: {
    data: {
      whatsappData: [],
      contacts: [],
      chatsContacts: [],
      messages_chats: [],
    },
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    currenUser: (state) => state.user,
    userName: (state) => state.user?.name || 'Utilisateur',
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
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await post('/login', credentials)
        const { user, token } = response.data

        // Supposons que le token est dans response.data.token ou access_token.
        // L'exemple utilisateur montre { user: {...}, token: "..." }

        commit('SET_USER', user)
        commit('SET_TOKEN', token)

        return response
      } catch (error) {
        throw error
      }
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
      // Optionnel : appel API de logout server-side si nécessaire
      // await post('/logout')
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
  },
  modules: {},
})
