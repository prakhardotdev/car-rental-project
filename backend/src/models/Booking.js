const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const bookingSchema = new mongoose.Schema(
  {
    // ── Unique booking reference ───────────────────────────────
    bookingRef: {
      type:    String,
      unique:  true,
      default: () => `LXD-${uuidv4().split('-')[0].toUpperCase()}`,
    },

    // ── Relations ─────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User is required'],
    },
    car: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Car',
      required: [true, 'Car is required'],
    },

    // ── Dates ─────────────────────────────────────────────────
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate:   { type: Date, required: [true, 'End date is required'] },
    days:      { type: Number, required: true, min: 1 },

    // ── Locations ─────────────────────────────────────────────
    pickupLocation:  { type: String, required: [true, 'Pickup location is required'], trim: true },
    dropoffLocation: { type: String, required: [true, 'Drop-off location is required'], trim: true },

    // ── Driver Info snapshot (denormalized for record keeping) ─
    driverName:  String,
    driverEmail: String,
    driverPhone: String,

    // ── Pricing snapshot (locked at booking time) ──────────────
    pricePerDay: { type: Number, required: true },
    subtotal:    { type: Number, required: true },
    insurance:   { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, required: true },

    // ── Status machine ────────────────────────────────────────
    // pending → confirmed → active → completed
    //         → cancelled
    //         → rejected
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },

    // ── Payment ───────────────────────────────────────────────
    paymentStatus: {
      type:    String,
      enum:    ['unpaid', 'paid', 'refunded', 'partially_refunded'],
      default: 'unpaid',
    },
    paymentMethod:    { type: String, enum: ['card', 'upi', 'wallet', 'cod', 'stripe'], default: 'card' },
    stripePaymentId:  { type: String, default: '' },
    stripeSessionId:  { type: String, default: '' },
    razorpayOrderId:  { type: String, default: '' },
    razorpayPaymentId:{ type: String, default: '' },

    // ── Notes ─────────────────────────────────────────────────
    customerNotes: { type: String, default: '' },
    adminNotes:    { type: String, default: '' },

    // ── Timestamps for status changes ─────────────────────────
    confirmedAt:  Date,
    cancelledAt:  Date,
    completedAt:  Date,
    cancelReason: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
)

// ── Indexes ────────────────────────────────────────────────────
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ bookingRef: 1 })
bookingSchema.index({ stripePaymentId: 1 })

// ── Virtual: formatted booking reference ──────────────────────
bookingSchema.virtual('formattedRef').get(function () {
  return this.bookingRef
})

// ── Validate dates before save ────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'))
  }
  // Calculate days if not set
  if (!this.days) {
    const ms  = this.endDate - this.startDate
    this.days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  }
  next()
})

module.exports = mongoose.model('Booking', bookingSchema)
