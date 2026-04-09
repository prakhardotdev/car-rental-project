import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('luxedrive-token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('luxedrive-token'); delete api.defaults.headers.common['Authorization'] })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('luxedrive-token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    toast.success(`Welcome back, ${user.name}! 🚗`)
    return user
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password })
    const { token, user } = res.data
    localStorage.setItem('luxedrive-token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    toast.success(`Account created! Welcome, ${user.name}! 🎉`)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('luxedrive-token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully.')
  }, [])

  const updateProfile = useCallback(async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(res.data.user)
    toast.success('Profile updated!')
    return res.data.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
