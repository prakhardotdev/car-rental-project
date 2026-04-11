import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function Booking() {
  const { id } = useParams()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔥 Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`)
        setCar(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id])

  // 🔥 Dummy calculation (modify if needed)
  const days = 2
  const totalPrice = car ? car.pricePerDay * days : 0

  // 🔥 STRIPE PAYMENT FUNCTION
  const handlePayment = async () => {
    try {
      console.log("Payment button clicked")

      const res = await api.post('/payments/create-checkout-session', {
        carName: car.name,
        price: totalPrice,
      })

      console.log(res.data)

      // 🔥 REDIRECT TO STRIPE
      window.location.href = res.data.url
    } catch (err) {
      console.error(err)
      alert("Payment failed")
    }
  }

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>

  if (!car) return <div className="text-white text-center mt-20">Car not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-white">
      <div className="grid md:grid-cols-2 gap-8">

        {/* LEFT - PAYMENT */}
        <div className="bg-night-800 p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-3 bg-night-900 border border-white/10 rounded-lg"
            />
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-1/2 p-3 bg-night-900 border border-white/10 rounded-lg"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-1/2 p-3 bg-night-900 border border-white/10 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full p-3 bg-night-900 border border-white/10 rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="bg-night-800 p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={car.image}
              alt={car.name}
              className="w-20 h-14 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{car.name}</h3>
              <p className="text-sm text-gray-400">{car.brand}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>₹{car.pricePerDay} x {days} days</span>
              <span>₹{totalPrice}</span>
            </div>

            <div className="flex justify-between">
              <span>Insurance (5%)</span>
              <span>₹{Math.round(totalPrice * 0.05)}</span>
            </div>

            <div className="flex justify-between text-green-400">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>

            <hr className="border-white/10" />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                ₹{totalPrice + Math.round(totalPrice * 0.05)}
              </span>
            </div>
          </div>

          {/* 🔥 STRIPE BUTTON */}
          <button
            onClick={handlePayment}
            className="w-full mt-6 bg-gold-gradient text-black py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Continue to Payment
          </button>
        </div>

      </div>
    </div>
  )
}