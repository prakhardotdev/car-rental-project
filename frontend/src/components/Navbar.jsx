import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'



import {
  Car, Menu, X, Sun, Moon, User, LogOut,
  LayoutDashboard, Settings, ChevronDown, Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout }      = useAuth()
  const { theme, toggleTheme} = useTheme()
  const navigate              = useNavigate()
  const location              = useLocation()

  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const profileRef = useRef(null)

  // Detect scroll for transparent → solid transition
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/cars', label: 'Browse Cars' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-night-900/95 backdrop-blur-lg border-b border-white/8 shadow-card'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Car size={18} className="text-night-900" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold text-white">
              Luxe<span className="text-gradient-gold">Drive</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 rounded transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-night-300
                         hover:text-gold-300 hover:bg-white/5 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-lg flex items-center justify-center
                                   text-night-300 hover:text-gold-300 hover:bg-white/5 transition-all duration-200">
                  <Bell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-400 rounded-full" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5
                               border border-white/10 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center">
                      <span className="text-night-900 text-xs font-bold font-body">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-body text-night-200 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown size={14} className={`text-night-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 card-dark rounded-xl overflow-hidden shadow-card"
                      >
                        <div className="p-3 border-b border-white/8">
                          <p className="text-sm font-body font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs font-body text-night-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <DropdownItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" onClick={() => setProfileOpen(false)} />
                          <DropdownItem icon={Settings} label="Settings" to="/dashboard?tab=settings" onClick={() => setProfileOpen(false)} />
                        </div>
                        <div className="p-1.5 border-t border-white/8">
                          <button
                            onClick={() => { logout(); setProfileOpen(false) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                       font-body text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 px-4 text-sm hidden sm:flex">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-gold py-2 px-4 text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center
                         text-night-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-night-900/98 backdrop-blur-lg border-t border-white/8 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl text-sm font-body font-medium transition-all ${
                      isActive ? 'text-gold-400 bg-gold-500/10' : 'text-night-200 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {!user && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                  <Link to="/login" className="flex-1 btn-ghost py-2.5 text-sm text-center">Sign In</Link>
                  <Link to="/signup" className="flex-1 btn-gold py-2.5 text-sm text-center">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function DropdownItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                 font-body text-night-200 hover:text-white hover:bg-white/8 transition-colors"
    >
      <Icon size={15} className="text-night-400" />
      {label}
    </Link>
  )
}
