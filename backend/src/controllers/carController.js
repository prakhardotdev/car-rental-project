const asyncHandler = require('express-async-handler')
const Car          = require('../models/Car')
const Booking      = require('../models/Booking')
const { deleteImage } = require('../utils/cloudinaryUtils')

// ── GET /api/cars ─────────────────────────────────────────────
// Public | Query: q, brand, type, fuel, transmission, minPrice, maxPrice,
//                 location, available, featured, sort, page, limit
const getCars = asyncHandler(async (req, res) => {
  const {
    q, brand, type, fuel, transmission,
    minPrice, maxPrice, location, available, featured,
    sort = 'createdAt', order = 'desc',
    page  = 1,
    limit = 12,
  } = req.query

  const filter = {}

  // Full-text search
  if (q) filter.$text = { $search: q }

  // Exact filters
  if (brand)        filter.brand        = new RegExp(`^${brand}$`, 'i')
  if (type)         filter.type         = type
  if (fuel)         filter.fuel         = fuel
  if (transmission) filter.transmission = transmission
  if (location)     filter.location     = new RegExp(location, 'i')
  if (available !== undefined) filter.available = available === 'true'
  if (featured  !== undefined) filter.featured  = featured  === 'true'

  // Price range
  if (minPrice || maxPrice) {
    filter.pricePerDay = {}
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice)
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice)
  }

  // Sorting
  const sortMap = {
    price_asc:  { pricePerDay:  1 },
    price_desc: { pricePerDay: -1 },
    rating:     { rating:      -1 },
    reviews:    { totalReviews:-1 },
    newest:     { createdAt:   -1 },
    oldest:     { createdAt:    1 },
  }
  const sortObj = sortMap[sort] || { [sort]: order === 'asc' ? 1 : -1 }

  const skip  = (Number(page) - 1) * Number(limit)
  const total = await Car.countDocuments(filter)

  const cars = await Car.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    success: true,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    count:   cars.length,
    data:    cars,
  })
})

// ── GET /api/cars/featured ────────────────────────────────────
const getFeaturedCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ featured: true, available: true })
    .sort({ rating: -1 })
    .limit(8)
    .lean()

  res.json({ success: true, data: cars })
})

// ── GET /api/cars/:id ─────────────────────────────────────────
const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)
    .populate('addedBy', 'name email')
    .populate('reviews.user', 'name avatar')

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  res.json({ success: true, data: car })
})

// ── POST /api/cars ────────────────────────────────────────────
// Admin only
const createCar = asyncHandler(async (req, res) => {
  const {
    name, brand, year, color, type, fuel, transmission,
    seats, power, topSpeed, acceleration, mileage,
    pricePerDay, location, featured, description, features,
  } = req.body

  // Handle images (from Cloudinary upload middleware)
  let image  = req.body.image  || ''
  let images = []

  if (req.files?.length) {
    images = req.files.map(f => f.path)
    image  = images[0]
  } else if (req.file) {
    image  = req.file.path
    images = [image]
  }

  if (!image) {
    res.status(400)
    throw new Error('At least one car image is required.')
  }

  const car = await Car.create({
    name, brand, year, color, type, fuel,
    transmission: transmission || 'Automatic',
    seats:         Number(seats),
    power, topSpeed, acceleration, mileage,
    pricePerDay:  Number(pricePerDay),
    location, image, images,
    featured:     featured === 'true' || featured === true,
    description:  description || '',
    features:     features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : [],
    addedBy:      req.user._id,
    cloudinaryIds: req.files ? req.files.map(f => f.filename) : [],
  })

  res.status(201).json({
    success: true,
    message: 'Car added successfully',
    data:    car,
  })
})

// ── PUT /api/cars/:id ─────────────────────────────────────────
// Admin only
const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  // Update only provided fields
  const allowedFields = [
    'name','brand','year','color','type','fuel','transmission',
    'seats','power','topSpeed','acceleration','mileage',
    'pricePerDay','location','available','featured',
    'description','features',
  ]

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      car[field] = req.body[field]
    }
  })

  // Handle new image uploads
  if (req.files?.length) {
    const newImages = req.files.map(f => f.path)
    car.images = [...car.images, ...newImages]
    car.image  = car.images[0]
  }

  await car.save()

  res.json({
    success: true,
    message: 'Car updated successfully',
    data:    car,
  })
})

// ── DELETE /api/cars/:id ──────────────────────────────────────
// Admin only
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  // Prevent delete if car has active bookings
  const activeBooking = await Booking.findOne({
    car:    car._id,
    status: { $in: ['confirmed', 'active'] },
  })

  if (activeBooking) {
    res.status(400)
    throw new Error('Cannot delete a car with active bookings. Cancel the bookings first.')
  }

  // Delete images from Cloudinary
  if (car.cloudinaryIds?.length) {
    await Promise.all(car.cloudinaryIds.map(deleteImage))
  }

  await car.deleteOne()

  res.json({ success: true, message: 'Car deleted successfully.' })
})

// ── POST /api/cars/:id/reviews ────────────────────────────────
// Protected (must have completed booking for this car)
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  if (!rating || !comment) {
    res.status(400)
    throw new Error('Rating and comment are required.')
  }

  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  // Check if user already reviewed this car
  const alreadyReviewed = car.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  )

  if (alreadyReviewed) {
    res.status(400)
    throw new Error('You have already reviewed this car.')
  }

  // Verify user has a completed booking for this car
  const booking = await Booking.findOne({
    user:   req.user._id,
    car:    car._id,
    status: 'completed',
  })

  if (!booking) {
    res.status(403)
    throw new Error('You can only review cars you have rented and returned.')
  }

  car.reviews.push({
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    comment: comment.trim(),
  })

  car.updateRating()
  await car.save()

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data:    { rating: car.rating, totalReviews: car.totalReviews },
  })
})

// ── GET /api/cars/:id/availability ───────────────────────────
// Check if a car is available for given dates
const checkAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    res.status(400)
    throw new Error('startDate and endDate are required.')
  }

  const car = await Car.findById(req.params.id)
  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  if (!car.available) {
    return res.json({ success: true, available: false, reason: 'Car is not available for rent.' })
  }

  // Check for overlapping bookings
  const conflict = await Booking.findOne({
    car:    car._id,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or: [
      { startDate: { $lte: new Date(endDate)   }, endDate: { $gte: new Date(startDate) } },
    ],
  })

  res.json({
    success:   true,
    available: !conflict,
    reason:    conflict ? 'Car is booked for the selected dates.' : null,
  })
})

// ── GET /api/cars/brands ──────────────────────────────────────
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Car.distinct('brand')
  res.json({ success: true, data: brands.sort() })
})

// ── GET /api/cars/locations ───────────────────────────────────
const getLocations = asyncHandler(async (req, res) => {
  const locations = await Car.distinct('location')
  res.json({ success: true, data: locations.sort() })
})

module.exports = {
  getCars,
  getFeaturedCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  addReview,
  checkAvailability,
  getBrands,
  getLocations,
}
