import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 w-full z-50 bg-night-900/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* LOGO */}
        <Link to="/" className="text-xl font-semibold text-white">
          Luxe<span className="text-yellow-500">Drive</span>
        </Link>

        {/* NAV */}
        <nav className="flex gap-8 text-sm font-medium text-night-200">
          <NavLink to="/" className="hover:text-white">Home</NavLink>
          <NavLink to="/cars" className="hover:text-white">Browse Cars</NavLink>
          <NavLink to="/about" className="hover:text-white">About</NavLink>
          <NavLink to="/contact" className="hover:text-white">Contact</NavLink>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* THEME */}
          <button onClick={toggleTheme} className="text-night-300 hover:text-white">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* LOGIN */}
          <Link
            to="/login"
            className="bg-yellow-500 text-black px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            Login
          </Link>

        </div>
      </div>
    </header>
  )
}