/**
 * notFound — 404 handler for unmatched routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404)
  next(error)
}

/**
 * errorHandler — Centralised error response formatter
 * Handles Mongoose errors, JWT errors, and custom errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message    = err.message || 'Internal Server Error'
  let errors     = null

  // Mongoose: bad ObjectId (e.g. /cars/not-a-valid-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message    = 'Resource not found (invalid ID format)'
  }

  // Mongoose: duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyPattern)[0]
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.`
  }

  // Mongoose: validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400
    message    = 'Validation failed'
    errors     = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }))
  }

  // JWT: token expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message    = 'Session expired. Please log in again.'
  }

  // JWT: invalid token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message    = 'Invalid token. Please log in again.'
  }

  // Multer: file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message    = 'File too large. Maximum size is 10MB.'
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [${req.method} ${req.originalUrl}] ${statusCode}: ${message}`)
  }

  res.status(statusCode).json(response)
}

module.exports = { notFound, errorHandler }
