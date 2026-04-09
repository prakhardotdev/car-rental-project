import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Calendar, User, Settings, Star, ChevronRight, Car, Clock, Check, Edit3, Phone, Mail, Save, Camera, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyBookings, useCancelBooking } from '../hooks/useBookings'
import { SkeletonRow } from '../components/Skeleton'
import toast from 'react-hot-toast'

const TABS = [
  {id:'overview',label:'Overview', icon:LayoutDashboard},
  {id:'bookings',label:'Bookings', icon:Calendar},
  {id:'profile', label:'Profile',  icon:User},
  {id:'settings',label:'Settings', icon:Settings},
]
const STATUS_STYLES = { confirmed:'badge-gold', completed:'badge-green', cancelled:'badge-red', pending:'badge-blue', active:'badge-blue' }

export default function Dashboard() {
  const { user, updateProfile } = useAuth()
  const [tab,     setTab]     = useState('overview')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({ name:user?.name||'', phone:user?.phone||'', city:user?.city||'' })
  const [saving,  setSaving]  = useState(false)

  const { bookings, total, loading, refetch } = useMyBookings()
  const { cancelBooking, loading: cancelling } = useCancelBooking()

  const completed = bookings.filter(b=>b.status==='completed').length
  const upcoming  = bookings.filter(b=>['confirmed','active'].includes(b.status)).length
  const spent     = bookings.filter(b=>b.paymentStatus==='paid').reduce((a,b)=>a+b.total,0)

  const handleSaveProfile = async () => {
    setSaving(true)
    try { await updateProfile(profile); setEditing(false) }
    finally { setSaving(false) }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return
    const ok = await cancelBooking(bookingId)
    if (ok) refetch()
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-white">My <span className="text-gradient-gold italic">Dashboard</span></h1>
            <p className="text-night-400 font-body text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          <Link to="/cars" className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2"><Car size={15} /> Book a Car</Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card-dark p-6 mb-4 text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    : <span className="text-night-900 text-2xl font-display font-bold">{user?.name?.charAt(0).toUpperCase()}</span>}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-night-700 border border-white/10 flex items-center justify-center">
                  <Camera size={10} className="text-gold-400" />
                </button>
              </div>
              <p className="font-body font-semibold text-white text-sm">{user?.name}</p>
              <p className="text-night-500 text-xs font-body mt-0.5 truncate px-2">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30">
                <Star size={10} className="text-gold-400 fill-gold-400" />
                <span className="text-gold-300 text-xs font-body font-medium">Premium Member</span>
              </div>
            </div>
            <nav className="card-dark overflow-hidden">
              {TABS.map(({id,label,icon:Icon}) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-body transition-all
                    ${tab===id?'bg-gold-500/15 text-gold-300 border-r-2 border-gold-400':'text-night-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon size={16} />{label}
                  {tab===id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-15}} transition={{duration:0.2}}>

                {/* ── OVERVIEW ── */}
                {tab==='overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        {label:'Total Rentals', value:total},
                        {label:'Completed',     value:completed},
                        {label:'Upcoming',      value:upcoming},
                        {label:'Total Spent',   value:`₹${spent.toLocaleString()}`},
                      ].map(({label,value}) => (
                        <div key={label} className="stat-card">
                          <p className="text-xs font-body text-night-500 uppercase tracking-wider">{label}</p>
                          <p className="font-display text-2xl text-white mt-1">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="card-dark p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="font-body font-semibold text-white">Recent Bookings</h2>
                        <button onClick={() => setTab('bookings')} className="text-xs font-body text-gold-400">View all →</button>
                      </div>
                      <div className="space-y-3">
                        {loading ? Array.from({length:3}).map((_,i)=>(
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-night-700/40">
                            <div className="skeleton w-16 h-12 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2"><div className="skeleton h-3 w-32 rounded-full"/><div className="skeleton h-3 w-48 rounded-full"/></div>
                            <div className="skeleton h-5 w-16 rounded-full" />
                          </div>
                        )) : bookings.slice(0,3).map(b => <BookingRow key={b._id} booking={b} compact />)}
                        {!loading && bookings.length===0 && <p className="text-night-500 font-body text-sm text-center py-6">No bookings yet.</p>}
                      </div>
                    </div>

                    <div className="card-dark p-6 border-gold-500/20">
                      <div className="flex items-center justify-between">
                        <div><h3 className="font-body font-semibold text-white mb-1">Ready for another ride?</h3><p className="text-night-400 text-sm font-body">Browse our latest fleet additions.</p></div>
                        <Link to="/cars" className="btn-gold text-sm px-5 py-2.5 shrink-0">Browse Cars</Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BOOKINGS ── */}
                {tab==='bookings' && (
                  <div className="card-dark p-6">
                    <h2 className="font-body font-semibold text-white mb-6">All Bookings ({total})</h2>
                    {loading ? (
                      <div className="space-y-3">{Array.from({length:5}).map((_,i)=>(
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-night-700/40">
                          <div className="skeleton w-16 h-12 rounded-xl shrink-0" />
                          <div className="flex-1 space-y-2"><div className="skeleton h-3 w-40 rounded-full"/><div className="skeleton h-3 w-56 rounded-full"/></div>
                          <div className="skeleton h-6 w-20 rounded-full" />
                        </div>
                      ))}</div>
                    ) : bookings.length===0 ? (
                      <div className="text-center py-16">
                        <Car size={40} className="text-night-600 mx-auto mb-3" />
                        <p className="text-night-400 font-body">No bookings yet.</p>
                        <Link to="/cars" className="btn-gold text-sm px-6 py-2.5 mt-4 inline-block">Book Your First Car</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(b => <BookingRow key={b._id} booking={b} onCancel={handleCancel} cancelling={cancelling} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PROFILE ── */}
                {tab==='profile' && (
                  <div className="card-dark p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-body font-semibold text-white">My Profile</h2>
                      {!editing
                        ? <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-body text-gold-400 hover:text-gold-300"><Edit3 size={14}/> Edit</button>
                        : <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="text-sm font-body text-night-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
                            <button onClick={handleSaveProfile} disabled={saving} className="btn-gold text-sm px-4 py-1.5 flex items-center gap-2">
                              {saving?<div className="w-3.5 h-3.5 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin"/>:<Save size={13}/>} Save
                            </button>
                          </div>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {[
                        {icon:User,  label:'Full Name',   field:'name',  type:'text'},
                        {icon:Mail,  label:'Email',       field:null,    type:'email', value:user?.email, readOnly:true},
                        {icon:Phone, label:'Phone',       field:'phone', type:'tel'},
                        {icon:User,  label:'City',        field:'city',  type:'text'},
                      ].map(({icon:Icon,label,field,type,value,readOnly}) => (
                        <div key={label}>
                          <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">{label}</label>
                          <div className="relative">
                            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
                            <input type={type} value={field?profile[field]:value}
                              onChange={field&&editing?e=>setProfile(p=>({...p,[field]:e.target.value})):undefined}
                              readOnly={readOnly||!editing}
                              className={`input-dark pl-10 ${(!editing||readOnly)?'opacity-60':''}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SETTINGS ── */}
                {tab==='settings' && (
                  <div className="space-y-4">
                    <div className="card-dark p-6">
                      <h2 className="font-body font-semibold text-white mb-5">Notifications</h2>
                      <div className="space-y-4">
                        {['Booking confirmations','Payment receipts','Promotional offers','Booking reminders'].map(label => (
                          <ToggleSetting key={label} label={label} />
                        ))}
                      </div>
                    </div>
                    <div className="card-dark p-6">
                      <h2 className="font-body font-semibold text-white mb-4">Security</h2>
                      <button className="w-full flex items-center justify-between p-4 rounded-xl bg-night-700/50 hover:bg-night-700 transition-colors group">
                        <div><p className="text-sm font-body text-white">Change Password</p><p className="text-xs font-body text-night-500 mt-0.5">Update your account password</p></div>
                        <ChevronRight size={16} className="text-night-500 group-hover:text-gold-400 transition-colors" />
                      </button>
                    </div>
                    <div className="card-dark p-6 border-red-500/20">
                      <h2 className="font-body font-semibold text-red-400 mb-4">Danger Zone</h2>
                      <button onClick={() => toast.error('Contact support to delete your account.')}
                        className="text-sm font-body text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

function BookingRow({ booking, compact, onCancel, cancelling }) {
  const statusClass = STATUS_STYLES[booking.status] || 'badge-blue'
  const carName  = booking.car?.name  || booking.car
  const carImage = booking.car?.image || ''

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-night-700/40 hover:bg-night-700/70 transition-colors">
      {carImage && <img src={carImage} alt={carName} className="w-16 h-12 object-cover rounded-xl shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-semibold text-white truncate">{carName}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs font-body text-night-500 flex items-center gap-1">
            <Clock size={10}/> {new Date(booking.startDate).toLocaleDateString('en-IN')} → {new Date(booking.endDate).toLocaleDateString('en-IN')}
          </span>
          <span className="text-xs font-body text-night-500">{booking.days}d</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-body font-semibold text-white">₹{booking.total?.toLocaleString()}</p>
        <span className={`${statusClass} mt-1 capitalize`}>{booking.status}</span>
      </div>
      {!compact && ['pending','confirmed'].includes(booking.status) && onCancel && (
        <button onClick={() => onCancel(booking._id)} disabled={cancelling}
          className="ml-2 p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function ToggleSetting({ label }) {
  const [on, setOn] = useState(true)
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm font-body text-white">{label}</p>
      <button onClick={() => setOn(s=>!s)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${on?'bg-gold-400':'bg-night-600'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${on?'translate-x-5':'translate-x-0'}`} />
      </button>
    </div>
  )
}
