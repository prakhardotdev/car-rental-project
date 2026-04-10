const Subscriber = require('../models/Subscriber')

// ADD EMAIL
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email required' })
    }

    const exists = await Subscriber.findOne({ email })

    if (exists) {
      return res.status(400).json({ message: 'Already subscribed' })
    }

    const sub = await Subscriber.create({ email })

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      data: sub
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}