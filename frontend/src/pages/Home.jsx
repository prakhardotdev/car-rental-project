import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    navigate(`/cars?q=${query}&location=${location}`)
  }

  return (
    <div className="pt-20">

      {/* HERO */}
      <section className="min-h-screen flex items-center bg-gradient-to-r from-gray-200 to-gray-300 dark:from-night-900 dark:to-night-800">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Drive Your <span className="text-yellow-500">Dreams</span> Today
            </h1>

            <p className="mt-4 text-gray-600 dark:text-night-300">
              Premium cars at affordable prices. Book instantly.
            </p>

            {/* SEARCH */}
            <div className="mt-6 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cars"
                className="flex-1 px-4 py-2 rounded border bg-white text-gray-900 dark:bg-night-800 dark:text-white"
              />

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="flex-1 px-4 py-2 rounded border bg-white text-gray-900 dark:bg-night-800 dark:text-white"
              />

              <button onClick={handleSearch} className="bg-yellow-500 px-4 rounded text-black">
                <ArrowRight />
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1549924231-f129b911e442"
            className="rounded-xl shadow-xl"
          />

        </div>
      </section>

    </div>
  )
}