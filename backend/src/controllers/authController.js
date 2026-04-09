const asyncHandler = require('express-async-handler')
const crypto       = require('crypto')
const User         = require('../models/User')
const { generateToken } = require('../utils/jwtUtils')
const { sendEmail }     = require('../utils/emailUtils')

// ── POST /api/auth/signup ─────────────────────────────────────
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Check if email already exists
  const exists = await User.findOne({ email })
  if (exists) {
    res.status(409)
    throw new Error('An account with this email already exists.')
  }

  // Create user (password hashed by pre-save hook in model)
  const user  = await User.create({ name, email, password })
  const token = generateToken(user._id, user.role)

  // Send welcome email (non-blocking)
  sendEmail(email, 'welcomeEmail', { userName: name })

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toPublic(),
  })
})

// ── POST /api/auth/login ──────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Find user (explicitly select password for comparison)
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password.')
  }

  if (!user.isActive) {
    res.status(403)
    throw new Error('Your account has been suspended. Please contact support.')
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = generateToken(user._id, user.role)

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toPublic(),
  })
})

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  res.json({ success: true, user: user.toPublic() })
})

// ── PUT /api/auth/profile ─────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, city, notifications } = req.body

  const user = await User.findById(req.user._id)

  if (name)          user.name  = name.trim()
  if (phone)         user.phone = phone.trim()
  if (city)          user.city  = city.trim()
  if (notifications) user.notifications = { ...user.notifications, ...notifications }

  await user.save()

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user:    user.toPublic(),
  })
})

// ── PUT /api/auth/change-password ─────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    res.status(400)
    throw new Error('Current and new passwords are required.')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('New password must be at least 6 characters.')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!(await user.comparePassword(currentPassword))) {
    res.status(401)
    throw new Error('Current password is incorrect.')
  }

  user.password = newPassword
  await user.save()

  res.json({ success: true, message: 'Password changed successfully.' })
})

// ── POST /api/auth/forgot-password ───────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required.')
  }

  const user = await User.findOne({ email })

  // Always return success (security: don't reveal if email exists)
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  }

  // Generate reset token
  const resetToken  = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000  // 1 hour
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
  sendEmail(email, 'passwordReset', { userName: user.name, resetUrl })

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
})

// ── POST /api/auth/reset-password/:token ─────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token }    = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters.')
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid or expired reset token.')
  }

  user.password            = password
  user.resetPasswordToken  = undefined
  user.resetPasswordExpiry = undefined
  await user.save()

  res.json({ success: true, message: 'Password reset successfully. Please log in.' })
})

// ── PUT /api/auth/avatar ──────────────────────────────────────
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error('No image uploaded.')
  }

  const user   = await User.findById(req.user._id)
  user.avatar  = req.file.path   // Cloudinary URL
  await user.save()

  res.json({ success: true, message: 'Avatar updated', user: user.toPublic() })
})

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateAvatar,
}
