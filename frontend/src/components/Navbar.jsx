import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 dark:bg-night-900/90 backdrop-blur border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

        {/* LOGO */}
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
          LuxeDrive
        </Link>

        {/* LINKS */}
        <nav className="flex gap-6 text-gray-700 dark:text-gray-300">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/cars">Cars</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* THEME */}
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>

          {user ? (
            <button onClick={logout} className="btn-gold px-3 py-1">
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn-gold px-3 py-1">
              Login
            </Link>
          )}

        </div>
      </div>
    </header>
  )
}