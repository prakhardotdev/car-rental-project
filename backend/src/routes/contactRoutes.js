import express from "express"
import Contact from "../models/Contact.js"

const router = express.Router()

// SAVE MESSAGE
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body

    const newMsg = await Contact.create({
      name,
      email,
      message
    })

    res.status(200).json({
      success: true,
      message: "Message saved"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router