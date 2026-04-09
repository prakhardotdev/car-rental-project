# 🚗 LuxeDrive — Premium Car Rental Platform

A full-stack, production-ready car rental website built with React, Node.js, MongoDB, and Stripe.

---

## 📁 Project Structure

```
carental/
├── frontend/                  ← React + Vite + Tailwind (Part 1 — this folder)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CarCard.jsx
│   │   │   └── LoadingScreen.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   ├── CarDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── mockData.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── backend/                   ← Node.js + Express + MongoDB (Part 2 — coming next)
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   ├── server.js
│   └── .env.example
│
└── README.md
```

---

## 🚀 Part 1: Frontend Setup (Current)

### Prerequisites
- Node.js v18+
- npm v9+

### Steps

```bash
# 1. Navigate to frontend
cd carental/frontend

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env
# Edit .env with your values

# 4. Start dev server
npm run dev
# Opens at http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output: dist/ folder (ready to upload to Vercel / Netlify / S3)
```

---

## 🛠️ Part 2: Backend Setup (Coming Next)

The backend will be a Node.js + Express REST API with:

| Endpoint                         | Method | Auth     | Description               |
|----------------------------------|--------|----------|---------------------------|
| `/api/auth/signup`               | POST   | Public   | Register new user         |
| `/api/auth/login`                | POST   | Public   | Login, returns JWT        |
| `/api/auth/me`                   | GET    | User     | Get current user          |
| `/api/cars`                      | GET    | Public   | List cars with filters    |
| `/api/cars/:id`                  | GET    | Public   | Get single car            |
| `/api/cars`                      | POST   | Admin    | Add new car               |
| `/api/cars/:id`                  | PUT    | Admin    | Update car                |
| `/api/cars/:id`                  | DELETE | Admin    | Delete car                |
| `/api/bookings`                  | POST   | User     | Create booking            |
| `/api/bookings/my`               | GET    | User     | User's bookings           |
| `/api/bookings`                  | GET    | Admin    | All bookings              |
| `/api/bookings/:id/status`       | PUT    | Admin    | Update booking status     |
| `/api/payments/create-intent`    | POST   | User     | Stripe payment intent     |
| `/api/payments/webhook`          | POST   | Stripe   | Stripe webhook handler    |
| `/api/admin/stats`               | GET    | Admin    | Dashboard analytics       |
| `/api/upload/image`              | POST   | Admin    | Upload image to Cloudinary|

---

## 🔗 Part 3: Integration (Coming Next)

- Replace `mockData.js` with real API calls via `utils/api.js`
- Stripe payment flow with server-side intent creation
- Cloudinary image upload in Add Car modal
- Email confirmations via Nodemailer
- JWT auth flow fully connected
- Environment-based configuration

---

## 🌐 Deployment Guide

### Frontend → Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend/
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL = https://your-backend.onrender.com/api
# VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
```

### Frontend → Netlify

```bash
# Build
npm run build

# Upload dist/ folder to Netlify
# Or connect your GitHub repo and set:
#   Build command: npm run build
#   Publish directory: dist
```

### Backend → Render (Free Tier Available)

1. Push backend to GitHub
2. Create new Web Service on render.com
3. Set environment variables (see backend/.env.example)
4. Build command: `npm install`
5. Start command: `node server.js`

### Database → MongoDB Atlas (Free M0 Cluster)

1. Create account at mongodb.com/atlas
2. Create a free M0 cluster
3. Get connection string
4. Add to backend `MONGODB_URI` env var
5. Whitelist Render's IP or use 0.0.0.0/0 (not for production)

---

## 🎨 Design System

**Fonts**: Cormorant Garamond (Display) + Outfit (Body)

**Colors**:
| Token       | Value      | Usage               |
|-------------|------------|---------------------|
| `night-900` | `#04070f`  | Page background     |
| `night-800` | `#080e21`  | Card background     |
| `gold-400`  | `#e9c866`  | Accent / highlights |
| `gold-500`  | `#c8a232`  | Primary accent      |
| `gold-600`  | `#a4832a`  | Darker gold         |

**Components**: All custom components use Tailwind utility classes with these custom layers: `.btn-gold`, `.btn-ghost`, `.card-dark`, `.input-dark`, `.badge-gold`, `.glass`

---

## 🔐 Demo Credentials (Development Only)

| Role  | Email                  | Password     |
|-------|------------------------|--------------|
| User  | user@luxedrive.com     | password123  |
| Admin | admin@luxedrive.com    | admin123     |

---

## 📦 Key Dependencies

| Package              | Version | Purpose                    |
|----------------------|---------|----------------------------|
| react                | 18.x    | UI framework               |
| react-router-dom     | 6.x     | Client-side routing        |
| framer-motion        | 10.x    | Animations                 |
| lucide-react         | 0.303   | Icon library               |
| axios                | 1.x     | HTTP client                |
| react-hot-toast      | 2.x     | Toast notifications        |
| react-datepicker     | 4.x     | Date selection             |
| recharts             | 2.x     | Admin analytics charts     |
| @stripe/stripe-js    | 2.x     | Payment (Part 3)           |
| tailwindcss          | 3.x     | Utility CSS                |
| vite                 | 5.x     | Build tool                 |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

*Built with ❤️ | LuxeDrive © 2024*
