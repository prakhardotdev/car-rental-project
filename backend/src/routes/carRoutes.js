const express = require('express')
const router  = express.Router()

const {
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
} = require('../controllers/carController')

const { protect, adminOnly } = require('../middleware/authMiddleware')
const { carValidation, mongoIdParam } = require('../middleware/validationMiddleware')
const { uploadCarImage } = require('../utils/cloudinaryUtils')

// ================== PUBLIC ROUTES ==================
router.get('/', getCars)
router.get('/featured', getFeaturedCars)
router.get('/brands', getBrands)
router.get('/locations', getLocations)

// ❌ spread hata diya
router.get('/:id', mongoIdParam('id'), getCarById)
router.get('/:id/availability', mongoIdParam('id'), checkAvailability)

// ================== USER ==================
router.post('/:id/reviews', protect, mongoIdParam('id'), addReview)

// ================== ADMIN ==================
router.post(
  '/',
  protect,
  adminOnly,
  uploadCarImage.array('images', 10),
  carValidation,
  createCar
)

router.put(
  '/:id',
  protect,
  adminOnly,
  mongoIdParam('id'),
  uploadCarImage.array('images', 10),
  updateCar
)

router.delete(
  '/:id',
  protect,
  adminOnly,
  mongoIdParam('id'),
  deleteCar
)

module.exports = router