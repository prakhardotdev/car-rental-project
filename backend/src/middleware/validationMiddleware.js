const { body, param, query, validationResult } = require('express-validator')

/**
 * handleValidation — Run after validation chains.
 * Collects all errors and sends 400 if any exist.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

// ── Auth validators ────────────────────────────────────────────
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
]

const loginValidation = [
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation,
]

// ── Car validators ────────────────────────────────────────────
const carValidation = [
  body('name').trim().notEmpty().withMessage('Car name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('type')
    .isIn(['Sports','SUV','Sedan','Hatchback','Convertible','Pickup','Van'])
    .withMessage('Invalid car type'),
  body('fuel')
    .isIn(['Petrol','Diesel','Electric','Hybrid','CNG'])
    .withMessage('Invalid fuel type'),
  body('transmission')
    .optional()
    .isIn(['Automatic','Manual'])
    .withMessage('Transmission must be Automatic or Manual'),
  body('seats')
    .isInt({ min: 1, max: 9 }).withMessage('Seats must be between 1 and 9'),
  body('pricePerDay')
    .isFloat({ min: 100 }).withMessage('Price per day must be at least ₹100'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  handleValidation,
]

// ── Booking validators ────────────────────────────────────────
const bookingValidation = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid car ID'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom(val => {
      if (new Date(val) < new Date()) throw new Error('Start date cannot be in the past')
      return true
    }),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.startDate))
        throw new Error('End date must be after start date')
      return true
    }),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
  handleValidation,
]

// ── Param validator ───────────────────────────────────────────
const mongoIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidation,
]

module.exports = {
  signupValidation,
  loginValidation,
  carValidation,
  bookingValidation,
  mongoIdParam,
  handleValidation,
}
