import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'

// Routes
import authRoutes from './src/routes/authRoutes.js'
import carRoutes from './src/routes/carRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import paymentRoutes from './src/routes/paymentRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'
import contactRoutes from './src/routes/contactRoutes.js'

// Error middleware
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js'

const app = express()
const PORT = process.env.PORT || 5000

// Security
app.use(helmet())

// 🔥 CORS FIX (FINAL)
const allowedOrigins = [
  "http://localhost:5173",
  "https://car-rental-project15.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}))

// 🔥 IMPORTANT (handle preflight requests)
app.options('*', cors())

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use('/api', limiter)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)

// Error handlers
app.use(notFound)
app.use(errorHandler)

// DB + Server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()