const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
)

const carSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────
    name:  { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    year:  { type: Number, required: true },
    color: { type: String, default: '' },

    // ✅ ONLY ONE FEATURED FIELD (IMPORTANT FIX)
    isFeatured: {
      type: Boolean,
      default: false
    },

    // ── Category ─────────────────────────
    type: {
      type: String,
      required: true,
      enum: ['Sports', 'SUV', 'Sedan', 'Hatchback', 'Convertible', 'Pickup', 'Van'],
    },
    fuel: {
      type: String,
      required: true,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      default: 'Automatic',
    },
    seats: { type: Number, default: 5 },

    // ── Performance ─────────────────────
    power:        { type: String, default: '' },
    topSpeed:     { type: String, default: '' },
    acceleration: { type: String, default: '' },
    mileage:      { type: String, default: '' },

    // ── Media ───────────────────────────
    image:  { type: String, required: true },
    images: { type: [String], default: [] },

    // ── Pricing ─────────────────────────
    pricePerDay: {
      type: Number,
      required: true,
    },

    // ── Location ────────────────────────
    location:  { type: String, required: true },
    available: { type: Boolean, default: true },

    // ❌ REMOVED DUPLICATE "featured" FIELD

    // ── Description ─────────────────────
    description: { type: String, default: '' },
    features:    { type: [String], default: [] },

    // ── Reviews ─────────────────────────
    reviews:      { type: [reviewSchema], default: [] },
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // ── Admin ───────────────────────────
    cloudinaryIds: { type: [String], default: [] },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
carSchema.index({ brand: 1 })
carSchema.index({ type: 1 })
carSchema.index({ pricePerDay: 1 })
carSchema.index({ location: 1 })

module.exports = mongoose.model('Car', carSchema)