# 🚀 LuxeDrive — Complete Deployment Guide

## Architecture Overview

```
Browser → Vercel (React frontend)
              ↓ API calls
         Render (Node.js backend)
              ↓ Database
         MongoDB Atlas (cloud DB)
              ↓ Images
         Cloudinary (image CDN)
              ↓ Payments
         Stripe (payment gateway)
              ↓ Email
         Gmail SMTP / Mailgun
```

---

## Step 1 — MongoDB Atlas (Database)

1. Go to **https://cloud.mongodb.com** → Create account (free)
2. Create a new project: `LuxeDrive`
3. Create a free **M0 cluster** (Singapore region recommended for India)
4. Click **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` in the connection string
6. Set database name to `luxedrive`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/luxedrive?retryWrites=true&w=majority
   ```
7. In **Network Access** → Add IP Address → `0.0.0.0/0` (allow from anywhere for Render)

---

## Step 2 — Cloudinary (Image Uploads)

1. Go to **https://cloudinary.com** → Create free account
2. Go to **Dashboard** and note:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. These go into backend `.env` as `CLOUDINARY_CLOUD_NAME`, etc.

---

## Step 3 — Stripe (Payments)

1. Go to **https://dashboard.stripe.com** → Create account
2. Go to **Developers → API Keys**:
   - Copy `Publishable key` → goes in frontend `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy `Secret key` → goes in backend `.env` as `STRIPE_SECRET_KEY`
3. Set up webhook:
   - Go to **Developers → Webhooks → Add Endpoint**
   - URL: `https://your-backend.onrender.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy `Signing Secret` → goes in backend `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Step 4 — Email (Gmail App Password)

1. Go to **Google Account → Security → 2-Step Verification** (enable if not already)
2. Go to **App Passwords** → Select app: `Mail` → Device: `Other (LuxeDrive)`
3. Copy the 16-character app password
4. Use in backend `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=LuxeDrive <your@gmail.com>
   ```

---

## Step 5 — Deploy Backend to Render

1. Push your `backend/` folder to a GitHub repository
2. Go to **https://render.com** → New → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `luxedrive-api`
   - **Branch**: `main`
   - **Root Directory**: `backend` (if mono-repo)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Region**: Singapore
5. Add **Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_super_long_random_secret_here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=LuxeDrive <your@gmail.com>
   ADMIN_NAME=Admin
   ADMIN_EMAIL=admin@luxedrive.com
   ADMIN_PASSWORD=StrongPassword@123
   ```
6. Click **Create Web Service** → Wait for build (2–3 mins)
7. Your API will be at: `https://luxedrive-api.onrender.com`
8. Test: Visit `https://luxedrive-api.onrender.com/api/health`

### Seed the database (first time only)
```bash
# Locally (with production MONGODB_URI in .env):
cd backend
MONGODB_URI="mongodb+srv://..." node src/utils/seeder.js
```

---

## Step 6 — Deploy Frontend to Vercel

### Option A: Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# From the frontend/ directory
cd frontend

# Create production .env
cp .env.production.example .env.production.local
# Edit .env.production.local:
#   VITE_API_URL=https://luxedrive-api.onrender.com/api
#   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Deploy
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Add **Environment Variables**:
   ```
   VITE_API_URL = https://luxedrive-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
   ```
8. Click **Deploy**

Your site will be live at: `https://luxedrive.vercel.app`

---

## Step 7 — Update CORS

After getting your Vercel URL, update backend env:
```
FRONTEND_URL=https://luxedrive.vercel.app
```

Also update Stripe webhook URL to point to your Render domain.

---

## Step 8 — Final Checklist

```
☐ MongoDB Atlas connected + seeded
☐ Cloudinary configured (test by adding a car in admin panel)
☐ Stripe live keys set (test with Stripe test mode first!)
☐ Email notifications working (test booking confirmation)
☐ Backend health check: GET /api/health → 200 OK
☐ Frontend deployed to Vercel → can browse cars
☐ Auth flow working: signup → login → dashboard
☐ Booking flow: car detail → select dates → book → payment
☐ Admin panel: login as admin → view stats → add car → manage bookings
☐ CORS properly set to Vercel domain
☐ Stripe webhook pointing to Render URL
```

---

## Local Development (Quick Start)

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env
# Fill in .env (at minimum: MONGODB_URI and JWT_SECRET)
npm install
npm run seed    # seeds database with 8 cars + admin + demo user
npm run dev     # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already default)
npm install
npm run dev     # → http://localhost:3000
```

**Demo Credentials (after seeding):**
| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | admin@luxedrive.com    | Admin@123!    |
| User  | user@luxedrive.com     | password123   |

---

## Common Issues

| Issue | Fix |
|-------|-----|
| CORS error | Set `FRONTEND_URL` in backend env to your Vercel URL |
| 401 on all requests | Check `JWT_SECRET` is set and `VITE_API_URL` is correct |
| Images not uploading | Verify Cloudinary credentials and allowed file types |
| Stripe errors | Use test keys (`pk_test_`, `sk_test_`) first, then switch to live |
| Emails not sending | Enable "Less secure app access" or use Gmail App Password |
| Render cold starts | Free tier sleeps after 15min — upgrade to Starter ($7/mo) for always-on |
| MongoDB connection refused | Add `0.0.0.0/0` to Atlas Network Access |

---

*LuxeDrive © 2024 — Built with React + Node.js + MongoDB*
