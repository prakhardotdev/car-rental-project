const asyncHandler = require('express-async-handler')
const { verifyToken } = require('../utils/jwtUtils')
const User = require('../models/User')

/**
 * protect — Verifies JWT and attaches user to req.user
 * Use on any route that requires authentication.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token

  // Extract token from Authorization header: "Bearer <token>"
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authenticated — no token provided')
  }

  // Verify token
  const decoded = verifyToken(token)

  // Fetch user from DB (ensures user still exists + is active)
  const user = await User.findById(decoded.id).select('-password')

  if (!user) {
    res.status(401)
    throw new Error('User not found — token may be invalid')
  }

  if (!user.isActive) {
    res.status(403)
    throw new Error('Account is suspended. Please contact support.')
  }

  req.user = user
  next()
})

/**
 * adminOnly — Must be used AFTER protect
 * Rejects any non-admin user with 403.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403)
    throw new Error('Access denied — admin only')
  }
  next()
}

/**
 * optionalAuth — Attaches user if token is valid, but never fails.
 * Useful for public routes that change behaviour when logged in.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (token) {
    try {
      const decoded = verifyToken(token)
      const user    = await User.findById(decoded.id).select('-password')
      if (user && user.isActive) req.user = user
    } catch {
      // Silently ignore invalid tokens on optional routes
    }
  }

  next()
})

module.exports = { protect, adminOnly, optionalAuth }
