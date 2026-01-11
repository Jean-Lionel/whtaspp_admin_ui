import axios from 'axios'

// Création de l'instance Axios avec l'URL de base définie dans le fichier .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Intercepteurs pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteurs pour les réponses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gestion des erreurs globales (ex: 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Export des méthodes simplifiées
export const get = (url, config = {}) => api.get(url, config)
export const post = (url, data, config = {}) => api.post(url, data, config)
export const put = (url, data, config = {}) => api.put(url, data, config)
export const remove = (url, config = {}) => api.delete(url, config) // 'delete' est un mot clé réservé
export const patch = (url, data, config = {}) => api.patch(url, data, config)

// Export de l'instance par défaut pour un usage plus flexible
export default api
