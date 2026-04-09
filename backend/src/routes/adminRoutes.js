import express from "express"
import Contact from "../models/Contact.js"

import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  toggleFeatured,
  toggleAvailability,
} from "../controllers/adminController.js"

import { protect, adminOnly } from "../middleware/authMiddleware.js"
import { mongoIdParam } from "../middleware/validationMiddleware.js"

const router = express.Router()

// All admin routes require auth + admin role
router.use(protect, adminOnly)

// Existing routes
router.get("/stats", getDashboardStats)
router.get("/users", getUsers)
router.put("/users/:id/status", ...mongoIdParam("id"), updateUserStatus)
router.put("/cars/:id/featured", ...mongoIdParam("id"), toggleFeatured)
router.put("/cars/:id/availability", ...mongoIdParam("id"), toggleAvailability)

// 🔥 CONTACT MESSAGES
router.get("/contacts", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" })
  }
})

// MARK AS READ
router.put("/contacts/:id", async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: "Error updating" })
  }
})

export default router