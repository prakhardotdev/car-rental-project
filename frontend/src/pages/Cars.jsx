import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import CarCard from '../components/CarCard'
import { SkeletonCard } from '../components/Skeleton'
import { useCars, useCarFilters } from '../hooks/useCars'

const TYPES        = ['All','Sports','SUV','Sedan','Hatchback','Convertible','Pickup','Van']
const FUELS        = ['All','Petrol','Diesel','Electric','Hybrid','CNG']
const TRANSMISSIONS= ['All','Automatic','Manual']
const SORT_OPTIONS = [
  { label: 'Price: Low → High',  value: 'price_asc'  },
  { label: 'Price: High → Low',  value: 'price_desc' },
  { label: 'Top Rated',          value: 'rating'     },
  { label: 'Most Reviewed',      value: 'reviews'    },
  { label: 'Newest First',       value: 'newest'     },
]

export default function Cars() {
  const [searchParams] = useSearchParams()
  const { brands, locations } = useCarFilters()

  const [query,        setQuery]        = useState(searchParams.get('q') || '')
  const [brand,        setBrand]        = useState('All')
  const [type,         setType]         = useState('All')
  const [fuel,         setFuel]         = useState('All')
  const [transmission, setTransmission] = useState('All')
  const [maxPrice,     setMaxPrice]     = useState(20000)
  const [sortBy,       setSortBy]       = useState('price_asc')
  const [page,         setPage]         = useState(1)
  const [showFilters,  setShowFilters]  = useState(false)
  const [viewMode,     setViewMode]     = useState('grid')

  // Build query params for the API
  const apiParams = useMemo(() => ({
    ...(query        && { q: query }),
    ...(brand  !== 'All' && { brand }),
    ...(type   !== 'All' && { type  }),
    ...(fuel   !== 'All' && { fuel  }),
    ...(transmission !== 'All' && { transmission }),
    maxPrice,
    sort: sortBy,
    page,
    limit: 12,
  }), [query, brand, type, fuel, transmission, maxPrice, sortBy, page])

  const { cars, total, pages, loading } = useCars(apiParams)

  const hasActiveFilters = brand !== 'All' || type !== 'All' || fuel !== 'All' ||
    transmission !== 'All' || maxPrice < 20000 || query

  const clearFilters = () => {
    setBrand('All'); setType('All'); setFuel('All')
    setTransmission('All'); setMaxPrice(20000); setQuery(''); setPage(1)
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-night-800/40 border-b border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-white">Browse <span className="text-gradient-gold italic">All Cars</span></h1>
              <p className="text-night-400 font-body text-sm mt-1">
                {loading ? 'Searching…' : `${total} vehicles found`}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 bg-night-800 border border-white/10 rounded-xl px-3 py-2.5">
                <Search size={15} className="text-night-400" />
                <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
                  placeholder="Search…"
                  className="bg-transparent text-white placeholder-night-500 text-sm font-body w-36 focus:outline-none" />
                {query && <button onClick={() => { setQuery(''); setPage(1) }}><X size={13} className="text-night-500 hover:text-white" /></button>}
              </div>
              {/* Sort */}
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
                className="input-dark py-2.5 pr-8 text-sm w-auto cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {/* Filter toggle */}
              <button onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-body font-medium transition-all
                  ${showFilters ? 'bg-gold-500/15 border-gold-400/40 text-gold-300' : 'border-white/10 text-night-300 hover:border-white/20 hover:text-white'}`}>
                <SlidersHorizontal size={15} />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold-400" />}
              </button>
              {/* View toggle */}
              <div className="flex border border-white/10 rounded-xl overflow-hidden">
                {[{icon:Grid,mode:'grid'},{icon:List,mode:'list'}].map(({icon:Icon,mode}) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2.5 transition-colors ${viewMode===mode?'bg-white/10 text-gold-300':'text-night-400 hover:text-white'}`}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden mb-8">
              <div className="card-dark p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-body font-semibold">Filters</h3>
                  {hasActiveFilters && <button onClick={clearFilters} className="text-xs font-body text-gold-400 hover:text-gold-300 flex items-center gap-1"><X size={12} /> Clear all</button>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {/* Brand */}
                  <div>
                    <label className="text-xs font-body text-night-400 font-medium block mb-2 uppercase tracking-wider">Brand</label>
                    <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className="input-dark text-sm py-2">
                      {['All', ...brands].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <FilterGroup label="Type"  options={TYPES}         value={type}         onChange={v => { setType(v); setPage(1) }} />
                  <FilterGroup label="Fuel"  options={FUELS}         value={fuel}         onChange={v => { setFuel(v); setPage(1) }} />
                  <FilterGroup label="Gearbox" options={TRANSMISSIONS} value={transmission} onChange={v => { setTransmission(v); setPage(1) }} />
                  {/* Price range */}
                  <div className="col-span-2">
                    <label className="text-xs font-body text-night-400 font-medium block mb-2 uppercase tracking-wider">Max Price / Day</label>
                    <p className="text-sm font-body text-white mb-3">Up to ₹{maxPrice.toLocaleString()}</p>
                    <input type="range" min="1000" max="20000" step="500"
                      value={maxPrice} onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1) }}
                      className="w-full accent-gold-400" />
                    <div className="flex justify-between text-xs font-body text-night-600 mt-1">
                      <span>₹1,000</span><span>₹20,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              brand !== 'All' && { label: brand, clear: () => setBrand('All') },
              type  !== 'All' && { label: type,  clear: () => setType('All')  },
              fuel  !== 'All' && { label: fuel,  clear: () => setFuel('All')  },
              transmission !== 'All' && { label: transmission, clear: () => setTransmission('All') },
              maxPrice < 20000 && { label: `≤₹${maxPrice.toLocaleString()}`, clear: () => setMaxPrice(20000) },
              query && { label: `"${query}"`, clear: () => setQuery('') },
            ].filter(Boolean).map(({ label, clear }) => (
              <button key={label} onClick={clear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-body hover:bg-gold-500/25 transition-colors">
                {label} <X size={11} />
              </button>
            ))}
          </div>
        )}

        {/* Cars grid */}
        {!loading && cars.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="font-display text-2xl text-white mb-2">No cars found</h3>
            <p className="text-night-400 font-body text-sm mb-6">Try adjusting your filters or search term.</p>
            <button onClick={clearFilters} className="btn-ghost text-sm px-6 py-2.5">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={`grid gap-5 ${viewMode==='grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {loading
                ? Array.from({length:12}).map((_,i) => <SkeletonCard key={i} />)
                : cars.map((car, i) => (
                    <motion.div key={car._id} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.04}}>
                      <CarCard car={car} />
                    </motion.div>
                  ))}
            </div>

            {/* Pagination */}
            {pages > 1 && !loading && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-night-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({length:pages}, (_,i) => i+1).filter(p => p===1 || p===pages || Math.abs(p-page)<=1).map((p, i, arr) => (
                  <span key={p}>
                    {i>0 && arr[i-1]!==p-1 && <span className="text-night-600 px-1">…</span>}
                    <button onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-body font-medium transition-all
                        ${page===p ? 'bg-gold-gradient text-night-900 shadow-gold' : 'border border-white/10 text-night-400 hover:text-white hover:border-white/20'}`}>
                      {p}
                    </button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-night-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-body text-night-400 font-medium block mb-2 uppercase tracking-wider">{label}</label>
      <div className="flex flex-col gap-1">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`text-left text-sm font-body px-2 py-1.5 rounded-lg transition-colors ${value===opt?'text-gold-300 bg-gold-500/10':'text-night-400 hover:text-white hover:bg-white/5'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
