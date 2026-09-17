# 🎓 Campus Resale & Purchase

> **A campus-exclusive, multi-tenant marketplace platform where verified students can buy, sell, and give away items for free — strictly isolated by campus at the backend database level.**

---

## 🌟 Key Features

### 1. 🛡️ Strict Campus-Level Isolation
- **Domain Verification:** Students register exclusively using official college email addresses (e.g. `@iitb.ac.in`, `@nitk.edu.in`). Public emails (`@gmail.com`) are rejected.
- **Backend Enforced Data Isolation:** User authentication tokens (`JWT`) permanently bind the student's verified `campusId`. Even if an API request is manipulated, students cannot view, query, or message listings from other colleges.
- **Multi-Tenant Foundation:** Dynamic `Campus` model allowing platform administrators to onboard any number of institutions without code refactoring.

### 2. 🎁 ₹0 "Free Item" System
- Dedicated one-click **"Give away for FREE (₹0)"** feature on listing creation.
- Renders eye-catching emerald badges and custom marketplace filters for junior student giveaways and hostel hand-me-downs.

### 3. 💬 Real-Time Internal Campus Messaging
- Direct peer-to-peer chat between verified students without exposing personal phone numbers or hostel room details.
- Real-time event broadcasting powered by Socket.IO rooms.

### 4. 📍 Safe Campus Meeting Points
- Eliminates private address sharing by requiring public on-campus landmarks (e.g., *"Central Library Gate 2"*, *"Hostel 12 Canteen"*).

### 5. 👑 Comprehensive Admin Management Panel
- Platform KPI analytics: Total students, active campuses, active listings, items sold, free items, and pending reports.
- Student suspension/reactivation actions.
- Cross-campus listing auditing and immediate removal.
- Incident report resolution queues.
- Dynamic campus creation and email domain authorization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, React Router v6, Axios, Zustand / React Context, React Hook Form, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, REST API, JWT (httpOnly cookie + Bearer), bcryptjs, Nodemailer, Express Rate Limit, Express Validator |
| **Real-time** | Socket.IO |
| **Database** | MongoDB & Mongoose (with compound & text indexes) |
| **Cloud Storage** | Cloudinary (with memory-buffer streaming & dev fallback) |

---

## 📁 Project Architecture

```
campus-resale/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # ProductCard, RouteGuards, ErrorBoundary
│   │   ├── context/            # AuthContext (JWT & state management)
│   │   ├── layouts/            # MainLayout, AuthLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Login, Register, VerifyEmail, Forgot/Reset
│   │   │   ├── student/        # Marketplace, ListingDetail, SellItem, EditListing, MyListings, SavedItems, Messages, Profile
│   │   │   └── admin/          # Dashboard, Users, Listings, Reports, Campuses
│   │   ├── services/           # Axios service clients (api, auth, listing, social, admin)
│   │   └── utils/              # formatters, helpers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                     # Express REST API & Real-time Server
    ├── config/                 # db, cloudinary, email
    ├── controllers/            # auth, listing, user, saved, message, report, admin
    ├── middleware/             # authenticate, campusIsolation, authorize, uploadMiddleware, rateLimiter, validator, errorHandler
    ├── models/                 # Campus, User, Listing, Conversation, Message, SavedItem, Report
    ├── routes/                 # Express route definitions
    ├── scripts/                # seed.js (automated database population)
    ├── services/               # tokenService, emailService, cloudinaryService
    ├── socket/                 # Socket.IO chat room handlers
    └── server.js               # Main HTTP & WebSocket server entry point
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://localhost:27017` OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

---

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment variables
cp .env.example .env
```

Open `server/.env` and configure your credentials:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/campus-resale
JWT_SECRET=dev_super_secret_jwt_key_min32chars_for_security
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Run Database Seed Script
Populates institutions (IIT Bombay, NITK), demo students, and sample listings:
```bash
npm run seed
```

#### Start Backend Server
```bash
npm run dev
# Server will run on http://localhost:5000
```

---

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start Vite dev server
npm run dev
# App will open on http://localhost:5173
```

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Campus | Notes |
|---|---|---|---|---|
| **Platform Admin** | `admin@campusresale.com` | `Password123!` | System | Has full access to `/admin` dashboard |
| **Student 1** | `harsh.p@iitb.ac.in` | `Password123!` | IIT Bombay | Has 2 listings (Calculator & Free Books) |
| **Student 2** | `ananya.s@iitb.ac.in` | `Password123!` | IIT Bombay | Has 2 listings (Bicycle & Study Lamp) |
| **Student 3** | `rohan.rao@nitk.edu.in`| `Password123!` | NITK Surathkal | Isolated from IIT Bombay listings |

---

## 🛡️ Demonstrating Campus Isolation

1. Log in as `harsh.p@iitb.ac.in` (IIT Bombay student).
   - Go to `/marketplace` — you will see the IIT Bombay listings.
2. In an incognito window, log in as `rohan.rao@nitk.edu.in` (NITK student).
   - Go to `/marketplace` — you will **only** see NITK listings.
   - Even if you attempt to paste `/listings/<IITB_ID>` into the browser URL bar, the backend will return a `403 Forbidden` response!

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)
1. Import `client` directory to Vercel.
2. Set Environment Variables:
   - `VITE_API_URL=https://your-backend.railway.app/api`
   - `VITE_SOCKET_URL=https://your-backend.railway.app`
3. Build command: `npm run build`, Output directory: `dist`.

### Backend (Railway / Render / DigitalOcean)
1. Deploy `server` directory as a Node service.
2. Set Production Environment Variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-app.vercel.app`
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=your_high_entropy_secret_key`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `EMAIL_USER`, `EMAIL_PASSWORD`
3. Start command: `npm start`.
