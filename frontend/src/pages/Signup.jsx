import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Car, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate   = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [agreed,   setAgreed]   = useState(false)

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const strength = (() => {
    const p = form.password
    if (!p)        return 0
    let s = 0
    if (p.length >= 8)        s++
    if (/[A-Z]/.test(p))      s++
    if (/[0-9]/.test(p))      s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'][strength]

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name    = 'Full name is required.'
    if (!form.email)                    e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password)                 e.password = 'Password is required.'
    else if (form.password.length < 6)  e.password = 'Minimum 6 characters.'
    if (form.password !== form.confirm) e.confirm  = 'Passwords do not match.'
    if (!agreed)                        e.agreed   = 'You must accept the terms.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch {
      setErrors({ form: 'Could not create account. Email may already be registered.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80"
          alt="Ferrari"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night-900/80 to-night-900/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="space-y-4">
            {[
              '200+ premium vehicles available',
              'Free cancellation on all bookings',
              'Full insurance always included',
              '24/7 roadside support',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                  <Check size={12} className="text-night-900" />
                </div>
                <span className="text-white font-body text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-night-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Car size={18} className="text-night-900" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold text-white">
              Luxe<span className="text-gradient-gold">Drive</span>
            </span>
          </div>

          <h1 className="font-display text-4xl text-white mb-2">Create account</h1>
          <p className="text-night-400 font-body text-sm mb-8">Start driving your dream car today.</p>

          {errors.form && (
            <div className="p-4 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} label="Full Name"     type="text"     value={form.name}     onChange={v => update('name',v)}     placeholder="Arjun Sharma"          error={errors.name}     />
            <Field icon={Mail} label="Email Address" type="email"    value={form.email}    onChange={v => update('email',v)}    placeholder="arjun@example.com"     error={errors.email}    />

            {/* Password with strength */}
            <div>
              <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">Password</label>
              <div className={`relative flex items-center bg-night-800 border rounded-xl transition-colors
                ${errors.password ? 'border-red-500/50' : 'border-white/10 focus-within:border-gold-400/60'}`}>
                <Lock size={15} className="absolute left-3.5 text-gold-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="flex-1 bg-transparent px-4 py-3 pl-10 text-white placeholder-night-500 text-sm font-body focus:outline-none"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="pr-3.5 text-night-500 hover:text-night-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1 h-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-night-700'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-body font-medium ${
                    strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-400' : strength === 3 ? 'text-blue-400' : 'text-emerald-400'
                  }`}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs font-body mt-1.5">{errors.password}</p>}
            </div>

            <Field icon={Lock} label="Confirm Password" type="password" value={form.confirm} onChange={v => update('confirm',v)} placeholder="••••••••" error={errors.confirm} />

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setAgreed(a => !a)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    agreed ? 'bg-gold-gradient border-gold-400' : 'border-night-600 hover:border-night-400'
                  }`}
                >
                  {agreed && <Check size={11} className="text-night-900" />}
                </button>
                <span className="text-sm font-body text-night-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-gold-400 hover:text-gold-300">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-gold-400 hover:text-gold-300">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreed && <p className="text-red-400 text-xs font-body mt-1.5 ml-8">{errors.agreed}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin" /> Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm font-body text-night-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, type, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-xs font-body text-night-400 mb-2 uppercase tracking-wider">{label}</label>
      <div className={`relative flex items-center bg-night-800 border rounded-xl transition-colors
        ${error ? 'border-red-500/50' : 'border-white/10 focus-within:border-gold-400/60'}`}>
        <Icon size={15} className="absolute left-3.5 text-gold-400 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-3 pl-10 text-white placeholder-night-500 text-sm font-body focus:outline-none"
        />
      </div>
      {error && <p className="text-red-400 text-xs font-body mt-1.5">{error}</p>}
    </div>
  )
}
