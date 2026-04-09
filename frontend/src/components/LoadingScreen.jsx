import { motion } from 'framer-motion'
import { Car } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-night-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-full border-2 border-gold-500/20 border-t-gold-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Car size={22} className="text-gold-400" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-display text-xl text-white">
            Luxe<span className="text-gradient-gold">Drive</span>
          </p>
          <p className="text-night-500 text-xs font-body text-center mt-1">Loading your experience…</p>
        </motion.div>
      </div>
    </div>
  )
}
