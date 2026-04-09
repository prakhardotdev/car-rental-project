import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Car from '../models/Car.js'

dotenv.config()

const cars = [
  {
    name: "Maruti Swift",
    brand: "Maruti",
    year: 2022,
    type: "Hatchback",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1200,
    location: "Lucknow",
    description: "Affordable and fuel-efficient hatchback perfect for city rides.",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb"
  },
  {
    name: "Hyundai i20",
    brand: "Hyundai",
    year: 2023,
    type: "Hatchback",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1400,
    location: "Lucknow",
    description: "Stylish hatchback with modern features.",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a"
  },
  {
    name: "Tata Punch",
    brand: "Tata",
    year: 2023,
    type: "SUV",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1500,
    location: "Lucknow",
    description: "Compact SUV for Indian roads.",
    image: "https://images.unsplash.com/photo-1674820473380-5a3a56c8f8c5"
  },
  {
    name: "Maruti Baleno",
    brand: "Maruti",
    year: 2023,
    type: "Hatchback",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 1600,
    location: "Lucknow",
    description: "Premium hatchback with smooth drive.",
    image: "https://images.unsplash.com/photo-1626072778346-0ab1b4d7fcb7"
  },
  {
    name: "Hyundai Creta",
    brand: "Hyundai",
    year: 2023,
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2500,
    location: "Lucknow",
    description: "Popular SUV with comfort and style.",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2"
  },
  {
    name: "Kia Seltos",
    brand: "Kia",
    year: 2023,
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2600,
    location: "Lucknow",
    description: "Feature-rich SUV.",
    image: "https://images.unsplash.com/photo-1621891330345-512e6b2c1c07"
  },
  {
    name: "Maruti WagonR",
    brand: "Maruti",
    year: 2022,
    type: "Hatchback",
    fuel: "CNG",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1000,
    location: "Lucknow",
    description: "Budget-friendly car.",
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f"
  },
  {
    name: "Tata Nexon",
    brand: "Tata",
    year: 2023,
    type: "SUV",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 2200,
    location: "Lucknow",
    description: "Safe and powerful SUV.",
    image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04"
  },
  {
    name: "Honda City",
    brand: "Honda",
    year: 2023,
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2400,
    location: "Lucknow",
    description: "Comfortable sedan for long drives.",
    image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b"
  },
  {
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    year: 2023,
    type: "SUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    pricePerDay: 3500,
    location: "Lucknow",
    description: "Perfect for family trips.",
    image: "https://images.unsplash.com/photo-1626072778346-0ab1b4d7fcb7"
  }
]

const seedCars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

   
    await Car.insertMany(cars)

    console.log("🔥 Cars seeded successfully")
    process.exit()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

seedCars()