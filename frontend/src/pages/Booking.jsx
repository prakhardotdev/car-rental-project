import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Shield, Check, ChevronRight, CreditCard, User, Phone, AlertCircle, Clock } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import { useCar } from '../hooks/useCars'
import { useCreateBooking } from '../hooks/useBookings'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const STEPS = ['Details', 'Dates', 'Payment', 'Confirm']

export default function Booking() {
  const { id }           = useParams()
  const { user }         = useAuth()
  const navigate         = useNavigate()
  const locationState    = useLocation().state || {}

  const { car, loading: carLoading } = useCar(id)
  const { createBooking, loading: bookingLoading } = useCreateBooking()

  const [step,      setStep]      = useState(0)
  const [startDate, setStartDate] = useState(locationState.startDate ? new Date(locationState.startDate) : null)
  const [endDate,   setEndDate]   = useState(locationState.endDate   ? new Date(locationState.endDate)   : null)
  const [pickup,    setPickup]    = useState('')
  const [dropoff,   setDropoff]   = useState('')
  const [notes,     setNotes]     = useState('')
  const [payMethod, setPayMethod] = useState('card')
  const [booking,   setBooking]   = useState(null)  // created booking object
  const [paying,    setPaying]    = useState(false)

  useEffect(() => { if (car?.location) { setPickup(car.location); setDropoff(car.location) } }, [car])

  if (carLoading) return <div className="pt-28 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>
  if (!car) return <div className="pt-28 min-h-screen flex items-center justify-center"><Link to="/cars" className="btn-ghost px-6 py-3 text-sm">Back to Cars</Link></div>

  const days     = startDate && endDate ? Math.max(1, Math.ceil((endDate - startDate) / (1000*60*60*24))) : 0
  const subtotal = days * (car.pricePerDay || 0)
  const insurance= Math.round(subtotal * 0.05)
  const total    = subtotal + insurance

  const canProceed = () => {
    if (step === 0 && (!pickup || !dropoff)) return false
    if (step === 1 && (!startDate || !endDate)) return false
    return true
  }

  const handleNext = () => {
    if (!canProceed()) { toast.error('Please fill all required fields.'); return }
    setStep(s => s + 1)
  }

  // Step 3: Create booking via API, then handle payment
 const handleConfirm = async () => {
  // ❗ date validation
  if (!startDate || !endDate) {
    toast.error("Please select dates")
    return
  }

  if (new Date(startDate) < new Date()) {
    toast.error("Start date cannot be in past")
    return
  }

  setPaying(true)

  try {
    const start = new Date(startDate)
    start.setHours(12, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(12, 0, 0, 0)

    const newBooking = await createBooking({
      carId: car._id,

      startDate: start.toISOString(),
      endDate: end.toISOString(),

      pickupLocation: pickup,
      dropoffLocation: dropoff,

      paymentMethod: payMethod,
      notes,

      totalAmount: total,
      days: days,
      pricePerDay: car.pricePerDay,
    })

    // 🔥 STRIPE REMOVE — DIRECT SUCCESS
    toast.success(`Booking confirmed! Ref: ${newBooking.bookingRef} 🎉`)

    navigate('/dashboard')

  } catch (err) {
    console.log(err.response?.data)
    toast.error(err.response?.data?.message || 'Booking failed')
  } finally {
    setPaying(false)
  }
}
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-body text-night-500 mb-8">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link><span>/</span>
          <Link to="/cars" className="hover:text-gold-400 transition-colors">Cars</Link><span>/</span>
          <Link to={`/cars/${car._id}`} className="hover:text-gold-400 transition-colors">{car.name}</Link><span>/</span>
          <span className="text-white">Booking</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-10 gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-body font-semibold transition-all duration-300 border-2
                  ${i<step?'bg-gold-gradient border-gold-500 text-night-900':i===step?'border-gold-400 text-gold-400 bg-gold-500/10':'border-night-600 text-night-500 bg-night-800'}`}>
                  {i < step ? <Check size={15} /> : i+1}
                </div>
                <span className={`text-xs font-body mt-1.5 ${i===step?'text-gold-400':'text-night-500'}`}>{label}</span>
              </div>
              {i < STEPS.length-1 && <div className={`h-0.5 flex-1 mb-5 transition-colors duration-500 ${i<step?'bg-gold-500/60':'bg-night-700'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Step content ── */}
          <div className="lg:col-span-2">
            <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3}}>

              {/* Step 0 — Driver details */}
              {step === 0 && (
                <div className="card-dark p-7 space-y-5">
                  <h2 className="font-body font-semibold text-white text-xl">Driver Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field icon={User}  label="Full Name"      value={user?.name  || ''} readOnly placeholder="Your name" />
                    <Field icon={User}  label="Email"          value={user?.email || ''} readOnly placeholder="Email" />
                    <Field icon={Phone} label="Phone Number"   value={user?.phone || ''} readOnly placeholder="+91 98765 43210" />
                    <Field icon={MapPin} label="Pickup Location"  value={pickup}  onChange={setPickup}  placeholder="City / Airport / Hotel" />
                    <Field icon={MapPin} label="Drop-off Location" value={dropoff} onChange={setDropoff} placeholder="Same as pickup?" />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Special Requests (optional)</label>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
                      placeholder="Child seat, GPS, delivery instructions…" className="input-dark resize-none" />
                  </div>
                </div>
              )}

              {/* Step 1 — Dates */}
              {step === 1 && (
                <div className="card-dark p-7 space-y-6">
                  <h2 className="font-body font-semibold text-white text-xl">Select Your Dates</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { label:'Pickup Date',  selected:startDate, onChange:d=>{setStartDate(d);if(endDate&&d>endDate)setEndDate(null)}, minDate:new Date() },
                      { label:'Return Date',  selected:endDate,   onChange:setEndDate, minDate:startDate||new Date() },
                    ].map(({label,selected,onChange,minDate}) => (
                      <div key={label}>
                        <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">{label}</label>
                        <div className="relative">
                          <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400 z-10 pointer-events-none" />
                          <DatePicker selected={selected} onChange={onChange} minDate={minDate}
                            placeholderText="Select date" className="input-dark pl-10" wrapperClassName="w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {days > 0 && (
                    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                      className="p-5 rounded-2xl bg-gold-500/8 border border-gold-500/20">
                      <div className="flex items-center gap-3">
                        <Clock size={20} className="text-gold-400" />
                        <div>
                          <p className="text-white font-body font-semibold">{days} day{days>1?'s':''} rental</p>
                          <p className="text-night-400 font-body text-sm">
                            {startDate?.toLocaleDateString('en-IN',{day:'numeric',month:'short'})} → {endDate?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 flex gap-3">
                    <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-body text-night-400 leading-relaxed">Free cancellation up to 24 hours before pickup. Date changes are free with 48h notice.</p>
                  </div>
                </div>
              )}

              {/* Step 2 — Payment */}
              {step === 2 && (
                <div className="card-dark p-7 space-y-6">
                  <h2 className="font-body font-semibold text-white text-xl">Payment Method</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {id:'card',   label:'Credit / Debit Card', icon:'💳'},
                      {id:'upi',    label:'UPI / GPay',          icon:'📱'},
                      {id:'wallet', label:'Wallets / NetBanking', icon:'🏦'},
                      {id:'cod',    label:'Pay at Pickup',        icon:'💵'},
                    ].map(({id,label,icon}) => (
                      <button key={id} onClick={() => setPayMethod(id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${payMethod===id?'border-gold-400/60 bg-gold-500/10 text-white':'border-white/10 text-night-400 hover:border-white/20'}`}>
                        <span className="text-xl">{icon}</span>
                        <span className="text-sm font-body font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                  {payMethod === 'card' && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="space-y-4">
                      <div>
                        <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400" />
                          <input type="text" placeholder="4242 4242 4242 4242" maxLength={19} className="input-dark pl-10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Expiry</label><input type="text" placeholder="MM / YY" className="input-dark" /></div>
                        <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">CVV</label><input type="text" placeholder="•••" maxLength={4} className="input-dark" /></div>
                      </div>
                      <div><label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Cardholder Name</label><input type="text" placeholder="As on card" className="input-dark" /></div>
                    </motion.div>
                  )}
                  {payMethod === 'upi' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
                      <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">UPI ID</label>
                      <input type="text" placeholder="yourname@upi" className="input-dark" />
                    </motion.div>
                  )}
                  <div className="flex items-center gap-2 text-xs font-body text-night-500">
                    <Shield size={13} className="text-gold-400" /> Secured by 256-bit SSL. Your payment info is never stored.
                  </div>
                </div>
              )}

              {/* Step 3 — Confirm */}
              {step === 3 && (
                <div className="card-dark p-7 space-y-5">
                  <h2 className="font-body font-semibold text-white text-xl">Review Your Booking</h2>
                  <div className="flex gap-4 p-4 bg-night-700/50 rounded-2xl">
                    <img src={car.image} alt={car.name} className="w-20 h-16 object-cover rounded-xl shrink-0" />
                    <div>
                      <p className="text-white font-body font-semibold">{car.name}</p>
                      <p className="text-night-400 text-sm font-body">{car.type} · {car.fuel} · {car.transmission}</p>
                      <p className="text-gold-400 text-sm font-body mt-1">₹{car.pricePerDay?.toLocaleString()}/day</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label:'Driver',           value:user?.name },
                      { label:'Pickup Location',  value:pickup },
                      { label:'Drop-off Location',value:dropoff },
                      { label:'Pickup Date',      value:startDate?.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'}) },
                      { label:'Return Date',      value:endDate?.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'}) },
                      { label:'Duration',         value:`${days} day${days>1?'s':''}` },
                      { label:'Payment',          value:{card:'Credit / Debit Card',upi:'UPI',wallet:'Wallet / NetBanking',cod:'Pay at Pickup'}[payMethod] },
                    ].map(({label,value}) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-sm font-body text-night-400">{label}</span>
                        <span className="text-sm font-body text-white font-medium">{value||'—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-gold-500/8 border border-gold-500/20">
                    <p className="text-xs font-body text-night-400 leading-relaxed">By confirming, you agree to our Terms of Service and Cancellation Policy. Your card will be charged upon confirmation.</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              {step > 0
                ? <button onClick={() => setStep(s=>s-1)} className="btn-ghost text-sm px-6 py-3">← Back</button>
                : <Link to={`/cars/${car._id}`} className="btn-ghost text-sm px-6 py-3">← Cancel</Link>}
              {step < STEPS.length-1
                ? <button onClick={handleNext} className="btn-gold text-sm px-8 py-3 flex items-center gap-2">Continue <ChevronRight size={16} /></button>
                : <button onClick={handleConfirm} disabled={paying || bookingLoading}
                    className="btn-gold text-sm px-8 py-3 flex items-center gap-2 disabled:opacity-60">
                    {paying||bookingLoading ? <><div className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin"/>Processing…</> : `Confirm & Pay ₹${total.toLocaleString()}`}
                  </button>}
            </div>
          </div>

          {/* ── Price summary ── */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-24">
              <h3 className="font-body font-semibold text-white mb-5">Price Summary</h3>
              <div className="flex gap-3 mb-5 p-3 bg-night-700/50 rounded-xl">
                <img src={car.image} alt={car.name} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                <div>
                  <p className="text-sm font-body font-medium text-white leading-tight">{car.name}</p>
                  <p className="text-xs font-body text-night-500 mt-0.5">{car.brand} · {car.year}</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <PriceLine label={`₹${car.pricePerDay?.toLocaleString()} × ${days||'?'} days`} value={days>0?`₹${subtotal.toLocaleString()}`:'—'} />
                <PriceLine label="Insurance (5%)" value={days>0?`₹${insurance.toLocaleString()}`:'—'} />
                <PriceLine label="Delivery Fee" value="Free" highlight />
              </div>
              <div className="divider-gold mb-4" />
              <div className="flex items-center justify-between">
                <span className="font-body font-semibold text-white">Total</span>
                <span className="font-display text-xl font-semibold text-gradient-gold">{days>0?`₹${total.toLocaleString()}`:'—'}</span>
              </div>
              <div className="mt-5 space-y-2">
                {['No hidden charges','Free cancellation (24h)','Full insurance included'].map(item=>(
                  <div key={item} className="flex items-center gap-2 text-xs font-body text-night-500">
                    <Check size={11} className="text-gold-400" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ icon:Icon, label, value, onChange, readOnly, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
        <input type="text" value={value} onChange={onChange?e=>onChange(e.target.value):undefined}
          readOnly={readOnly} placeholder={placeholder}
          className={`input-dark pl-10 ${readOnly?'opacity-60 cursor-default':''}`} />
      </div>
    </div>
  )
}

function PriceLine({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm font-body">
      <span className="text-night-400">{label}</span>
      <span className={highlight?'text-emerald-400':'text-white'}>{value}</span>
    </div>
  )
}
