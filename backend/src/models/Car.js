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
    // ── Identity ──────────────────────────────────────────────
    name:  { type: String, required: [true, 'Car name is required'], trim: true },
    brand: { type: String, required: [true, 'Brand is required'],    trim: true },
    year:  { type: Number, required: [true, 'Year is required'], min: 1990, max: new Date().getFullYear() + 1 },
    color: { type: String, default: '' },

    isFeatured: {
  type: Boolean,
  default: false
},

    // ── Category ──────────────────────────────────────────────
    type: {
      type:     String,
      required: [true, 'Type is required'],
      enum:     ['Sports', 'SUV', 'Sedan', 'Hatchback', 'Convertible', 'Pickup', 'Van'],
    },
    fuel: {
      type:     String,
      required: [true, 'Fuel type is required'],
      enum:     ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    },
    transmission: {
      type:    String,
      enum:    ['Automatic', 'Manual'],
      default: 'Automatic',
    },
    seats: { type: Number, required: true, min: 1, max: 9, default: 5 },

    // ── Performance ───────────────────────────────────────────
    power:        { type: String, default: '' },  // e.g. "630 HP"
    topSpeed:     { type: String, default: '' },  // e.g. "318 km/h"
    acceleration: { type: String, default: '' },  // e.g. "3.2s (0–100)"
    mileage:      { type: String, default: '' },  // e.g. "8 km/L"

    // ── Media ─────────────────────────────────────────────────
    image:  { type: String, required: [true, 'Cover image is required'] },
    images: { type: [String], default: [] },       // gallery images

    // ── Pricing ───────────────────────────────────────────────
    pricePerDay: {
      type:     Number,
      required: [true, 'Price per day is required'],
      min:      [100, 'Minimum price is ₹100'],
    },

    // ── Location + Availability ───────────────────────────────
    location:  { type: String, required: [true, 'Location is required'], trim: true },
    available: { type: Boolean, default: true },
    featured:  { type: Boolean, default: false },

    // ── Description + Features ────────────────────────────────
    description: { type: String, default: '' },
    features:    { type: [String], default: [] },

    // ── Reviews (embedded) ────────────────────────────────────
    reviews:      { type: [reviewSchema], default: [] },
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // ── Admin ─────────────────────────────────────────────────
    cloudinaryIds: { type: [String], default: [], select: false },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
)

// ── Indexes ────────────────────────────────────────────────────
carSchema.index({ brand: 1 })
carSchema.index({ type: 1 })
carSchema.index({ available: 1 })
carSchema.index({ pricePerDay: 1 })
carSchema.index({ location: 1 })
carSchema.index({ featured: -1 })
carSchema.index({ name: 'text', brand: 'text', description: 'text' })  // full-text search

// ── Method: recalculate rating after new review ────────────────
carSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating       = 0
    this.totalReviews = 0
  } else {
    const sum         = this.reviews.reduce((acc, r) => acc + r.rating, 0)
    this.rating       = Math.round((sum / this.reviews.length) * 10) / 10
    this.totalReviews = this.reviews.length
  }
}

module.exports = mongoose.model('Car', carSchema)
