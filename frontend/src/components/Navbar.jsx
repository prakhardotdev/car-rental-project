import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-lg border-b border-white/10 bg-white/80 dark:bg-night-900/90">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* LOGO */}
        <Link className="text-xl font-bold text-gray-900 dark:text-white">
          Luxe<span className="text-yellow-500">Drive</span>
        </Link>

        {/* NAV */}
        <nav className="flex gap-6 font-medium">
          <NavLink to="/" className="text-gray-700 dark:text-night-200 hover:text-yellow-500">Home</NavLink>
          <NavLink to="/cars" className="text-gray-700 dark:text-night-200 hover:text-yellow-500">Cars</NavLink>
          <NavLink to="/about" className="text-gray-700 dark:text-night-200 hover:text-yellow-500">About</NavLink>
          <NavLink to="/contact" className="text-gray-700 dark:text-night-200 hover:text-yellow-500">Contact</NavLink>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>

          {user ? (
            <button onClick={logout} className="bg-yellow-500 px-3 py-1 rounded text-black">
              Logout
            </button>
          ) : (
            <Link to="/login" className="bg-yellow-500 px-3 py-1 rounded text-black">
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}