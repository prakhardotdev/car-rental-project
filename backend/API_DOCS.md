# 🔌 LuxeDrive API Documentation

Base URL: `https://car-rental-project-1-so2f.onrender.com/api` (dev) | `https://your-api.onrender.com/api` (prod)

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 📋 Response Format

All responses follow this shape:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data":    { ... }   // or array
}
```

Error responses additionally include:
```json
{
  "success": false,
  "message": "What went wrong",
  "errors":  [{ "field": "email", "message": "Invalid email" }]
}
```

---

## 🔐 Auth Routes — `/api/auth`

| Method | Endpoint                     | Auth     | Body / Params                               |
|--------|------------------------------|----------|---------------------------------------------|
| POST   | `/signup`                    | Public   | `{ name, email, password }`                 |
| POST   | `/login`                     | Public   | `{ email, password }`                       |
| GET    | `/me`                        | User     | —                                           |
| PUT    | `/profile`                   | User     | `{ name?, phone?, city?, notifications? }`  |
| PUT    | `/change-password`           | User     | `{ currentPassword, newPassword }`          |
| PUT    | `/avatar`                    | User     | multipart/form-data: `avatar` (image file)  |
| POST   | `/forgot-password`           | Public   | `{ email }`                                 |
| POST   | `/reset-password/:token`     | Public   | `{ password }`                              |

### Example — Login
```bash
curl -X POST https://car-rental-project-1-so2f.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@luxedrive.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3...",
    "name": "Arjun Sharma",
    "email": "user@luxedrive.com",
    "role": "user"
  }
}
```

---

## 🚗 Car Routes — `/api/cars`

| Method | Endpoint               | Auth       | Description                                   |
|--------|------------------------|------------|-----------------------------------------------|
| GET    | `/`                    | Public     | List cars (supports filters + pagination)     |
| GET    | `/featured`            | Public     | Get featured cars                             |
| GET    | `/brands`              | Public     | List all distinct brands                      |
| GET    | `/locations`           | Public     | List all distinct locations                   |
| GET    | `/:id`                 | Public     | Get single car by ID                          |
| GET    | `/:id/availability`    | Public     | Check availability for dates                  |
| POST   | `/`                    | Admin      | Create a new car (multipart + images)         |
| PUT    | `/:id`                 | Admin      | Update car details / images                   |
| DELETE | `/:id`                 | Admin      | Delete car (fails if active bookings exist)   |
| POST   | `/:id/reviews`         | User       | Add a review (must have completed booking)    |

### Query Parameters for `GET /api/cars`

| Param          | Type    | Example              | Description                        |
|----------------|---------|----------------------|------------------------------------|
| `q`            | string  | `Porsche`            | Full-text search                   |
| `brand`        | string  | `Mercedes`           | Filter by brand                    |
| `type`         | string  | `SUV`                | Sports, SUV, Sedan, Hatchback...   |
| `fuel`         | string  | `Electric`           | Petrol, Diesel, Electric, Hybrid   |
| `transmission` | string  | `Automatic`          | Automatic or Manual                |
| `location`     | string  | `Mumbai`             | Partial match on location          |
| `minPrice`     | number  | `3000`               | Min price per day (₹)              |
| `maxPrice`     | number  | `10000`              | Max price per day (₹)              |
| `available`    | boolean | `true`               | Filter by availability             |
| `featured`     | boolean | `true`               | Only featured cars                 |
| `sort`         | string  | `price_asc`          | price_asc, price_desc, rating, newest |
| `page`         | number  | `1`                  | Pagination page                    |
| `limit`        | number  | `12`                 | Results per page (default: 12)     |

### Example — Create Car (Admin)
```bash
curl -X POST https://car-rental-project-1-so2f.onrender.com/api/cars \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "name=Porsche Taycan" \
  -F "brand=Porsche" \
  -F "type=Sedan" \
  -F "fuel=Electric" \
  -F "transmission=Automatic" \
  -F "seats=5" \
  -F "pricePerDay=9000" \
  -F "year=2024" \
  -F "location=Delhi" \
  -F "power=571 HP" \
  -F "images=@/path/to/car1.jpg" \
  -F "images=@/path/to/car2.jpg"
```

---

## 📅 Booking Routes — `/api/bookings`

| Method | Endpoint            | Auth    | Description                                |
|--------|---------------------|---------|--------------------------------------------|
| POST   | `/`                 | User    | Create a new booking                       |
| GET    | `/my`               | User    | Get logged-in user's bookings              |
| GET    | `/:id`              | User    | Get single booking (own or admin)          |
| PUT    | `/:id/cancel`       | User    | Cancel a pending/confirmed booking         |
| GET    | `/`                 | Admin   | Get ALL bookings (with filters)            |
| PUT    | `/:id/status`       | Admin   | Update booking status                      |

### Example — Create Booking
```json
POST /api/bookings
{
  "carId":           "65a1b2c3d4e5f6...",
  "startDate":       "2024-02-10",
  "endDate":         "2024-02-15",
  "pickupLocation":  "Mumbai Airport T2",
  "dropoffLocation": "Mumbai Airport T2",
  "paymentMethod":   "card",
  "notes":           "Please ensure AC is serviced"
}
```

Response:
```json
{
  "success": true,
  "message": "Booking created successfully! Check your email for confirmation.",
  "data": {
    "bookingRef":  "LXD-A1B2C3D4",
    "status":      "pending",
    "total":       42525,
    "days":        5,
    ...
  }
}
```

### Booking Status Flow
```
pending ──► confirmed ──► active ──► completed
         └──► cancelled
         └──► rejected
```

---

## 💳 Payment Routes — `/api/payments`

| Method | Endpoint              | Auth    | Description                                  |
|--------|-----------------------|---------|----------------------------------------------|
| GET    | `/config`             | Public  | Get Stripe publishable key                   |
| POST   | `/create-intent`      | User    | Create Stripe PaymentIntent for a booking    |
| POST   | `/confirm`            | User    | Confirm payment after Stripe.js succeeds     |
| POST   | `/webhook`            | Stripe  | Stripe webhook (raw body — no auth header)   |
| POST   | `/refund`             | Admin   | Process a refund for a paid booking          |

### Payment Flow
```
1. User creates booking → status: "pending"
2. Frontend calls POST /payments/create-intent with bookingId
3. Backend creates Stripe PaymentIntent → returns clientSecret
4. Frontend uses Stripe.js to confirm payment with clientSecret
5. Frontend calls POST /payments/confirm with paymentIntentId
6. Backend verifies with Stripe → sets booking status: "confirmed", paymentStatus: "paid"
7. Email receipt sent to user
```

---

## 🛡 Admin Routes — `/api/admin`

| Method | Endpoint                      | Auth  | Description                    |
|--------|-------------------------------|-------|--------------------------------|
| GET    | `/stats`                      | Admin | Full dashboard analytics       |
| GET    | `/users`                      | Admin | List all users (with search)   |
| PUT    | `/users/:id/status`           | Admin | Activate / deactivate user     |
| PUT    | `/cars/:id/featured`          | Admin | Toggle car featured status     |
| PUT    | `/cars/:id/availability`      | Admin | Toggle car availability        |

---

## 🖼 Upload Routes — `/api/upload`

| Method | Endpoint        | Auth  | Body                          |
|--------|-----------------|-------|-------------------------------|
| POST   | `/car-image`    | Admin | multipart: `image` (single)   |
| POST   | `/car-images`   | Admin | multipart: `images` (multi)   |
| POST   | `/avatar`       | User  | multipart: `avatar` (single)  |
| DELETE | `/image`        | Admin | `{ publicId: "..." }`         |

---

## 🚀 Part 3: Integration Checklist

Replace mock data in frontend with real API calls:

### `src/pages/Home.jsx`
```js
// Replace: import { CARS } from '../utils/mockData'
const { data } = await api.get('/cars?featured=true')
const cars = data.data
```

### `src/pages/Cars.jsx`
```js
// Replace static CARS with:
const { data } = await api.get(`/cars?${params}`)
```

### `src/pages/CarDetail.jsx`
```js
const { data } = await api.get(`/cars/${id}`)
const car = data.data
// Availability check:
const { data: avail } = await api.get(`/cars/${id}/availability?startDate=X&endDate=Y`)
```

### `src/pages/Booking.jsx`
```js
// Real booking creation:
const { data } = await api.post('/bookings', { carId, startDate, endDate, ... })
// Then initiate payment:
const { data: intent } = await api.post('/payments/create-intent', { bookingId: data.data._id })
// Use Stripe.js to complete payment with intent.clientSecret
```

### `src/pages/Dashboard.jsx`
```js
const { data } = await api.get('/bookings/my')
const bookings = data.data
```

### `src/pages/AdminDashboard.jsx`
```js
const { data } = await api.get('/admin/stats')
const stats = data.data
```

---

## 🗄️ MongoDB Schema Overview

```
users
  ├── name, email, password (hashed), role
  ├── phone, city, avatar
  ├── totalBookings, totalSpent
  └── notifications, isActive, emailVerified

cars
  ├── name, brand, year, color, type, fuel, transmission, seats
  ├── power, topSpeed, acceleration, mileage
  ├── image, images[], pricePerDay, location
  ├── available, featured, description, features[]
  └── reviews[], rating, totalReviews

bookings
  ├── bookingRef (auto-generated: LXD-XXXXXXXX)
  ├── user (ref), car (ref)
  ├── startDate, endDate, days
  ├── pickupLocation, dropoffLocation
  ├── pricePerDay, subtotal, insurance, total
  ├── status, paymentStatus, paymentMethod
  └── stripePaymentId, confirmedAt, cancelledAt
```
