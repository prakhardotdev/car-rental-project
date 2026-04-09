const express = require('express')
const router  = express.Router()

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController')

const { protect, adminOnly }  = require('../middleware/authMiddleware')
const { bookingValidation, mongoIdParam } = require('../middleware/validationMiddleware')

// ── User routes ───────────────────────────────────────────────
router.post('/',           protect, bookingValidation, createBooking)
router.get('/my',          protect, getMyBookings)
router.get('/:id',         protect, ...mongoIdParam('id'), getBookingById)
router.put('/:id/cancel',  protect, ...mongoIdParam('id'), cancelBooking)

// ── Admin routes ──────────────────────────────────────────────
router.get('/',            protect, adminOnly, getAllBookings)
router.put('/:id/status',  protect, adminOnly, ...mongoIdParam('id'), updateBookingStatus)

module.exports = router
