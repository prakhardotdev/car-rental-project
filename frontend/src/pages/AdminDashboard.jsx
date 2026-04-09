import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Car, Calendar, Users, BarChart3, Plus, Edit, Trash2, Eye, Search, DollarSign, Upload, X, Save } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAdminStats, useAdminUsers, useAdminCars } from '../hooks/useAdmin'
import { useAllBookings, useUpdateBookingStatus } from '../hooks/useBookings'
import { SkeletonStat, SkeletonRow } from '../components/Skeleton'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TABS = [
  {id:'dashboard',label:'Dashboard', icon:LayoutDashboard},
  {id:'cars',     label:'Cars',      icon:Car},
  {id:'bookings', label:'Bookings',  icon:Calendar},
  {id:'users',    label:'Users',     icon:Users},
  {id:'analytics',label:'Analytics', icon:BarChart3},
]
const STATUS_COLORS = { confirmed:'badge-gold', completed:'badge-green', cancelled:'badge-red', pending:'badge-blue', active:'badge-blue' }

export default function AdminDashboard() {
  const [tab,        setTab]        = useState('dashboard')
  const [carSearch,  setCarSearch]  = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [showAddCar, setShowAddCar] = useState(false)
  const [editCar,    setEditCar]    = useState(null)

  const { stats,    loading: statsLoading,   refetch: refetchStats  } = useAdminStats()
  const { cars,     loading: carsLoading,    refetch: refetchCars   } = useAdminCars({ q: carSearch  })
  const { bookings, loading: bookingsLoading,refetch: refetchBookings} = useAllBookings({ q: bookSearch })
  const { users,    loading: usersLoading                            } = useAdminUsers({ search: userSearch })
  const { updateStatus } = useUpdateBookingStatus()

  const handleStatusChange = async (bookingId, status) => {
    await updateStatus(bookingId, status)
    refetchBookings()
  }

  const handleDeleteCar = async (id) => {
    if (!confirm('Delete this car permanently?')) return
    try {
      await api.delete(`/cars/${id}`)
      toast.success('Car deleted.')
      refetchCars()
    } catch {}
  }

  const handleToggleAvailability = async (id) => {
    try {
      await api.put(`/admin/cars/${id}/availability`)
      refetchCars()
    } catch {}
  }

  const handleToggleFeatured = async (id) => {
    try {
      await api.put(`/admin/cars/${id}/featured`)
      toast.success('Featured status updated.')
      refetchCars()
    } catch {}
  }

  const kpis = stats ? [
    { icon:Calendar,   label:'Total Bookings', value:stats.overview.totalBookings.toLocaleString(),           change:'+12%', color:'blue'   },
    { icon:DollarSign, label:'Revenue',        value:`₹${(stats.overview.totalRevenue/100000).toFixed(1)}L`, change:'+18%', color:'gold'   },
    { icon:Users,      label:'Active Users',   value:stats.overview.totalUsers.toLocaleString(),              change:'+5%',  color:'green'  },
    { icon:Car,        label:'Fleet Size',     value:stats.overview.totalCars.toLocaleString(),               change:'+3',   color:'purple' },
  ] : []

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="section-label mb-1 block">Admin Panel</span>
            <h1 className="font-display text-3xl text-white">LuxeDrive <span className="text-gradient-gold italic">Control Center</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-body text-night-400">System Online</span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 hidden lg:block">
            <nav className="card-dark overflow-hidden">
              {TABS.map(({id,label,icon:Icon}) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-body transition-all
                    ${tab===id?'bg-gold-500/15 text-gold-300 border-r-2 border-gold-400':'text-night-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon size={16}/>{label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 w-full">
            {TABS.map(({id,icon:Icon}) => (
              <button key={id} onClick={() => setTab(id)}
                className={`shrink-0 p-3 rounded-xl border transition-all ${tab===id?'border-gold-400/50 bg-gold-500/10 text-gold-300':'border-white/10 text-night-400'}`}>
                <Icon size={18}/>
              </button>
            ))}
          </div>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>

                {/* ── DASHBOARD ── */}
                {tab==='dashboard' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {statsLoading
                        ? Array.from({length:4}).map((_,i)=><SkeletonStat key={i}/>)
                        : kpis.map(({icon:Icon,label,value,change,color}) => (
                          <div key={label} className="stat-card">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${color==='blue'?'bg-azure-500/15':color==='gold'?'bg-gold-500/15':color==='green'?'bg-emerald-500/15':'bg-purple-500/15'}`}>
                                <Icon size={18} className={color==='blue'?'text-azure-400':color==='gold'?'text-gold-400':color==='green'?'text-emerald-400':'text-purple-400'}/>
                              </div>
                              <span className="text-xs font-body font-medium text-emerald-400">{change}</span>
                            </div>
                            <p className="font-display text-2xl text-white">{value}</p>
                            <p className="text-xs font-body text-night-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                    </div>

                    {/* Revenue chart */}
                    {stats && (
                      <div className="card-dark p-6">
                        <h3 className="font-body font-semibold text-white mb-5">Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={stats.monthlyRevenue} margin={{top:0,right:0,left:-10,bottom:0}}>
                            <XAxis dataKey="month" tick={{fill:'#7A8099',fontSize:12,fontFamily:'Outfit'}} axisLine={false} tickLine={false}
                              tickFormatter={v=>`${v.month}/${v.year}`} />
                            <YAxis tick={{fill:'#7A8099',fontSize:11,fontFamily:'Outfit'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                            <Tooltip contentStyle={{background:'#0f1a38',border:'1px solid rgba(200,162,50,0.2)',borderRadius:12,fontFamily:'Outfit',fontSize:13,color:'#fff'}}
                              formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']} cursor={{fill:'rgba(200,162,50,0.05)'}}/>
                            <Bar dataKey="revenue" fill="#c8a232" radius={[6,6,0,0]}/>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Recent bookings */}
                    <div className="card-dark p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-body font-semibold text-white">Recent Bookings</h3>
                        <button onClick={() => setTab('bookings')} className="text-xs font-body text-gold-400">View all →</button>
                      </div>
                      {statsLoading ? (
                        <table className="table-dark"><tbody>{Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={5}/>)}</tbody></table>
                      ) : (
                        <BookingsTable bookings={stats?.recentBookings?.slice(0,5)||[]} onStatusChange={handleStatusChange} compact />
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARS ── */}
                {tab==='cars' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400"/>
                          <input value={carSearch} onChange={e=>setCarSearch(e.target.value)} placeholder="Search cars…" className="input-dark pl-9 py-2.5 text-sm w-56"/>
                        </div>
                        <span className="text-night-500 text-sm font-body">{cars.length} cars</span>
                      </div>
                      <button onClick={() => setShowAddCar(true)} className="btn-gold text-sm px-4 py-2.5 flex items-center gap-2">
                        <Plus size={15}/> Add Car
                      </button>
                    </div>
                    <div className="card-dark overflow-hidden">
                      <table className="table-dark">
                        <thead><tr><th>Car</th><th>Type / Fuel</th><th>Price/Day</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
                        <tbody>
                          {carsLoading ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={6}/>) :
                            cars.map(car => (
                              <tr key={car._id}>
                                <td>
                                  <div className="flex items-center gap-3">
                                    <img src={car.image} alt={car.name} className="w-12 h-9 object-cover rounded-lg shrink-0"/>
                                    <div>
                                      <p className="text-white font-medium text-sm">{car.name}</p>
                                      <p className="text-night-500 text-xs">{car.brand} · {car.year}</p>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="badge-blue text-xs">{car.type}</span><p className="text-night-500 text-xs mt-1">{car.fuel}</p></td>
                                <td className="font-medium text-gold-300">₹{car.pricePerDay?.toLocaleString()}</td>
                                <td>
                                  <button onClick={() => handleToggleAvailability(car._id)}
                                    className={`${car.available?'badge-green':'badge-red'} cursor-pointer hover:opacity-80 transition-opacity`}>
                                    {car.available?'Available':'Unavailable'}
                                  </button>
                                </td>
                                <td className="text-night-300">⭐ {car.rating}</td>
                                <td>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleToggleFeatured(car._id)} title={car.featured?'Unfeature':'Feature'}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${car.featured?'text-gold-400 bg-gold-500/10':'text-night-500 hover:text-gold-400'}`}>★</button>
                                    <button onClick={() => setEditCar(car)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gold-400 hover:bg-gold-500/10 transition-colors"><Edit size={14}/></button>
                                    <button onClick={() => handleDeleteCar(car._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14}/></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <AnimatePresence>
                      {(showAddCar || editCar) && <CarFormModal car={editCar} onClose={() => { setShowAddCar(false); setEditCar(null) }} onSuccess={() => { setShowAddCar(false); setEditCar(null); refetchCars() }} />}
                    </AnimatePresence>
                  </div>
                )}

                {/* ── BOOKINGS ── */}
                {tab==='bookings' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400"/>
                        <input value={bookSearch} onChange={e=>setBookSearch(e.target.value)} placeholder="Search bookings…" className="input-dark pl-9 py-2.5 text-sm w-56"/>
                      </div>
                    </div>
                    <div className="card-dark overflow-hidden">
                      {bookingsLoading
                        ? <table className="table-dark"><tbody>{Array.from({length:8}).map((_,i)=><SkeletonRow key={i} cols={6}/>)}</tbody></table>
                        : <BookingsTable bookings={bookings} onStatusChange={handleStatusChange} />}
                    </div>
                  </div>
                )}

                {/* ── USERS ── */}
                {tab==='users' && (
                  <div className="space-y-5">
                    <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400"/>
                      <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…" className="input-dark pl-9 py-2.5 text-sm w-56"/>
                    </div>
                    <div className="card-dark overflow-hidden">
                      <table className="table-dark">
                        <thead><tr><th>User</th><th>Phone</th><th>Bookings</th><th>Total Spent</th><th>Joined</th><th>Status</th></tr></thead>
                        <tbody>
                          {usersLoading ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={6}/>) :
                            users.map(u => (
                              <tr key={u._id}>
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                                      {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : <span className="text-night-900 text-xs font-bold font-body">{u.name?.charAt(0)}</span>}
                                    </div>
                                    <div><p className="text-white font-medium text-sm">{u.name}</p><p className="text-night-500 text-xs">{u.email}</p></div>
                                  </div>
                                </td>
                                <td className="text-night-300">{u.phone||'—'}</td>
                                <td className="text-white font-medium">{u.totalBookings||0}</td>
                                <td className="text-gold-300 font-medium">₹{(u.totalSpent||0).toLocaleString()}</td>
                                <td className="text-night-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                <td><span className={u.isActive?'badge-green':'badge-red'}>{u.isActive?'Active':'Inactive'}</span></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ANALYTICS ── */}
                {tab==='analytics' && stats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {label:'Pending Bookings', value:stats.overview.pendingBookings, change:'', up:false},
                        {label:'Available Cars',   value:stats.overview.availableCars,   change:'', up:true},
                        {label:'Total Revenue',    value:`₹${(stats.overview.totalRevenue/100000).toFixed(1)}L`, change:'', up:true},
                        {label:'Total Users',      value:stats.overview.totalUsers,       change:'', up:true},
                      ].map(({label,value}) => (
                        <div key={label} className="stat-card"><p className="text-xs font-body text-night-500 uppercase tracking-wider">{label}</p>
                          <p className="font-display text-2xl text-white mt-1">{value}</p></div>
                      ))}
                    </div>
                    <div className="card-dark p-6">
                      <h3 className="font-body font-semibold text-white mb-5">Monthly Bookings Trend</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={stats.monthlyRevenue} margin={{top:0,right:0,left:-15,bottom:0}}>
                          <XAxis dataKey="month" tick={{fill:'#7A8099',fontSize:12,fontFamily:'Outfit'}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:'#7A8099',fontSize:11,fontFamily:'Outfit'}} axisLine={false} tickLine={false}/>
                          <Tooltip contentStyle={{background:'#0f1a38',border:'1px solid rgba(200,162,50,0.2)',borderRadius:12,fontFamily:'Outfit',fontSize:13,color:'#fff'}}/>
                          <Line type="monotone" dataKey="bookings" stroke="#c8a232" strokeWidth={2.5} dot={{fill:'#c8a232',strokeWidth:0,r:4}} activeDot={{r:6}}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {stats.topCars?.length > 0 && (
                      <div className="card-dark p-6">
                        <h3 className="font-body font-semibold text-white mb-5">Top Performing Cars</h3>
                        <div className="space-y-3">
                          {stats.topCars.map((car, i) => (
                            <div key={car._id} className="flex items-center gap-4">
                              <span className="w-6 text-center text-xs font-body text-night-500 font-medium">#{i+1}</span>
                              <img src={car.image} alt={car.name} className="w-12 h-9 object-cover rounded-lg shrink-0"/>
                              <div className="flex-1">
                                <p className="text-sm font-body text-white font-medium">{car.name}</p>
                                <div className="mt-1.5 h-1.5 bg-night-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-gold-gradient rounded-full" style={{width:`${Math.max(20, 100 - i*18)}%`}}/>
                                </div>
                              </div>
                              <span className="text-xs font-body text-night-400 shrink-0">{car.bookingCount} bookings</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

/* ── BookingsTable ────────────────────────────────── */
function BookingsTable({ bookings, onStatusChange, compact }) {
  return (
    <table className="table-dark">
      <thead><tr><th>Ref</th><th>User</th><th>Car</th>{!compact&&<th>Date</th>}<th>Amount</th><th>Status</th>{!compact&&<th>Actions</th>}</tr></thead>
      <tbody>
        {bookings.map(b => (
          <tr key={b._id||b.id}>
            <td className="font-mono text-xs text-night-500">{b.bookingRef}</td>
            <td className="text-white">{b.user?.name||b.user}</td>
            <td className="text-night-300">{b.car?.name||b.car}</td>
            {!compact&&<td className="text-night-400">{new Date(b.createdAt||b.date).toLocaleDateString('en-IN')}</td>}
            <td className="text-gold-300 font-medium">₹{b.total?.toLocaleString()}</td>
            <td><span className={STATUS_COLORS[b.status]||'badge-blue'}>{b.status}</span></td>
            {!compact&&(
              <td>
                <div className="flex items-center gap-1">
                  {b.status==='pending'&&<>
                    <button onClick={()=>onStatusChange(b._id,'confirmed')} className="px-2 py-1 text-xs font-body rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Approve</button>
                    <button onClick={()=>onStatusChange(b._id,'rejected')} className="px-2 py-1 text-xs font-body rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25">Reject</button>
                  </>}
                  {b.status==='confirmed'&&<button onClick={()=>onStatusChange(b._id,'cancelled')} className="px-2 py-1 text-xs font-body rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25">Cancel</button>}
                  {b.status==='active'&&<button onClick={()=>onStatusChange(b._id,'completed')} className="px-2 py-1 text-xs font-body rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Complete</button>}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── CarFormModal (Add / Edit) ───────────────────── */
function CarFormModal({ car, onClose, onSuccess }) {
  const isEdit = !!car
  const [form, setForm] = useState(car ? {
    name:car.name, brand:car.brand, year:car.year, type:car.type, fuel:car.fuel,
    transmission:car.transmission, seats:car.seats, pricePerDay:car.pricePerDay,
    power:car.power||'', location:car.location, description:car.description||'',
  } : { name:'', brand:'', year:new Date().getFullYear(), type:'Sports', fuel:'Petrol', transmission:'Automatic', seats:5, pricePerDay:'', power:'', location:'', description:'' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(car?.image||'')
  const [saving, setSaving] = useState(false)

  const update = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k,v]) => formData.append(k, v))
      if (imageFile) formData.append('images', imageFile)

      if (isEdit) {
        await api.put(`/cars/${car._id}`, formData, { headers: {'Content-Type':'multipart/form-data'} })
        toast.success('Car updated!')
      } else {
        await api.post('/cars', formData, { headers: {'Content-Type':'multipart/form-data'} })
        toast.success('Car added!')
      }
      onSuccess()
    } catch { toast.error('Failed to save car.') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-900/80 backdrop-blur-sm"
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}}
        className="card-dark w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-body font-semibold text-white text-xl">{isEdit?'Edit Car':'Add New Car'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-night-400 hover:text-white hover:bg-white/5"><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Car Name *</label>
              <input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="e.g. Porsche 911 GT3" className="input-dark" required/></div>
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Brand *</label>
              <input value={form.brand} onChange={e=>update('brand',e.target.value)} placeholder="e.g. Porsche" className="input-dark" required/></div>
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Year</label>
              <input type="number" value={form.year} onChange={e=>update('year',e.target.value)} className="input-dark"/></div>
            {[
              {label:'Type', field:'type', opts:['Sports','SUV','Sedan','Hatchback','Convertible','Pickup','Van']},
              {label:'Fuel', field:'fuel', opts:['Petrol','Diesel','Electric','Hybrid','CNG']},
              {label:'Gearbox', field:'transmission', opts:['Automatic','Manual']},
            ].map(({label,field,opts}) => (
              <div key={field}><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">{label}</label>
                <select value={form[field]} onChange={e=>update(field,e.target.value)} className="input-dark">
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select></div>
            ))}
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Seats</label>
              <input type="number" min={1} max={9} value={form.seats} onChange={e=>update('seats',e.target.value)} className="input-dark"/></div>
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Price/Day (₹) *</label>
              <input type="number" value={form.pricePerDay} onChange={e=>update('pricePerDay',e.target.value)} placeholder="5000" className="input-dark" required/></div>
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Power</label>
              <input value={form.power} onChange={e=>update('power',e.target.value)} placeholder="450 HP" className="input-dark"/></div>
            <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Location *</label>
              <input value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Mumbai" className="input-dark" required/></div>
          </div>
          <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e=>update('description',e.target.value)} rows={3} className="input-dark resize-none"/></div>
          {/* Image upload */}
          <div>
            <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Car Image {isEdit?'(leave empty to keep current)':' *'}</label>
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-3"/>}
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-white/15 rounded-xl hover:border-gold-500/30 transition-colors cursor-pointer">
              <Upload size={22} className="text-night-500"/>
              <span className="text-sm font-body text-night-500">{imageFile?imageFile.name:'Click to upload image'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost py-3 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold py-3 text-sm flex items-center justify-center gap-2">
              {saving?<><div className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin"/>Saving…</>:<><Save size={14}/>{isEdit?'Update Car':'Add Car'}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
