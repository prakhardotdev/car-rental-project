import express from "express"
import Stripe from "stripe"

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// CREATE CHECKOUT SESSION
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { carName, price } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: carName,
            },
            unit_amount: price * 100, // paisa me
          },
          quantity: 1,
        },
      ],

      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    })

    res.json({ url: session.url })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router