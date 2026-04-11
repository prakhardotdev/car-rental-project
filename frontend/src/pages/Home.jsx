import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import CarCard from '../components/CarCard'
import { SkeletonCard } from '../components/Skeleton'
import { useFeaturedCars } from '../hooks/useCars'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const { cars: featuredCars, loading } = useFeaturedCars()

  const handleSearch = () => {
    const p = new URLSearchParams()
    if (query) p.set('q', query)
    if (location) p.set('location', location)
    navigate(`/cars?${p.toString()}`)
  }

  return (
    <div className="overflow-hidden">

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-night-900 dark:to-night-800">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Drive Your <span className="text-yellow-500">Dreams</span> Today
            </h1>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Premium cars at affordable prices. Book instantly.
            </p>

            {/* SEARCH */}
            <div className="mt-6 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cars"
                className="flex-1 px-4 py-2 rounded bg-white text-gray-900 border dark:bg-night-800 dark:text-white"
              />

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="flex-1 px-4 py-2 rounded bg-white text-gray-900 border dark:bg-night-800 dark:text-white"
              />

              <button onClick={handleSearch} className="btn-gold px-4">
                <ArrowRight />
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1549924231-f129b911e442"
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20 bg-white dark:bg-night-900">
        <div className="max-w-7xl mx-auto px-4">

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
            Featured Cars
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredCars.map(car => (
                  <CarCard key={car._id} car={car} />
                ))}
          </div>

        </div>
      </section>
    </div>
  )
}