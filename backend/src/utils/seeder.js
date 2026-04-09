/**
 * LuxeDrive Database Seeder
 *
 * Usage:
 *   node src/utils/seeder.js          → seed database
 *   node src/utils/seeder.js --down   → wipe all data
 */

const dotenv   = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')
const User     = require('../models/User')
const Car      = require('../models/Car')
const Booking  = require('../models/Booking')

// ── Seed data ─────────────────────────────────────────────────

const USERS = [
  {
    name:    process.env.ADMIN_NAME     || 'Admin',
    email:   process.env.ADMIN_EMAIL    || 'admin@luxedrive.com',
    password:process.env.ADMIN_PASSWORD || 'Admin@123!',
    role:    'admin',
    phone:   '+91 98765 00000',
    city:    'Mumbai',
    emailVerified: true,
  },
  {
    name:    'Arjun Sharma',
    email:   'user@luxedrive.com',
    password:'password123',
    role:    'user',
    phone:   '+91 98765 43210',
    city:    'Mumbai',
    emailVerified: true,
  },
]

const CARS = [
  {
    name:         'Mercedes-AMG GT',
    brand:        'Mercedes',
    year:         2023,
    color:        'Obsidian Black',
    type:         'Sports',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        2,
    power:        '630 HP',
    topSpeed:     '318 km/h',
    acceleration: '3.2s (0–100)',
    mileage:      '8 km/L',
    image:        'https://images.unsplash.com/photo-1617654112368-307921291f42?w=900&q=80',
    images:       [
      'https://images.unsplash.com/photo-1617654112368-307921291f42?w=900&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80',
    ],
    pricePerDay:  8500,
    location:     'Mumbai',
    available:    true,
    featured:     true,
    description:  'The AMG GT blends racing DNA with everyday usability. Its handcrafted 4.0L V8 biturbo engine delivers staggering performance with a spine-tingling exhaust note.',
    features:     ['AIRMATIC Suspension', 'Burmester Sound', 'AMG RIDE CONTROL', 'Night Package', 'Heated Seats', 'Panoramic Roof'],
    rating:       4.9,
    totalReviews: 124,
  },
  {
    name:         'Porsche 911 Carrera',
    brand:        'Porsche',
    year:         2023,
    color:        'GT Silver',
    type:         'Sports',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        4,
    power:        '450 HP',
    topSpeed:     '296 km/h',
    acceleration: '3.8s (0–100)',
    mileage:      '9 km/L',
    image:        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80'],
    pricePerDay:  7200,
    location:     'Delhi',
    available:    true,
    featured:     true,
    description:  'The 911 is the benchmark sports car. Decades of engineering refinement have resulted in a machine that excels on road and track.',
    features:     ['Sport Chrono Package', 'PASM', 'Lane Change Assist', 'Bose Surround Sound', 'Sport Exhaust', 'LED Matrix'],
    rating:       4.8,
    totalReviews: 98,
  },
  {
    name:         'Range Rover Autobiography',
    brand:        'Land Rover',
    year:         2024,
    color:        'Carpathian Grey',
    type:         'SUV',
    fuel:         'Diesel',
    transmission: 'Automatic',
    seats:        5,
    power:        '360 HP',
    topSpeed:     '225 km/h',
    acceleration: '6.4s (0–100)',
    mileage:      '12 km/L',
    image:        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80'],
    pricePerDay:  9500,
    location:     'Bangalore',
    available:    true,
    featured:     true,
    description:  'The pinnacle of luxury SUVs. The Autobiography combines commanding road presence with a lavish interior.',
    features:     ['Meridian Sound', 'Massage Seats', 'Air Suspension', '4-Zone Climate', 'Panoramic Roof', 'Head-Up Display'],
    rating:       4.7,
    totalReviews: 76,
  },
  {
    name:         'BMW M5 Competition',
    brand:        'BMW',
    year:         2023,
    color:        'Frozen Black',
    type:         'Sedan',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        5,
    power:        '627 HP',
    topSpeed:     '305 km/h',
    acceleration: '3.3s (0–100)',
    mileage:      '10 km/L',
    image:        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80'],
    pricePerDay:  6800,
    location:     'Mumbai',
    available:    true,
    featured:     false,
    description:  'The super-saloon that does everything. 627 hp, AWD, and a full back seat — the M5 Competition is the most practical supercar.',
    features:     ['M xDrive AWD', 'Active M Differential', 'Carbon Brakes', 'Harman Kardon', 'Gesture Control'],
    rating:       4.8,
    totalReviews: 88,
  },
  {
    name:         'Lamborghini Urus',
    brand:        'Lamborghini',
    year:         2024,
    color:        'Arancio Borealis',
    type:         'SUV',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        5,
    power:        '657 HP',
    topSpeed:     '305 km/h',
    acceleration: '3.6s (0–100)',
    mileage:      '7 km/L',
    image:        'https://images.unsplash.com/photo-1588171610540-9aab13ee6ca7?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1588171610540-9aab13ee6ca7?w=900&q=80'],
    pricePerDay:  15000,
    location:     'Goa',
    available:    true,
    featured:     true,
    description:  'The Super SUV. The Urus delivers supercar performance in a body that can carry your family and luggage.',
    features:     ['ANIMA Selector', 'Active Roll Stabilization', 'Sensonum Audio', 'Night Vision', '4-Wheel Steering'],
    rating:       5.0,
    totalReviews: 42,
  },
  {
    name:         'Audi RS7 Sportback',
    brand:        'Audi',
    year:         2023,
    color:        'Nardo Grey',
    type:         'Hatchback',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        5,
    power:        '591 HP',
    topSpeed:     '280 km/h',
    acceleration: '3.6s (0–100)',
    mileage:      '9 km/L',
    image:        'https://images.unsplash.com/photo-1617886322168-72b886573c35?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1617886322168-72b886573c35?w=900&q=80'],
    pricePerDay:  7000,
    location:     'Hyderabad',
    available:    true,
    featured:     false,
    description:  "The RS7 Sportback is a four-door coupé showcasing Audi's most advanced technologies.",
    features:     ['quattro AWD', 'Matrix LED', 'Bang & Olufsen 3D', 'RS Sport Exhaust', 'Predictive Active Suspension'],
    rating:       4.7,
    totalReviews: 65,
  },
  {
    name:         'Tesla Model S Plaid',
    brand:        'Tesla',
    year:         2024,
    color:        'Midnight Cherry',
    type:         'Sedan',
    fuel:         'Electric',
    transmission: 'Automatic',
    seats:        5,
    power:        '1,020 HP',
    topSpeed:     '322 km/h',
    acceleration: '2.1s (0–100)',
    mileage:      '640 km range',
    image:        'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=900&q=80'],
    pricePerDay:  5500,
    location:     'Pune',
    available:    true,
    featured:     false,
    description:  "The fastest production car. The Model S Plaid's three-motor setup delivers 1,020 HP for a 0–100 time that defies belief.",
    features:     ['Autopilot', '17" Cinematic Display', 'Premium Audio', 'Heat Pump', 'Full Self-Driving Capable'],
    rating:       4.6,
    totalReviews: 110,
  },
  {
    name:         'Ferrari Roma',
    brand:        'Ferrari',
    year:         2024,
    color:        'Rosso Portofino',
    type:         'Sports',
    fuel:         'Petrol',
    transmission: 'Automatic',
    seats:        2,
    power:        '612 HP',
    topSpeed:     '320 km/h',
    acceleration: '3.4s (0–100)',
    mileage:      '8 km/L',
    image:        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80',
    images:       ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80'],
    pricePerDay:  18000,
    location:     'Goa',
    available:    true,
    featured:     true,
    description:  'The Ferrari Roma embodies the spirit of La Dolce Vita. Its elegant 2+ design and sublime handling make it the most beautiful Ferrari in decades.',
    features:     ['Manettino Dial', 'Ferrari Side Slip Control', 'Adaptive Suspension', 'JBL Professional', 'Carbon Fibre Package'],
    rating:       5.0,
    totalReviews: 28,
  },
]

// ── Seeder logic ──────────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected for seeding')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Car.deleteMany({}),
      Booking.deleteMany({}),
    ])
    console.log('🗑️  Existing data cleared')

    // Create users
    const createdUsers = await User.create(USERS)
    const adminUser    = createdUsers.find(u => u.role === 'admin')
    console.log(`👤 Created ${createdUsers.length} users`)

    // Create cars (attach addedBy = admin)
    const carsWithAdmin = CARS.map(car => ({ ...car, addedBy: adminUser._id }))
    const createdCars   = await Car.create(carsWithAdmin)
    console.log(`🚗 Created ${createdCars.length} cars`)

    // Create sample bookings for demo user
    const demoUser = createdUsers.find(u => u.role === 'user')

    const today      = new Date()
    const tomorrow   = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const in3Days    = new Date(today); in3Days.setDate(today.getDate() + 3)
    const in7Days    = new Date(today); in7Days.setDate(today.getDate() + 7)
    const in10Days   = new Date(today); in10Days.setDate(today.getDate() + 10)
    const past5      = new Date(today); past5.setDate(today.getDate() - 5)
    const past2      = new Date(today); past2.setDate(today.getDate() - 2)
    const past15     = new Date(today); past15.setDate(today.getDate() - 15)
    const past10     = new Date(today); past10.setDate(today.getDate() - 10)

    const sampleBookings = [
      // Upcoming confirmed booking
      {
        user:            demoUser._id,
        car:             createdCars[0]._id,   // Mercedes AMG GT
        startDate:       in3Days,
        endDate:         in7Days,
        days:            4,
        pickupLocation:  'Mumbai Airport',
        dropoffLocation: 'Mumbai Airport',
        driverName:      demoUser.name,
        driverEmail:     demoUser.email,
        driverPhone:     '+91 98765 43210',
        pricePerDay:     8500,
        subtotal:        34000,
        insurance:       1700,
        total:           35700,
        status:          'confirmed',
        paymentStatus:   'paid',
        paymentMethod:   'card',
        confirmedAt:     new Date(),
      },
      // Completed past booking
      {
        user:            demoUser._id,
        car:             createdCars[1]._id,   // Porsche 911
        startDate:       past15,
        endDate:         past10,
        days:            5,
        pickupLocation:  'Delhi Connaught Place',
        dropoffLocation: 'Delhi Connaught Place',
        driverName:      demoUser.name,
        driverEmail:     demoUser.email,
        driverPhone:     '+91 98765 43210',
        pricePerDay:     7200,
        subtotal:        36000,
        insurance:       1800,
        total:           37800,
        status:          'completed',
        paymentStatus:   'paid',
        paymentMethod:   'card',
        confirmedAt:     past15,
        completedAt:     past10,
      },
      // Pending booking
      {
        user:            demoUser._id,
        car:             createdCars[4]._id,   // Lamborghini Urus
        startDate:       in7Days,
        endDate:         in10Days,
        days:            3,
        pickupLocation:  'Goa Airport',
        dropoffLocation: 'Goa Airport',
        driverName:      demoUser.name,
        driverEmail:     demoUser.email,
        driverPhone:     '+91 98765 43210',
        pricePerDay:     15000,
        subtotal:        45000,
        insurance:       2250,
        total:           47250,
        status:          'pending',
        paymentStatus:   'unpaid',
        paymentMethod:   'card',
      },
    ]

    await Booking.create(sampleBookings)
    console.log(`📅 Created ${sampleBookings.length} sample bookings`)

    console.log('\n✅ Database seeded successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🛡  Admin:')
    console.log(`   Email:    ${USERS[0].email}`)
    console.log(`   Password: ${USERS[0].password}`)
    console.log('👤 Demo User:')
    console.log(`   Email:    ${USERS[1].email}`)
    console.log(`   Password: ${USERS[1].password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  }
}

// ── Tear down ─────────────────────────────────────────────────
const destroyDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    await Promise.all([
      User.deleteMany({}),
      Car.deleteMany({}),
      Booking.deleteMany({}),
    ])
    console.log('🗑️  All data wiped.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Wipe failed:', err)
    process.exit(1)
  }
}

// ── Run ───────────────────────────────────────────────────────
if (process.argv.includes('--down')) {
  destroyDB()
} else {
  seedDB()
}
