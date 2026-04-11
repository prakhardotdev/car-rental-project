import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    navigate(`/cars?q=${query}&location=${location}`)
  }

  return (
    <div className="pt-20 bg-night-900 text-white min-h-screen">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>
          <p className="text-yellow-500 text-sm mb-2">✨ PREMIUM CAR RENTAL</p>

          <h1 className="text-5xl font-bold leading-tight">
            Drive Your <span className="text-yellow-500">Dreams</span> Today.
          </h1>

          <p className="mt-4 text-night-300 max-w-md">
            Handpicked luxury and performance vehicles delivered to your door.
          </p>

          {/* SEARCH */}
          <div className="mt-6 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cars, brands..."
              className="flex-1 px-4 py-2 rounded-lg bg-transparent border border-white/20 text-white placeholder-night-500"
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or location"
              className="flex-1 px-4 py-2 rounded-lg bg-transparent border border-white/20 text-white placeholder-night-500"
            />

            <button
              onClick={handleSearch}
              className="bg-yellow-500 px-4 rounded-lg text-black"
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div>
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
            className="rounded-xl shadow-lg"
          />
        </div>

      </section>

    </div>
  )
}