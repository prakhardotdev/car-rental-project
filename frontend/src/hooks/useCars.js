import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

/**
 * useCars — fetches cars from the real API with filters + pagination
 * Falls back to empty array on error (never crashes the UI)
 */
export function useCars(params = {}) {
  const [cars,    setCars]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
      ).toString()
      const res = await api.get(`/cars?${query}`)
      setCars(res.data.data)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setError(err.message)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { cars, total, pages, loading, error, refetch: fetch }
}

/**
 * useCar — fetches a single car by ID
 */
export function useCar(id) {
  const [car,     setCar]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/cars/${id}`)
      .then(res => setCar(res.data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { car, loading, error }
}

/**
 * useFeaturedCars — fetches featured cars for home page
 */
export function useFeaturedCars() {
  const [cars,    setCars]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cars/featured')
      .then(res => setCars(res.data.data))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [])

  return { cars, loading }
}

/**
 * useCarFilters — fetches available brands and locations for filter dropdowns
 */
export function useCarFilters() {
  const [brands,    setBrands]    = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/cars/brands'),
      api.get('/cars/locations'),
    ]).then(([b, l]) => {
      setBrands(b.data.data)
      setLocations(l.data.data)
    }).catch(() => {})
  }, [])

  return { brands, locations }
}

/**
 * useAvailability — checks if a car is available for given dates
 */
export function useAvailability(carId, startDate, endDate) {
  const [available, setAvailable] = useState(null)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    if (!carId || !startDate || !endDate) { setAvailable(null); return }
    setLoading(true)
    api.get(`/cars/${carId}/availability`, { params: { startDate, endDate } })
      .then(res => setAvailable(res.data.available))
      .catch(() => setAvailable(null))
      .finally(() => setLoading(false))
  }, [carId, startDate?.toString(), endDate?.toString()])

  return { available, loading }
}
