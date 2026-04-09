const express    = require('express')
const router     = express.Router()
const asyncHandler = require('express-async-handler')

const { protect, adminOnly }              = require('../middleware/authMiddleware')
const { uploadCarImage, uploadAvatar, deleteImage } = require('../utils/cloudinaryUtils')

// ── POST /api/upload/car-image ────────────────────────────────
// Admin uploads single car image → returns Cloudinary URL
router.post(
  '/car-image',
  protect,
  adminOnly,
  uploadCarImage.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400)
      throw new Error('No image file provided.')
    }
    res.json({
      success:   true,
      url:       req.file.path,      // Cloudinary secure URL
      publicId:  req.file.filename,  // Cloudinary public_id
    })
  })
)

// ── POST /api/upload/car-images ───────────────────────────────
// Admin uploads up to 10 car images at once
router.post(
  '/car-images',
  protect,
  adminOnly,
  uploadCarImage.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) {
      res.status(400)
      throw new Error('No image files provided.')
    }
    res.json({
      success: true,
      images:  req.files.map(f => ({ url: f.path, publicId: f.filename })),
    })
  })
)

// ── POST /api/upload/avatar ───────────────────────────────────
// Any logged-in user uploads their avatar
router.post(
  '/avatar',
  protect,
  uploadAvatar.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400)
      throw new Error('No image file provided.')
    }
    res.json({
      success:  true,
      url:      req.file.path,
      publicId: req.file.filename,
    })
  })
)

// ── DELETE /api/upload/image ──────────────────────────────────
// Admin deletes an image from Cloudinary by publicId
router.delete(
  '/image',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { publicId } = req.body
    if (!publicId) {
      res.status(400)
      throw new Error('publicId is required.')
    }
    await deleteImage(publicId)
    res.json({ success: true, message: 'Image deleted from Cloudinary.' })
  })
)

module.exports = router
