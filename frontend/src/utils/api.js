import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://car-rental-project-1-so2f.onrender.com/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('luxedrive-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  err => Promise.reject(err)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Something went wrong'

    if (err.response?.status === 401) {
      localStorage.removeItem('luxedrive-token')
      delete api.defaults.headers.common['Authorization']
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else if (err.response?.status === 403) {
      toast.error('You do not have permission to do that.')
    } else if (err.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(msg)
    }

    return Promise.reject(err)
  }
)

export default api
