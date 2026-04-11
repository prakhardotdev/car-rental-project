const handleConfirm = async () => {
  if (!startDate || !endDate) {
    toast.error("Please select dates")
    return
  }

  if (new Date(startDate) < new Date()) {
    toast.error("Start date cannot be in past")
    return
  }

  setPaying(true)

  try {
    const start = new Date(startDate)
    start.setHours(12, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(12, 0, 0, 0)

    // ✅ STEP 1: create booking first
    const newBooking = await createBooking({
      carId: car._id,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      paymentMethod: payMethod,
      notes,
      totalAmount: total,
      days: days,
      pricePerDay: car.pricePerDay,
    })

    // ✅ STEP 2: STRIPE CALL
    const res = await api.post('/payments/create-checkout-session', {
      carName: car.name,
      price: total
    })

    // ✅ STEP 3: REDIRECT TO STRIPE
    window.location.href = res.data.url

  } catch (err) {
    console.log(err.response?.data)
    toast.error(err.response?.data?.message || 'Payment failed')
  } finally {
    setPaying(false)
  }
}