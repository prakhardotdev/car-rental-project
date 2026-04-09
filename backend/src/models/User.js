const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be less than 80 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [6,  'Password must be at least 6 characters'],
      select:   false,   // never returned in queries by default
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    // Profile fields
    phone: { type: String, trim: true, default: '' },
    city:  { type: String, trim: true, default: '' },
    avatar:{ type: String, default: '' },      // Cloudinary URL

    // Stats
    totalBookings: { type: Number, default: 0 },
    totalSpent:    { type: Number, default: 0 },

    // Preferences
    notifications: {
      bookingConfirmation: { type: Boolean, default: true  },
      paymentReceipt:      { type: Boolean, default: true  },
      promotions:          { type: Boolean, default: false },
      reminders:           { type: Boolean, default: true  },
    },

    // Security
    isActive:          { type: Boolean, default: true  },
    emailVerified:     { type: Boolean, default: false },
    emailVerifyToken:  { type: String,  select: false  },
    resetPasswordToken:{ type: String,  select: false  },
    resetPasswordExpiry:{ type: Date,   select: false  },
    lastLogin:         { type: Date                    },
  },
  {
    timestamps: true,    // adds createdAt + updatedAt automatically
  }
)

// ── Indexes ────────────────────────────────────────────────────
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ createdAt: -1 })

// ── Pre-save hook: hash password before saving ─────────────────
userSchema.pre('save', async function (next) {
  // Only hash when password field is modified
  if (!this.isModified('password')) return next()
  const salt  = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ── Instance method: compare password ─────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Instance method: get public profile (no sensitive fields) ──
userSchema.methods.toPublic = function () {
  return {
    _id:           this._id,
    name:          this.name,
    email:         this.email,
    role:          this.role,
    phone:         this.phone,
    city:          this.city,
    avatar:        this.avatar,
    totalBookings: this.totalBookings,
    totalSpent:    this.totalSpent,
    notifications: this.notifications,
    createdAt:     this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
