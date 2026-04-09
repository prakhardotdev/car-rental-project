import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Fuel, Gauge, Zap, Heart } from 'lucide-react'
import { useState } from 'react'

export default function CarCard({ car }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [imgLoaded,  setImgLoaded]  = useState(false)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card-dark group overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-night-700">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={car.image}
          alt={car.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110
            ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-card-gradient" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {car.featured && <span className="badge-gold text-xs">Featured</span>}
          {!car.available && <span className="badge-red text-xs">Unavailable</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); setWishlisted(w => !w) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center
                     hover:scale-110 transition-transform"
        >
          <Heart
            size={14}
            className={wishlisted ? 'text-red-400 fill-red-400' : 'text-white'}
          />
        </button>

        {/* Price */}
        <div className="absolute bottom-3 right-3 glass rounded-xl px-3 py-1.5">
          <span className="font-display text-gold-300 text-base font-semibold">
            ₹{car.pricePerDay.toLocaleString()}
          </span>
          <span className="text-night-400 text-xs font-body">/day</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-body text-gold-500 font-medium mb-0.5">{car.brand}</p>
            <h3 className="font-body font-semibold text-white text-base leading-tight">{car.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={12} className="text-gold-400 fill-gold-400" />
            <span className="text-xs font-body text-night-300 font-medium">{car.rating}</span>
            <span className="text-xs font-body text-night-500">({car.totalReviews})</span>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 py-3 border-y border-white/8 my-3">
          <SpecItem icon={Users}  label={`${car.seats} Seats`} />
          <SpecItem icon={Fuel}   label={car.fuel} />
          <SpecItem icon={Gauge}  label={car.transmission} />
        </div>

        {/* Type + power */}
        <div className="flex items-center justify-between mb-4">
          <span className="badge-blue text-xs">{car.type}</span>
          <div className="flex items-center gap-1 text-xs font-body text-night-400">
            <Zap size={11} className="text-gold-500" />
            {car.power}
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/cars/${car._id}`}
          className={`w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-body
            font-semibold transition-all duration-200
            ${car.available
              ? 'btn-gold'
              : 'bg-night-700 text-night-500 cursor-not-allowed'
            }`}
          onClick={e => !car.available && e.preventDefault()}
        >
          {car.available ? 'View & Book' : 'Not Available'}
        </Link>
      </div>
    </motion.div>
  )
}

function SpecItem({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-body text-night-400">
      <Icon size={12} className="text-night-500" />
      {label}
    </div>
  )
}
