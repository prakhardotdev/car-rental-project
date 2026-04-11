import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createCheckoutSession = async (req, res) => {
  try {
    const { carName, price } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: carName,
            },
            unit_amount: price * 100, // paisa me convert
          },
          quantity: 1,
        },
      ],

      success_url: 'https://car-rental-project15.vercel.app/success',
      cancel_url: 'https://car-rental-project15.vercel.app/cancel',
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}