const asyncHandler = require('express-async-handler')
const User    = require('../models/User')
const Car     = require('../models/Car')
const Booking = require('../models/Booking')

// ── GET /api/admin/stats ──────────────────────────────────────
// Full dashboard analytics
const getDashboardStats = asyncHandler(async (req, res) => {
  // Run all queries in parallel for speed
  const [
    totalUsers,
    totalCars,
    availableCars,
    totalBookings,
    pendingBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    revenueAgg,
    recentBookings,
    recentUsers,
    topCars,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Car.countDocuments(),
    Car.countDocuments({ available: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'active' }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),

    // Total revenue from paid bookings
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // 10 most recent bookings
    Booking.find()
      .populate('user', 'name email')
      .populate('car',  'name brand image')
      .sort({ createdAt: -1 })
      .limit(10),

    // 5 most recent users
    User.find({ role: 'user' })
      .select('name email createdAt totalBookings totalSpent')
      .sort({ createdAt: -1 })
      .limit(5),

    // Top 5 most booked cars
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
      { $group: { _id: '$car', bookingCount: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort:  { bookingCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'cars', localField: '_id', foreignField: '_id', as: 'carDetails' } },
      { $unwind: '$carDetails' },
      { $project: { bookingCount: 1, revenue: 1, name: '$carDetails.name', brand: '$carDetails.brand', image: '$carDetails.image' } },
    ]),
  ])

  // Revenue per month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt:     { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue:  { $sum: '$total' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id:      0,
        year:    '$_id.year',
        month:   '$_id.month',
        revenue: 1,
        bookings:1,
      },
    },
  ])

  // Booking status breakdown (for pie chart)
  const statusBreakdown = [
    { status: 'pending',   count: pendingBookings   },
    { status: 'active',    count: activeBookings    },
    { status: 'completed', count: completedBookings },
    { status: 'cancelled', count: cancelledBookings },
  ]

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalCars,
        availableCars,
        totalBookings,
        totalRevenue: revenueAgg[0]?.total || 0,
        pendingBookings,
      },
      statusBreakdown,
      monthlyRevenue,
      recentBookings,
      recentUsers,
      topCars,
    },
  })
})

// ── GET /api/admin/users ──────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { search, role = 'user', page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query

  const filter = {}
  if (role)   filter.role = role
  if (search) filter.$or  = [
    { name:  new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ]

  const total = await User.countDocuments(filter)
  const users = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpiry -emailVerifyToken')
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  res.json({
    success: true,
    total,
    page:   Number(page),
    pages:  Math.ceil(total / Number(limit)),
    data:   users,
  })
})

// ── PUT /api/admin/users/:id/status ──────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  if (user.role === 'admin') {
    res.status(403)
    throw new Error('Cannot deactivate an admin account.')
  }

  user.isActive = Boolean(isActive)
  await user.save()

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
    data:    user.toPublic(),
  })
})

// ── PUT /api/admin/cars/:id/featured ─────────────────────────
const toggleFeatured = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  car.featured = !car.featured
  await car.save()

  res.json({
    success:  true,
    message:  `Car ${car.featured ? 'marked as featured' : 'removed from featured'}.`,
    featured: car.featured,
  })
})

// ── PUT /api/admin/cars/:id/availability ─────────────────────
const toggleAvailability = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  car.available = !car.available
  await car.save()

  res.json({
    success:   true,
    message:   `Car marked as ${car.available ? 'available' : 'unavailable'}.`,
    available: car.available,
  })
})

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  toggleFeatured,
  toggleAvailability,
}
