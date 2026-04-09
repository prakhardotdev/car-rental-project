import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

/**
 * useAdminStats — fetches full dashboard analytics from /api/admin/stats
 */
export function useAdminStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, error, refetch: fetch }
}

/**
 * useAdminUsers — fetches all users with optional search
 */
export function useAdminUsers(params = {}) {
  const [users,   setUsers]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''))
      ).toString()
      const res = await api.get(`/admin/users?${query}`)
      setUsers(res.data.data)
      setTotal(res.data.total)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { users, total, loading, refetch: fetch }
}

/**
 * useAdminCars — fetches all cars for admin management (with pagination)
 */
export function useAdminCars(params = {}) {
  const [cars,    setCars]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries({ limit: 50, ...params }).filter(([, v]) => v !== ''))
      ).toString()
      const res = await api.get(`/cars?${query}`)
      setCars(res.data.data)
      setTotal(res.data.total)
    } catch {
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { cars, total, loading, refetch: fetch }
}
