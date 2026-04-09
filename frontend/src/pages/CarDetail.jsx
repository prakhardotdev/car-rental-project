import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Fuel, Gauge, Zap, ChevronLeft, ChevronRight, Shield, Check, MapPin, Calendar, ArrowRight, Heart } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useCar } from '../hooks/useCars'
import { useAuth } from '../context/AuthContext'
import { SkeletonText } from '../components/Skeleton'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function CarDetail() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { car, loading, error } = useCar(id)

  const [activeImage, setActiveImage] = useState(0)
  const [wishlisted,  setWishlisted]  = useState(false)
  const [startDate,   setStartDate]   = useState(null)
  const [endDate,     setEndDate]     = useState(null)
  const [checking,    setChecking]    = useState(false)
  const [available,   setAvailable]   = useState(null)

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000*60*60*24)))
    : 0

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) { toast.error('Select pickup and return dates first.'); return }
    setChecking(true)
    try {
      const res = await api.get(`/cars/${id}/availability`, { params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } })
      setAvailable(res.data.available)
      if (!res.data.available) toast.error(res.data.reason || 'Not available for these dates.')
      else toast.success('Great! Car is available for your dates.')
    } catch { setAvailable(false) }
    finally { setChecking(false) }
  }

  const handleBook = () => {
    if (!user) { navigate('/login'); return }
    if (!startDate || !endDate) { toast.error('Please select dates first.'); return }
    navigate(`/booking/${id}`, { state: { startDate, endDate } })
  }

  if (loading) return <LoadingSkeleton />

  if (error || !car) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="font-display text-3xl text-white mb-3">Car Not Found</h2>
        <Link to="/cars" className="btn-ghost text-sm px-6 py-3">Back to Cars</Link>
      </div>
    </div>
  )

  const images = car.images?.length ? car.images : [car.image]
  const specs = [
    { label: 'Power',      value: car.power        },
    { label: 'Top Speed',  value: car.topSpeed     },
    { label: '0–100 km/h', value: car.acceleration },
    { label: 'Efficiency', value: car.mileage      },
    { label: 'Seats',      value: `${car.seats} Adults` },
    { label: 'Year',       value: car.year         },
    { label: 'Color',      value: car.color        },
    { label: 'Fuel',       value: car.fuel         },
  ]

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-body text-night-500 mb-8">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link><span>/</span>
          <Link to="/cars" className="hover:text-gold-400 transition-colors">Cars</Link><span>/</span>
          <span className="text-white">{car.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="relative">
              <div className="relative h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-night-800">
                <motion.img key={activeImage} src={images[activeImage]} alt={car.name}
                  className="w-full h-full object-cover"
                  initial={{opacity:0,scale:1.05}} animate={{opacity:1,scale:1}} transition={{duration:0.4}} />
                <div className="absolute inset-0 bg-gradient-to-t from-night-900/40 to-transparent" />
                <button onClick={() => setWishlisted(w=>!w)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center">
                  <Heart size={17} className={wishlisted?'text-red-400 fill-red-400':'text-white'} />
                </button>
                {images.length > 1 && <>
                  <button onClick={() => setActiveImage(i => (i-1+images.length)%images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center">
                    <ChevronLeft size={17} />
                  </button>
                  <button onClick={() => setActiveImage(i => (i+1)%images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center">
                    <ChevronRight size={17} />
                  </button>
                </>}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImage===i?'border-gold-400':'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-gold text-xs">{car.brand}</span>
                    <span className="badge-blue text-xs">{car.type}</span>
                    {!car.available && <span className="badge-red text-xs">Unavailable</span>}
                  </div>
                  <h1 className="font-display text-4xl text-white">{car.name}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="stars"><Star size={14} fill="currentColor" /></div>
                  <span className="font-body font-semibold text-white">{car.rating}</span>
                  <span className="text-night-500 font-body text-sm">({car.totalReviews})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-night-400 font-body text-sm mb-5">
                <MapPin size={14} /> {car.location}
              </div>
              <p className="text-night-300 font-body text-base leading-relaxed">{car.description}</p>
            </div>

            {/* Specs */}
            <div>
              <h2 className="font-body font-semibold text-white text-lg mb-5">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.filter(s => s.value).map(({label,value}) => (
                  <div key={label} className="card-dark p-4">
                    <p className="text-xs font-body text-night-500 mb-1 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-body font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features?.length > 0 && (
              <div>
                <h2 className="font-body font-semibold text-white text-lg mb-5">Features & Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {car.features.map(feat => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm font-body text-night-300">
                      <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-gold-400" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {car.reviews?.length > 0 && (
              <div>
                <h2 className="font-body font-semibold text-white text-lg mb-5">Customer Reviews</h2>
                <div className="space-y-4">
                  {car.reviews.map((rev, i) => (
                    <div key={i} className="card-dark p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                            <span className="text-night-900 text-xs font-bold font-body">{rev.name?.charAt(0) || '?'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-body font-medium text-white">{rev.name}</p>
                            <p className="text-xs font-body text-night-500">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="stars">
                          {Array.from({length:rev.rating}).map((_,j)=><Star key={j} size={12} fill="currentColor"/>)}
                        </div>
                      </div>
                      <p className="text-sm font-body text-night-300 leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card-dark p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="font-display text-3xl text-gradient-gold font-semibold">
                      ₹{car.pricePerDay?.toLocaleString()}
                    </span>
                    <span className="text-night-400 font-body text-sm ml-1">/day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-gold-400 fill-gold-400" />
                    <span className="text-sm font-body text-white font-medium">{car.rating}</span>
                  </div>
                </div>

                {/* Date pickers */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-body text-night-400 mb-1.5 uppercase tracking-wider">Pickup Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 z-10 pointer-events-none" />
                      <DatePicker selected={startDate} onChange={d => { setStartDate(d); setAvailable(null); if(endDate && d>endDate) setEndDate(null) }}
                        minDate={new Date()} placeholderText="Select date"
                        className="input-dark pl-9 text-sm" wrapperClassName="w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-body text-night-400 mb-1.5 uppercase tracking-wider">Return Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 z-10 pointer-events-none" />
                      <DatePicker selected={endDate} onChange={d => { setEndDate(d); setAvailable(null) }}
                        minDate={startDate || new Date()} placeholderText="Select date"
                        className="input-dark pl-9 text-sm" wrapperClassName="w-full" />
                    </div>
                  </div>
                </div>

                {/* Duration + price preview */}
                {days > 0 && (
                  <div className="p-3 rounded-xl bg-gold-500/8 border border-gold-500/20 mb-4">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-night-400">{days} day{days>1?'s':''} × ₹{car.pricePerDay?.toLocaleString()}</span>
                      <span className="text-white font-medium">₹{(days * car.pricePerDay).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body mt-1">
                      <span className="text-night-400">Insurance (5%)</span>
                      <span className="text-white font-medium">₹{Math.round(days * car.pricePerDay * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body font-semibold mt-2 pt-2 border-t border-white/10">
                      <span className="text-white">Total</span>
                      <span className="text-gradient-gold">₹{Math.round(days * car.pricePerDay * 1.05).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Availability result */}
                {available !== null && (
                  <div className={`p-3 rounded-xl mb-4 text-sm font-body ${available ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {available ? '✓ Available for your dates!' : '✗ Not available for selected dates.'}
                  </div>
                )}

                {car.available ? (
                  <div className="space-y-2">
                    {startDate && endDate && available === null && (
                      <button onClick={handleCheckAvailability} disabled={checking}
                        className="w-full btn-ghost py-3 text-sm flex items-center justify-center gap-2">
                        {checking ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>Checking…</> : 'Check Availability'}
                      </button>
                    )}
                    <button onClick={handleBook}
                      disabled={!car.available || (startDate && endDate && available === false)}
                      className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                      {user ? 'Book Now' : 'Sign In to Book'} <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <button disabled className="btn-gold w-full py-3.5 text-sm opacity-40 cursor-not-allowed">Currently Unavailable</button>
                )}

                <div className="mt-4 space-y-2">
                  {[
                    {icon:Shield, text:'Full insurance included'},
                    {icon:Check,  text:'Free cancellation up to 24h'},
                    {icon:Calendar, text:'Flexible date changes'},
                  ].map(({icon:Icon,text}) => (
                    <div key={text} className="flex items-center gap-2 text-xs font-body text-night-400">
                      <Icon size={12} className="text-gold-400 shrink-0" /> {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-[420px] rounded-3xl" />
            <div className="skeleton h-10 w-64 rounded-full" />
            <SkeletonText lines={4} />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          </div>
          <div className="card-dark p-6 h-80 skeleton" />
        </div>
      </div>
    </div>
  )
}
