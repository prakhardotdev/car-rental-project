const Car = require('../models/Car')

// 🔹 GET ALL CARS
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find()
    res.json({ success: true, data: cars })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// 🔥 GET FEATURED CARS (FINAL FIX)
exports.getFeaturedCars = async (req, res) => {
  try {
    const cars = await Car.find({
      $or: [
        { isFeatured: true },
        { isFeatured: "true" } // 🔥 string bhi handle karega
      ]
    })

    res.json({
      success: true,
      count: cars.length,
      data: cars
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 🔹 GET SINGLE CAR
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({ message: 'Car not found' })
    }

    res.json({ success: true, data: car })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// 🔹 CREATE CAR (FIXED)
exports.createCar = async (req, res) => {
  try {
    // 🔥 ensure boolean
    if (req.body.isFeatured === "true") req.body.isFeatured = true
    if (req.body.isFeatured === "false") req.body.isFeatured = false

    const car = await Car.create(req.body)

    res.status(201).json({
      success: true,
      data: car
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 🔹 UPDATE CAR (FIXED)
exports.updateCar = async (req, res) => {
  try {
    // 🔥 ensure boolean
    if (req.body.isFeatured === "true") req.body.isFeatured = true
    if (req.body.isFeatured === "false") req.body.isFeatured = false

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.json({
      success: true,
      data: car
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// 🔹 DELETE CAR
exports.deleteCar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Car deleted'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 🔹 ADD REVIEW (dummy)
exports.addReview = async (req, res) => {
  res.json({ success: true, message: 'Review added' })
}

// 🔹 CHECK AVAILABILITY (dummy)
exports.checkAvailability = async (req, res) => {
  res.json({ success: true })
}

// 🔹 GET BRANDS
exports.getBrands = async (req, res) => {
  try {
    const brands = await Car.distinct('brand')

    res.json({
      success: true,
      data: brands
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// 🔹 GET LOCATIONS
exports.getLocations = async (req, res) => {
  try {
    const locations = await Car.distinct('location')

    res.json({
      success: true,
      data: locations
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}