import { Link } from 'react-router-dom'
import { Car, Instagram, Twitter, Linkedin, Github, ArrowRight } from 'lucide-react'



import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)

const handleSubscribe = async () => {
  if (!email) return toast.error('Enter email')

  try {
    setLoading(true)

    await api.post('/subscribe', { email })

    toast.success('Subscribed successfully 🚀')
    setEmail('')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error')
  } finally {
    setLoading(false)
  }
}
export default function Footer() {
  return (
    <footer className="bg-night-800/50 border-t border-white/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <Car size={18} className="text-night-900" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-semibold text-white">
                Luxe<span className="text-gradient-gold">Drive</span>
              </span>
            </div>
            <p className="text-night-400 font-body text-sm leading-relaxed max-w-xs">
              India's premier luxury car rental platform. Handpicked fleets, seamless bookings, and unforgettable journeys.
            </p>
            {/* Newsletter */}
            <div className="mt-6 flex gap-2 max-w-sm">
              <input
  type="email"
  placeholder="Your email for updates"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="input-dark"
/>


              <button className="btn-gold py-2.5 px-4 text-sm shrink-0">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
  <h3 className="text-white font-semibold mb-4">Company</h3>
  <ul className="space-y-2 text-gray-400">
    <li>
      <Link to="/about" className="hover:text-white">About Us</Link>
    </li>
    <li>
      <Link to="/contact" className="hover:text-white">Contact</Link>
    </li>
  </ul>
</div>
         
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-night-500 text-xs font-body">
            © 2026 LuxeDrive. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: Instagram, href: '#' },
              { icon: Twitter,   href: '#' },
              { icon: Linkedin,  href: '#' },
              { icon: Github,    href: '#' },
            ].map(({ icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center
                           text-night-400 hover:text-gold-300 hover:border-gold-500/40 transition-all"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-body text-night-600">
            <span>🇮🇳</span> Made in India
          </div>
        </div>
      </div>
    </footer>
  )
}
