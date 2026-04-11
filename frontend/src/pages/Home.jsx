import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ArrowRight, ChevronRight, Zap, Award, Clock, Check, Shield, Star } from 'lucide-react'
import CarCard from '../components/CarCard'
import { SkeletonCard } from '../components/Skeleton'
import { useFeaturedCars } from '../hooks/useCars'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }
const CAR_TYPES = ['all', 'Sports', 'SUV', 'Sedan', 'Hatchback']

export default function Home() {
  const navigate = useNavigate()
  const [query,    setQuery]    = useState('')
  const [location, setLocation] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const { cars: featuredCars, loading } = useFeaturedCars()

  const filtered = activeTab === 'all' ? featuredCars : featuredCars.filter(c => c.type === activeTab)

  const handleSearch = () => {
    const p = new URLSearchParams()
    if (query)    p.set('q', query)
    if (location) p.set('location', location)
    navigate(`/cars?${p.toString()}`)
  }

  return (
    <div className="overflow-hidden">
      {/* ── HERO ─────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-azure-600/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
              <motion.div variants={fadeUp}><span className="section-label">✦ Premium Car Rental</span></motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[1.0] font-light text-white">
                Drive Your<span className="block italic text-gradient-gold">Dreams</span><span className="block">Today.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-night-300 text-lg font-body leading-relaxed max-w-md">
                Handpicked luxury and performance vehicles delivered to your door. Experience automotive excellence from ₹3,000/day.
              </motion.p>
              <motion.div variants={fadeUp} className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-glass">
                <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <Search size={16} className="text-gold-400 shrink-0" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cars, brands…"
                    className="flex-1 bg-transparent text-white placeholder-night-500 text-sm font-body focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <MapPin size={16} className="text-gold-400 shrink-0" />
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or location"
                    className="flex-1 bg-transparent text-white placeholder-night-500 text-sm font-body focus:outline-none" />
                </div>
                <button onClick={handleSearch} className="btn-gold px-6 py-3 text-sm flex items-center gap-2 whitespace-nowrap">
                  Search <ArrowRight size={16} />
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-2">
                {[{ value: '200+', label: 'Premium Cars' }, { value: '15k+', label: 'Happy Renters' }, { value: '4.9★', label: 'Avg. Rating' }].map(({ value, label }) => (
                  <div key={label}>
                    <div className="font-display text-2xl font-semibold text-gradient-gold">{value}</div>
                    <div className="text-xs font-body text-night-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-gradient opacity-10 blur-3xl scale-110 rounded-full" />
                <img src="https://images.unsplash.com/photo-1617654112368-307921291f42?w=900&q=80" alt="Mercedes AMG GT"
                  className="relative z-10 w-full h-[420px] object-cover rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-6 top-1/4 glass rounded-2xl p-4 shadow-glass z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center"><Zap size={18} className="text-night-900" /></div>
                    <div><div className="text-xs font-body text-night-400">Top Rated</div><div className="text-sm font-body font-semibold text-white">Mercedes AMG GT</div></div>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0,8,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -right-4 bottom-1/3 glass rounded-2xl px-4 py-3 shadow-glass z-20">
                  <div className="text-xs font-body text-night-400 mb-0.5">Starting at</div>
                  <div className="font-display text-xl font-semibold text-gold-300">₹3,000<span className="text-sm font-body text-night-400 font-normal">/day</span></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" animate={{ y: [0,8,0] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="text-night-500 text-xs font-body">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500/60 to-transparent" />
        </motion.div>
      </section>

      {/* ── FEATURED CARS ─────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <motion.div initial={{ opacity:0,y:30 }} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
              <span className="section-label mb-3 block">Fleet Showcase</span>
              <h2 className="section-title">Featured <span className="italic text-gradient-gold">Vehicles</span></h2>
            </motion.div>
            <div className="flex items-center gap-2 flex-wrap">
              {CAR_TYPES.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`filter-pill capitalize ${activeTab === tab ? 'active' : ''}`}>{tab}</button>
              ))}
            </div>
          </div>
          <motion.div key={activeTab} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array.from({length:8}).map((_,i) => <SkeletonCard key={i} />)
              : filtered.map((car, i) => (
                  <motion.div key={car._id} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-50px'}} transition={{delay:i*0.08}}>
                    <CarCard car={car} />
                  </motion.div>
                ))}
          </motion.div>
          {!loading && filtered.length === 0 && (
            <p className="text-center text-night-500 font-body py-12">No featured cars in this category yet.</p>
          )}
          <div className="text-center mt-10">
            <Link to="/cars" className="btn-ghost inline-flex items-center gap-2">View All Cars <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>

      <div className="divider-gold mx-auto max-w-4xl" />

      {/* ── WHY LUXEDRIVE ─────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
              <span className="section-label mb-3 block">Why Choose Us</span>
              <h2 className="section-title">The LuxeDrive <span className="italic text-gradient-gold">Difference</span></h2>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Fully Insured',    desc: 'Comprehensive coverage included. Drive with complete peace of mind.', color: 'blue' },
              { icon: Zap,    title: 'Instant Booking',  desc: 'Book in under 2 minutes. Real-time availability with instant confirmation.', color: 'gold' },
              { icon: Award,  title: 'Handpicked Fleet', desc: 'Every car is meticulously inspected to meet our premium standards.', color: 'gold' },
              { icon: Clock,  title: '24/7 Support',     desc: 'Round-the-clock concierge support wherever your journey takes you.', color: 'green' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                className="card-dark p-6 hover:border-gold-500/20 hover:shadow-glow transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center ${color==='gold'?'bg-gold-500/15':color==='blue'?'bg-azure-500/15':'bg-emerald-500/15'}`}>
                  <Icon size={22} className={color==='gold'?'text-gold-400':color==='blue'?'text-azure-400':'text-emerald-400'} />
                </div>
                <h3 className="font-body font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm font-body text-night-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────── */}
      <section className="py-24 bg-night-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label mb-3 block">Customer Stories</span>
            <h2 className="section-title">What Our <span className="italic text-gradient-gold">Renters</span> Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name:'Arjun Sharma', city:'Mumbai', car:'Mercedes AMG GT', rating:5, text:'An absolutely unforgettable experience. The car was immaculate and the entire booking process was seamless. LuxeDrive raised the bar completely.' },
              { name:'Priya Mehta', city:'Delhi', car:'Range Rover Autobiography', rating:5, text:'I rented the Range Rover for a weekend trip. It felt like a five-star hotel on wheels. Delivery was on time, car was spotless.' },
              { name:'Rahul Kumar', city:'Bangalore', car:'Porsche 911', rating:5, text:'The Porsche was exactly as advertised — stunning, fast, and thrilling. LuxeDrive made renting a supercar feel completely effortless.' },
            ].map(({ name, city, car, rating, text }, i) => (
              <motion.div key={name} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
                className="card-dark p-7 flex flex-col gap-4">
                <div className="stars">{Array.from({length:rating}).map((_,j) => <Star key={j} size={14} fill="currentColor" />)}</div>
                <p className="text-night-300 font-body text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="divider-gold" />
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-body font-semibold text-white">{name}</div><div className="text-xs font-body text-night-500">{city}</div></div>
                  <div className="badge-gold text-xs">{car}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/8 rounded-full blur-3xl" /></div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <span className="section-label mb-4 block">Ready to Roll?</span>
            <h2 className="font-display text-5xl sm:text-6xl text-white leading-tight mb-6">Your Next Great<span className="block italic text-gradient-gold">Adventure Awaits.</span></h2>
            <p className="text-night-300 font-body text-lg mb-10">Join thousands of satisfied renters. Book your dream car in minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/cars" className="btn-gold px-8 py-4 text-base flex items-center gap-2">Browse All Cars <ArrowRight size={18} /></Link>
              <Link to="/signup" className="btn-ghost px-8 py-4 text-base">Create Free Account</Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {['No hidden fees','Free cancellation','Instant confirmation'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm font-body text-night-400">
                  <Check size={14} className="text-gold-400" /> {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
