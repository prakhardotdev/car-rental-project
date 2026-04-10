const asyncHandler = require('express-async-handler')
const Car          = require('../models/Car')
const Booking      = require('../models/Booking')
const { deleteImage } = require('../utils/cloudinaryUtils')

// ── GET /api/cars ─────────────────────────────────────────────
const getCars = asyncHandler(async (req, res) => {
  const {
    q, brand, type, fuel, transmission,
    minPrice, maxPrice, location, available, isFeatured,
    sort = 'createdAt', order = 'desc',
    page  = 1,
    limit = 12,
  } = req.query

  const filter = {}

  if (q) filter.$text = { $search: q }

  if (brand)        filter.brand        = new RegExp(`^${brand}$`, 'i')
  if (type)         filter.type         = type
  if (fuel)         filter.fuel         = fuel
  if (transmission) filter.transmission = transmission
  if (location)     filter.location     = new RegExp(location, 'i')
  if (available !== undefined) filter.available = available === 'true'
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

  if (minPrice || maxPrice) {
    filter.pricePerDay = {}
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice)
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice)
  }

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
  const cars = await Car.find({ isFeatured: true, available: true })
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
const createCar = asyncHandler(async (req, res) => {
  const {
    name, brand, year, color, type, fuel, transmission,
    seats, power, topSpeed, acceleration, mileage,
    pricePerDay, location, isFeatured, description, features,
  } = req.body

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
    isFeatured:   isFeatured === 'true' || isFeatured === true,
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
const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  const allowedFields = [
    'name','brand','year','color','type','fuel','transmission',
    'seats','power','topSpeed','acceleration','mileage',
    'pricePerDay','location','available','isFeatured',
    'description','features',
  ]

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      car[field] = req.body[field]
    }
  })

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
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)

  if (!car) {
    res.status(404)
    throw new Error('Car not found.')
  }

  const activeBooking = await Booking.findOne({
    car:    car._id,
    status: { $in: ['confirmed', 'active'] },
  })

  if (activeBooking) {
    res.status(400)
    throw new Error('Cannot delete a car with active bookings.')
  }

  if (car.cloudinaryIds?.length) {
    await Promise.all(car.cloudinaryIds.map(deleteImage))
  }

  await car.deleteOne()

  res.json({ success: true, message: 'Car deleted successfully.' })
})

// ── GET brands ────────────────────────────────────────────────
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Car.distinct('brand')
  res.json({ success: true, data: brands.sort() })
})

// ── GET locations ─────────────────────────────────────────────
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
  getBrands,
  getLocations,
}