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
const subscriberRoutes = require('./src/routes/subscriberRoutes')


const app = express()
const PORT = process.env.PORT || 5000

// Security
app.use(helmet())

// ✅ SIMPLE & BEST CORS FIX (no future issues)
app.use(cors({
  origin: true,
  credentials: true
}))

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

// ✅ Health route (important for testing)
app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/subscribe', subscriberRoutes)
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