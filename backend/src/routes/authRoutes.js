const express = require('express')
const router  = express.Router()

const {
  signup, login, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword, updateAvatar,
} = require('../controllers/authController')

const { protect } = require('../middleware/authMiddleware')
const { signupValidation, loginValidation } = require('../middleware/validationMiddleware')
const { uploadAvatar } = require('../utils/cloudinaryUtils')

// Public routes
router.post('/signup',          signupValidation, signup)
router.post('/login',           loginValidation,  login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

// Protected routes (require JWT)
router.get ('/me',              protect, getMe)
router.put ('/profile',         protect, updateProfile)
router.put ('/change-password', protect, changePassword)
router.put ('/avatar',          protect, uploadAvatar.single('avatar'), updateAvatar)

module.exports = router
