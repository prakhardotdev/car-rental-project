const Car = require('../models/Car')

// ✅ Get all cars
const getCars = async (req, res) => {
  try {
    const cars = await Car.find({})
    res.json({ success: true, data: cars })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ✅ Featured cars
const getFeaturedCars = async (req, res) => {
  try {
    const cars = await Car.find({ isFeatured: true })
    res.json({ success: true, data: cars })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ✅ Single car
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    res.json({ success: true, data: car })
  } catch (err) {
    res.status(500).json({ success: false })
  }
}

// Dummy बाकी (error avoid ke liye)
const createCar = (req, res) => res.json({ success: true })
const updateCar = (req, res) => res.json({ success: true })
const deleteCar = (req, res) => res.json({ success: true })
const addReview = (req, res) => res.json({ success: true })
const checkAvailability = (req, res) => res.json({ success: true })
const getBrands = (req, res) => res.json({ success: true, data: [] })
const getLocations = (req, res) => res.json({ success: true, data: [] })

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
  getLocations
}