import mongoose from "mongoose"

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model("Contact", contactSchema)