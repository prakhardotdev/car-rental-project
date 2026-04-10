import React from 'react'

export default function About() {
  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto text-white">

      {/* 🔥 HERO */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        About LuxeDrive 🚗
      </h1>
      <p className="text-gray-400 max-w-2xl mb-12">
        LuxeDrive is a modern car rental platform built for convenience,
        affordability, and premium driving experience.
      </p>

      {/* 🔥 FEATURES */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="card-dark p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Affordable Prices</h3>
          <p className="text-gray-400">Budget-friendly cars for everyone</p>
        </div>

        <div className="card-dark p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-400">Book in just a few clicks</p>
        </div>

        <div className="card-dark p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
          <p className="text-gray-400">Verified cars & secure payments</p>
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 text-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">500+</h2>
          <p className="text-gray-400">Cars Available</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-yellow-400">1000+</h2>
          <p className="text-gray-400">Happy Customers</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-yellow-400">20+</h2>
          <p className="text-gray-400">Cities Covered</p>
        </div>
      </div>

      {/* 🔥 WHY CHOOSE US */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Why Choose LuxeDrive?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">Premium Cars</h3>
            <p className="text-gray-400">Luxury & economy options available</p>
          </div>

          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">Instant Booking</h3>
            <p className="text-gray-400">No waiting, instant confirmation</p>
          </div>

          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-400">We are always here to help</p>
          </div>
        </div>
      </div>

      {/* 🔥 HOW IT WORKS */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">1. Choose Car</h3>
            <p className="text-gray-400">Browse & select your favorite car</p>
          </div>

          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">2. Book Instantly</h3>
            <p className="text-gray-400">Quick & easy booking process</p>
          </div>

          <div className="card-dark p-6 rounded-xl">
            <h3 className="font-semibold mb-2">3. Drive</h3>
            <p className="text-gray-400">Enjoy your ride hassle-free</p>
          </div>
        </div>
      </div>

      {/* 🔥 CTA */}
      <div className="text-center mb-20">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Ride?
        </h2>
        <p className="text-gray-400 mb-6">
          Book your dream car now with LuxeDrive
        </p>

        <a
          href="/cars"
          className="btn-gold px-8 py-3 inline-block"
        >
          Browse Cars
        </a>
      </div>

    </div>
  )
}