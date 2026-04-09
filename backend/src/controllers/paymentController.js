const asyncHandler = require('express-async-handler')
const stripe       = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking      = require('../models/Booking')
const { sendEmail } = require('../utils/emailUtils')

// ── POST /api/payments/create-intent ─────────────────────────
// Creates a Stripe PaymentIntent for a booking
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { bookingId } = req.body

  if (!bookingId) {
    res.status(400)
    throw new Error('bookingId is required.')
  }

  const booking = await Booking.findById(bookingId)
    .populate('car',  'name brand')
    .populate('user', 'name email')

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  // Ensure requester owns the booking
  if (booking.user._id.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized.')
  }

  if (booking.paymentStatus === 'paid') {
    res.status(400)
    throw new Error('This booking has already been paid.')
  }

  // Stripe expects amount in smallest currency unit (paise for INR)
  const amountInPaise = Math.round(booking.total * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountInPaise,
    currency: 'inr',
    metadata: {
      bookingId:  booking._id.toString(),
      bookingRef: booking.bookingRef,
      userId:     req.user._id.toString(),
      carName:    booking.car.name,
    },
    description: `LuxeDrive — ${booking.bookingRef} — ${booking.car.name}`,
    receipt_email: req.user.email,
  })

  // Save stripe session ID to booking
  booking.stripePaymentId = paymentIntent.id
  await booking.save()

  res.json({
    success:      true,
    clientSecret: paymentIntent.client_secret,
    amount:       booking.total,
    currency:     'INR',
    bookingRef:   booking.bookingRef,
  })
})

// ── POST /api/payments/confirm ────────────────────────────────
// Called by frontend after Stripe payment succeeds
const confirmPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentIntentId } = req.body

  if (!bookingId || !paymentIntentId) {
    res.status(400)
    throw new Error('bookingId and paymentIntentId are required.')
  }

  // Verify with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== 'succeeded') {
    res.status(400)
    throw new Error(`Payment not successful. Status: ${paymentIntent.status}`)
  }

  const booking = await Booking.findById(bookingId)
    .populate('car',  'name')
    .populate('user', 'name email')

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  // Update booking payment status
  booking.paymentStatus    = 'paid'
  booking.status           = 'confirmed'
  booking.stripePaymentId  = paymentIntentId
  booking.confirmedAt      = new Date()
  await booking.save()

  // Send payment receipt
  sendEmail(booking.user.email, 'paymentReceipt', {
    userName:      booking.user.name,
    transactionId: paymentIntentId,
    bookingRef:    booking.bookingRef,
    carName:       booking.car.name,
    subtotal:      booking.subtotal,
    insurance:     booking.insurance,
    total:         booking.total,
  })

  res.json({
    success:    true,
    message:    'Payment confirmed! Your booking is now active.',
    bookingRef: booking.bookingRef,
    data:       booking,
  })
})

// ── POST /api/payments/webhook ────────────────────────────────
// Stripe sends events here. Raw body required (see server.js)
const handleWebhook = asyncHandler(async (req, res) => {
  const sig    = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  switch (event.type) {

    case 'payment_intent.succeeded': {
      const pi      = event.data.object
      const booking = await Booking.findOne({ stripePaymentId: pi.id })
        .populate('car',  'name')
        .populate('user', 'name email')

      if (booking && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid'
        booking.status        = 'confirmed'
        booking.confirmedAt   = new Date()
        await booking.save()
        console.log(`✅ Webhook: Payment confirmed for ${booking.bookingRef}`)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi      = event.data.object
      const booking = await Booking.findOne({ stripePaymentId: pi.id })

      if (booking) {
        booking.status = 'cancelled'
        booking.cancelReason = 'Payment failed'
        await booking.save()
        console.log(`❌ Webhook: Payment failed for booking — ${pi.id}`)
      }
      break
    }

    case 'charge.refunded': {
      const charge  = event.data.object
      const booking = await Booking.findOne({ stripePaymentId: charge.payment_intent })

      if (booking) {
        booking.paymentStatus = 'refunded'
        await booking.save()
        console.log(`💰 Webhook: Refund processed for ${booking.bookingRef}`)
      }
      break
    }

    default:
      // Unhandled event types — just acknowledge
      break
  }

  // Acknowledge receipt to Stripe (must be fast — < 30s)
  res.json({ received: true })
})

// ── POST /api/payments/refund (Admin) ────────────────────────
const processRefund = asyncHandler(async (req, res) => {
  const { bookingId, reason = 'requested_by_customer' } = req.body

  const booking = await Booking.findById(bookingId)

  if (!booking) {
    res.status(404)
    throw new Error('Booking not found.')
  }

  if (booking.paymentStatus !== 'paid') {
    res.status(400)
    throw new Error('Only paid bookings can be refunded.')
  }

  if (!booking.stripePaymentId) {
    res.status(400)
    throw new Error('No Stripe payment ID found for this booking.')
  }

  const refund = await stripe.refunds.create({
    payment_intent: booking.stripePaymentId,
    reason,
  })

  booking.paymentStatus = 'refunded'
  await booking.save()

  res.json({
    success:  true,
    message:  'Refund processed successfully.',
    refundId: refund.id,
    amount:   refund.amount / 100,
  })
})

// ── GET /api/payments/config ──────────────────────────────────
// Returns Stripe publishable key to frontend (safe to expose)
const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json({
    success:          true,
    publishableKey:   process.env.STRIPE_PUBLISHABLE_KEY || '',
    supportedMethods: ['card', 'upi'],
    currency:         'INR',
  })
})

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  processRefund,
  getPaymentConfig,
}
