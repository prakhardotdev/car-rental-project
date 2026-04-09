import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

/**
 * useMyBookings — fetches the current user's bookings
 */
export function useMyBookings(params = {}) {
  const [bookings, setBookings] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
      ).toString()
      const res = await api.get(`/bookings/my?${query}`)
      setBookings(res.data.data)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { bookings, total, loading, error, refetch: fetch }
}

/**
 * useAllBookings — Admin: fetch all bookings
 */
export function useAllBookings(params = {}) {
  const [bookings, setBookings] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
      ).toString()
      const res = await api.get(`/bookings?${query}`)
      setBookings(res.data.data)
      setTotal(res.data.total)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { bookings, total, loading, refetch: fetch }
}

/**
 * useCreateBooking — creates a booking via API
 */
export function useCreateBooking() {
  const [loading, setLoading] = useState(false)

  const createBooking = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/bookings', data)
      return res.data.data   // returns the new booking object
    } finally {
      setLoading(false)
    }
  }, [])

  return { createBooking, loading }
}

/**
 * useCancelBooking — cancels a booking
 */
export function useCancelBooking() {
  const [loading, setLoading] = useState(false)

  const cancelBooking = useCallback(async (bookingId, reason = '') => {
    setLoading(true)
    try {
      await api.put(`/bookings/${bookingId}/cancel`, { reason })
      toast.success('Booking cancelled successfully.')
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { cancelBooking, loading }
}

/**
 * useUpdateBookingStatus — Admin: update booking status
 */
export function useUpdateBookingStatus() {
  const [loading, setLoading] = useState(false)

  const updateStatus = useCallback(async (bookingId, status, adminNotes = '') => {
    setLoading(true)
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status, adminNotes })
      toast.success(`Booking ${status}.`)
      return res.data.data
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateStatus, loading }
}
