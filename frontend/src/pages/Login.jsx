import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Car } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!email)                            e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email.'
    if (!password)                         e.password = 'Password is required.'
    else if (password.length < 6)          e.password = 'Minimum 6 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch {
      setErrors({ form: 'Invalid email or password.' })
    } finally {
      setLoading(false)
    }
  }

  // Demo credentials hint
  const fillDemo = (role) => {
    if (role === 'user') { setEmail('user@luxedrive.com'); setPassword('password123') }
    else                 { setEmail('admin@luxedrive.com'); setPassword('admin123') }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80"
          alt="Luxury car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night-900/80 to-night-900/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <blockquote className="font-display text-3xl text-white leading-snug italic mb-4">
            "Drive the car you've always dreamed of."
          </blockquote>
          <p className="text-night-300 font-body text-sm">Thousands of premium vehicles. One seamless platform.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-night-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Car size={18} className="text-night-900" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold text-white">
              Luxe<span className="text-gradient-gold">Drive</span>
            </span>
          </div>

          <h1 className="font-display text-4xl text-white mb-2">Welcome back</h1>
          <p className="text-night-400 font-body text-sm mb-8">Sign in to your account to continue.</p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('user')} className="flex-1 text-xs font-body py-2 px-3 rounded-lg bg-night-800 border border-white/10 text-night-300 hover:text-gold-300 hover:border-gold-500/30 transition-all">
              👤 Demo User
            </button>
            <button onClick={() => fillDemo('admin')} className="flex-1 text-xs font-body py-2 px-3 rounded-lg bg-night-800 border border-white/10 text-night-300 hover:text-gold-300 hover:border-gold-500/30 transition-all">
              🛡 Demo Admin
            </button>
          </div>

          {errors.form && (
            <div className="p-4 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              icon={Mail}
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              error={errors.email}
            />
            <FormField
              icon={Lock}
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              error={errors.password}
              rightAction={
                <button type="button" onClick={() => setShowPass(s => !s)} className="text-night-500 hover:text-night-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-body text-gold-400 hover:text-gold-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm font-body text-night-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          <div className="relative my-6">
            <div className="divider-gold" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-night-900 text-night-600 text-xs font-body">OR</span>
          </div>

          <div className="space-y-3">
            {[
              { icon: '🔵', label: 'Continue with Google' },
              { icon: '⬛', label: 'Continue with Apple' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10
                           text-sm font-body text-night-300 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FormField({ icon: Icon, label, type, value, onChange, placeholder, error, rightAction }) {
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
        {rightAction && <div className="pr-3.5">{rightAction}</div>}
      </div>
      {error && <p className="text-red-400 text-xs font-body mt-1.5">{error}</p>}
    </div>
  )
}
