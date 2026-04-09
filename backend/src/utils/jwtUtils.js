const jwt = require('jsonwebtoken')

/**
 * Generate a signed JWT token for a user
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} role   - User role ('user' | 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload { id, role, iat, exp }
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateToken, verifyToken }
