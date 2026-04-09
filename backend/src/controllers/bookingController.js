const asyncHandler = require('express-async-handler')
const Booking      = require('../models/Booking')
const Car          = require('../models/Car')
const User         = require('../models/User')
const { sendEmail } = require('../utils/emailUtils')

// ── Helper: calculate pricing ─────────────────────────────────
const calcPricing = (pricePerDay, days) => {
  const subtotal  = pricePerDay * days
  const insurance = Math.round(subtotal * 0.05)
  const total     = subtotal + insurance
  return { subtotal, insurance, total }
}

// ── Helper: check date overlap ────────────────────────────────
const hasOverlap = async (carId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    car:    carId,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or:    [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
  }
  if (excludeBookingId) query._id = { $ne: excludeBookingId }
  return !!(await Booking.findOne(query))
}

// ── POST /api/bookings ────────────────────────────────────────
// Protected (any logged-in user)
const createBooking = asyncHandler(async (req, res) => {
  const {
    carId, startDate, endDate,
    pickupLocation, dropoffLocation,
    paymentMethod = 'card', notes = '',
  } = req.body

  // Validate dates
  const start = new Date(startDate)
  const end   = new Date(endDate)

  if (start < new Date()) {
    res.status(400)
    throw new Error('Start date cannot be in the past.')
  }

  if (end <= start) {
    res.status(400)
    throw new Error('End date must be after start date.')
  }

  // Check car exists
  const car = await Car.findById(carId)
  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  if (!car.available) {
    res.status(400)
    throw new Error('This car is not available for rent.')
  }

  // Check date availability (no overlapping confirmed/active bookings)
  const busy = await hasOverlap(carId, startDate, endDate)
  if (busy) {
    res.status(400)
    throw new Error('Car is already booked for the selected dates. Please choose different dates.')
  }

  // Calculate pricing
  const ms   = end - start
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  const { subtotal, insurance, total } = calcPricing(car.pricePerDay, days)

  // Create booking
  const booking = await Booking.create({
    user:            req.user._id,
    car:             carId,
    startDate:       start,
    endDate:         end,
    days,
    pickupLocation,
    dropoffLocation,
    driverName:      req.user.name,
    driverEmail:     req.user.email,
    driverPhone:     req.user.phone || '',
    pricePerDay:     car.pricePerDay,
    subtotal,
    insurance,
    total,
    paymentMethod,
    customerNotes:   notes,
    status:          'pending',
  })

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { totalBookings: 1 },
  })

  // Populate for response
  await booking.populate('car', 'name brand image')

  // Send confirmation email (non-blocking)
  sendEmail(req.user.email, 'bookingConfirmation', {
    userName:       req.user.name,
    bookingRef:     booking.bookingRef,
    carName:        car.name,
    startDate:      start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    endDate:        end.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    days,
    pickupLocation,
    total,
  })

  res.status(201).json({
    success: true,
    message: 'Booking created successfully! Check your email for confirmation.',
    data:    booking,
  })
})

// ── GET /api/bookings/my ──────────────────────────────────────
// Protected (user sees only their own bookings)
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query

  const filter = { user: req.user._id }
  if (status) filter.status = status

  const total    = await Booking.countDocuments(filter)
  const bookings = await Booking.find(filter)
    .populate('car', 'name brand image pricePerDay type fuel')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  res.json({
    success: true,
    total,
    page:   Number(page),
    pages:  Math.ceil(total / Number(limit)),
    data:   bookings,
  })
})

// ── GET /api/bookings/:id ─────────────────────────────────────
// Protected (owner or admin)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('car',  'name brand image type fuel transmission seats pricePerDay location')
    .populate('user', 'name email phone avatar')

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  // Only booking owner or admin can view
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403)
    throw new Error('Not authorized to view this booking.')
  }

  res.json({ success: true, data: booking })
})

// ── PUT /api/bookings/:id/cancel ──────────────────────────────
// Protected (user can cancel their pending/confirmed bookings)
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason = '' } = req.body

  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  // Only the booking owner can cancel (admin has separate route)
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to cancel this booking.')
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    res.status(400)
    throw new Error(`Cannot cancel a booking with status: ${booking.status}`)
  }

  // Check cancellation window (24 hours before pickup)
  const hoursUntilPickup = (booking.startDate - new Date()) / (1000 * 60 * 60)
  if (hoursUntilPickup < 24 && booking.status === 'confirmed') {
    res.status(400)
    throw new Error('Cancellations must be made at least 24 hours before pickup.')
  }

  booking.status      = 'cancelled'
  booking.cancelledAt = new Date()
  booking.cancelReason = reason

  // If paid, mark for refund
  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded'
  }

  await booking.save()

  // Populate car name for email
  await booking.populate('car', 'name')

  sendEmail(req.user.email, 'bookingCancelled', {
    userName:   req.user.name,
    bookingRef: booking.bookingRef,
    carName:    booking.car.name,
    reason,
  })

  res.json({
    success: true,
    message: 'Booking cancelled successfully.',
    data:    booking,
  })
})

// ── GET /api/bookings (Admin) ─────────────────────────────────
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, user, car } = req.query

  const filter = {}
  if (status) filter.status = status
  if (user)   filter.user   = user
  if (car)    filter.car    = car

  const total    = await Booking.countDocuments(filter)
  const bookings = await Booking.find(filter)
    .populate('car',  'name brand image')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  res.json({
    success: true,
    total,
    page:   Number(page),
    pages:  Math.ceil(total / Number(limit)),
    data:   bookings,
  })
})

// ── PUT /api/bookings/:id/status (Admin) ──────────────────────
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes = '' } = req.body

  const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected']
  if (!validStatuses.includes(status)) {
    res.status(400)
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const booking = await Booking.findById(req.params.id)
    .populate('car',  'name')
    .populate('user', 'name email')

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  const oldStatus = booking.status
  booking.status  = status
  if (adminNotes)  booking.adminNotes = adminNotes

  // Set timestamps
  if (status === 'confirmed')  booking.confirmedAt = new Date()
  if (status === 'completed')  booking.completedAt = new Date()
  if (status === 'cancelled' || status === 'rejected') {
    booking.cancelledAt  = new Date()
    booking.cancelReason = adminNotes
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded'
  }

  await booking.save()

  // Email user on significant status changes
  if (status === 'confirmed' && oldStatus === 'pending') {
    sendEmail(booking.user.email, 'bookingConfirmation', {
      userName:       booking.user.name,
      bookingRef:     booking.bookingRef,
      carName:        booking.car.name,
      startDate:      booking.startDate.toLocaleDateString('en-IN'),
      endDate:        booking.endDate.toLocaleDateString('en-IN'),
      days:           booking.days,
      pickupLocation: booking.pickupLocation,
      total:          booking.total,
    })
  }

  if (['cancelled', 'rejected'].includes(status)) {
    sendEmail(booking.user.email, 'bookingCancelled', {
      userName:   booking.user.name,
      bookingRef: booking.bookingRef,
      carName:    booking.car.name,
      reason:     adminNotes,
    })
  }

  // Update user totalSpent on completion
  if (status === 'completed') {
    await User.findByIdAndUpdate(booking.user._id, {
      $inc: { totalSpent: booking.total },
    })
  }

  res.json({
    success: true,
    message: `Booking status updated to "${status}"`,
    data:    booking,
  })
})

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
}
