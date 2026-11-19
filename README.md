# StayScape — Full Stack Airbnb Clone

![StayScape Banner](https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 1. Project Name & Introduction

**StayScape** is a full-stack vacation rental, boutique stay, and accommodation booking web platform inspired by Airbnb. Built to production-grade standards, StayScape provides a clean, responsive user experience for guests looking to discover unique travel stays, while offering property hosts and administrators full lifecycle management and financial clarity.

---

## 2. Project Overview

StayScape was built with engineering rigour:
* **Decoupled Architecture:** React 18 single-page application built on Vite communicating via REST APIs with an Express.js backend.
* **Security-First Approach:** Stateless JWT authentication delivered exclusively inside HTTP-only, SameSite strict cookies, protected by Helmet and rate limiting.
* **Deterministic Concurrency:** Robust mathematical overlap checks paired with MongoDB transactions to prevent double-booking anomalies under concurrent user requests.
* **Hybrid Cloud Readiness:** Resilient cloud integrations with graceful fallbacks (Cloudinary image storage falling back to local disk storage, and Google Maps falling back to OpenStreetMap).

---

## 3. Key Features

- **Guest Experience:**
  - Dynamic home page featuring categorized listings (Beachfront, Cabins, Iconic Cities, Lakefront, Desert, Amazing Pools).
  - Multi-parameter search synchronized with URL query params (city, category, guest capacity, price range).
  - Detailed property presentation with multi-photo gallery, amenities list, host bio, and interactive location map.
  - Interactive reservation calendar dynamically locking out already-booked dates.
  - Guest reservation manager with instant payment simulation (`unpaid` to `paid` status).
  - Verified reviews: Rating submission gated strictly to guests with completed bookings.

- **Host Capabilities:**
  - Property creation modal with multi-image uploads and client-side photo previews.
  - Host analytics dashboard displaying total listings, active reservations, and occupancy.
  - **Revenue segregation:** Explicitly separates **paid revenue** from **pending unpaid revenue** (e.g. pay on arrival).
  - Full CRUD operations for host properties and incoming reservation approvals.

- **Platform Administration:**
  - Protected admin console (`/admin/dashboard`) with RBAC gating (`requireAdmin`).
  - System-wide statistics: Platform user count, total listings, all active reservations, and total platform revenue.
  - User moderation: Role elevation/demotion (`guest`, `host`, `admin`) and listing status toggling (`isActive`).

---

## 4. Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Declarative component hierarchy and hooks |
| **Build Tool** | Vite 6 | Sub-second HMR and production bundle optimization |
| **Styling** | Tailwind CSS 3.4 | Mobile-first utilities with custom Airbnb coral (`#FF385C`) |
| **Routing** | React Router DOM v7 | Client-side routing, protected routes, and query syncing |
| **HTTP Client** | Axios | Configured with `withCredentials: true` and interceptors |
| **UI Components** | React Datepicker, Framer Motion, React Icons, React Hot Toast | Accessible date selection and micro-animations |
| **Backend Runtime** | Node.js (v18+) & Express.js | REST API routing and middleware pipeline |
| **Database & ODM** | MongoDB & Mongoose v8 | Schema models, compound indexing, and aggregation pipelines |
| **Authentication** | JWT & bcryptjs | HTTP-only cookie session handling and salt hashing |
| **Security** | Helmet, CORS, Express-Rate-Limit | Header hardening, origin white-listing, and brute-force mitigation |
| **Media Handling** | Multer & Cloudinary | Multi-image MIME validation with local disk fallback |

---

## 5. Screenshots

> *Placeholder: Screenshots of the application interface will be displayed below.*

| Home Page & Categories | Property Details & Booking |
| :---: | :---: |
| ![Home Screenshot](https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80) | ![Details Screenshot](https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80) |
| *Browse curated stays by category* | *Real-time availability and dynamic pricing* |

| Host Revenue Dashboard | Admin Management Console |
| :---: | :---: |
| ![Host Dashboard](https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80) | ![Admin Console](https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80) |
| *Segregated paid and pending revenue* | *Platform moderation and metrics* |

---

## 6. Application Architecture

StayScape uses a decoupled, three-tier architecture:

```
[ Client Browser: React 18 / Vite SPA ]
                  │
                  ▼  (HTTPS / HTTP-Only Cookies / JSON)
[ Express.js REST API Layer (Node.js) ]
  ├── Helmet & CORS Security
  ├── Rate Limiter
  ├── Authentication & Authorization Middleware
  ├── Business Logic Controllers
  └── Model Validations
                  │
                  ▼  (Mongoose ODM)
[ MongoDB Atlas / Local Replica Set ]
```

---

## 7. Folder Structure

```
Airbnb/
├── backend/
│   ├── src/
│   │   ├── config/             # Database & Cloudinary config
│   │   ├── controllers/        # Route business controllers
│   │   ├── middleware/         # Auth, RBAC, error & upload middlewares
│   │   ├── models/             # Mongoose schemas (User, Listing, Booking, Review)
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # Token generator & API query features
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── uploads/                # Local media fallback storage
│   ├── seed.js                 # Database seeder script
│   ├── test_runner.js          # Unit & integration test suite
│   ├── e2e_workflow_audit.js   # 7-workflow end-to-end audit
│   ├── render.yaml             # Render deployment blueprint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout, listings, booking & common components
│   │   ├── context/            # AuthContext & session state
│   │   ├── pages/              # Application pages
│   │   ├── services/           # Axios API service callers
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # React root mount
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   ├── vite.config.js          # Vite config & chunking
│   ├── .env.example
│   └── package.json
├── docs/                       # Comprehensive documentation
│   ├── PROJECT_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
├── .gitignore
├── package.json                # Root orchestration package.json
└── README.md
```

---

## 8. Installation Instructions (Windows & Cross-Platform)

### Prerequisites:
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

### Step 1: Clone Repository
```powershell
git clone https://github.com/sneha-raj51/Stayscape-Airbnb.git
cd Stayscape-Airbnb
```

### Step 2: Install All Dependencies
Run from the root project directory:
```powershell
npm run install:all
```
*(This installs dependencies for both backend and frontend automatically).*

---

## 9. MongoDB Configuration

1. **Local MongoDB:** Ensure your MongoDB service is running:
   ```powershell
   # MongoDB URI
   MONGODB_URI=mongodb://localhost:27017/stayscape
   ```
2. **MongoDB Atlas (Cloud):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), add your IP address to Network Access, and configure the URI in `backend/.env`.

---

## 10. Environment Variables

### Backend Configuration (`backend/.env`):
Create `backend/.env` by copying `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stayscape
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional - falls back to local disk if blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend Configuration (`frontend/.env`):
Create `frontend/.env` by copying `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000

# Google Maps (Optional - falls back to OpenStreetMap if blank)
VITE_GOOGLE_MAPS_API_KEY=
```

---

## 11. Frontend Setup

To start only the frontend in development mode:
```powershell
npm run dev:frontend
# Runs at http://localhost:3000
```

To build the frontend for production:
```powershell
npm run build:frontend
```

---

## 12. Backend Setup & Seeder

To seed the database with initial luxury listings and demo accounts:
```powershell
npm run seed
```

To start the backend in development mode with nodemon:
```powershell
npm run dev:backend
# Runs at http://localhost:5000
```

---

## 13. API Documentation Summary

Base URL: `http://localhost:5000/api`

| Module | Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Server health check | Public |
| **Auth** | `POST` | `/auth/register` | Register guest or host | Public |
| **Auth** | `POST` | `/auth/login` | Login and set HTTP-only cookie | Public |
| **Auth** | `POST` | `/auth/logout` | Terminate session and clear cookie | Public |
| **Auth** | `GET` | `/auth/me` | Fetch active user session | Private |
| **Listings**| `GET` | `/listings` | Query, filter, search listings | Public |
| **Listings**| `GET` | `/listings/:id` | Fetch listing details | Public |
| **Listings**| `POST` | `/listings` | Create property listing | Host/Admin |
| **Listings**| `PUT` | `/listings/:id` | Update property | Owner/Admin |
| **Listings**| `DELETE`| `/listings/:id` | Delete property | Owner/Admin |
| **Bookings**| `GET` | `/bookings/availability/:listingId` | Returns booked intervals | Public |
| **Bookings**| `POST` | `/bookings` | Book stay with overlap protection | Guest |
| **Bookings**| `PUT` | `/bookings/:id/pay` | Simulate payment confirmation | Guest |
| **Bookings**| `GET` | `/bookings/my-bookings` | Guest bookings history | Guest |
| **Bookings**| `GET` | `/bookings/host-bookings` | Host incoming bookings | Host/Admin |
| **Bookings**| `PUT` | `/bookings/:id/cancel` | Cancel booking & trigger refund | Guest/Host/Admin |
| **Reviews** | `GET` | `/reviews/listing/:id` | Listing reviews | Public |
| **Reviews** | `POST` | `/reviews` | Verified review submission | Guest |
| **Admin** | `GET` | `/admin/stats` | Platform aggregates and revenue | Admin |
| **Admin** | `GET` | `/admin/users` | Manage registered accounts | Admin |
| **Admin** | `PUT` | `/admin/users/:id/role` | Update user authorization role | Admin |

*For complete payload and schema documentation, see [docs/API_DOCUMENTATION.md](file:///e:/Airbnb/docs/API_DOCUMENTATION.md).*

---

## 14. Authentication Workflow

1. Guest registers or logs in via `/api/auth/login`.
2. The server authenticates password using `bcrypt.compare()`.
3. A signed JSON Web Token is packaged into a secure, HTTP-only cookie (`token`).
4. The client's browser attaches the cookie automatically with `withCredentials: true`.
5. Protected endpoints verify authorization via `authMiddleware.protect` and check role requirements with `authMiddleware.authorize('host', 'admin')`.

---

## 15. Booking Workflow

```
[ Guest Selects Check-In & Check-Out ]
                 │
                 ▼
[ React DatePicker Excludes Booked Spans ]
                 │
                 ▼
[ POST /api/bookings ]
                 │
                 ├── 1. Validates: checkIn < checkOut & checkIn >= today
                 ├── 2. Validates: guests <= listing.maxGuests
                 ├── 3. Computes: totalNights & totalPrice server-side
                 ├── 4. Overlap Query: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
                 └── 5. Saves booking with status: 'confirmed', paymentStatus: 'unpaid'
                 │
                 ▼
[ Guest Views Reservation in My Bookings ]
                 │
                 ▼
[ PUT /api/bookings/:id/pay (Payment Simulation) ]
                 └── Transitions paymentStatus: 'paid'
```

---

## 16. Double-Booking Prevention

Double-booking conflicts are defined mathematically by the interval overlap theorem:
$$\text{newCheckIn} < \text{existingCheckOut} \quad \land \quad \text{newCheckOut} > \text{existingCheckIn}$$

- **Query Isolation:** Before confirming an insert, the backend executes an atomic collision check filtering against all active bookings (`status: { $in: ['confirmed', 'pending'] }`).
- **Database Transactions:** On replica sets (including MongoDB Atlas), inserts run within a `session.withTransaction()` context.
- **Compound Indexing:** `Booking` collection maintains `{ listing: 1, status: 1, checkIn: 1, checkOut: 1 }` for index-accelerated conflict detection.

---

## 17. Maps Integration

StayScape incorporates a resilient two-tier mapping solution:
- **Google Maps:** When `VITE_GOOGLE_MAPS_API_KEY` is provided, properties render via Google Maps embeds.
- **OpenStreetMap Fallback:** If no API key is configured, `MapComponent.jsx` renders an interactive OpenStreetMap iframe using the property's exact `latitude` and `longitude`, accompanied by a direct **"Get Directions on Google Maps"** navigation link.

---

## 18. Reviews & Ratings System

- **Gated Eligibility:** Only guests who have completed a stay at the listing can leave a review.
- **One Review Per Booking:** Enforced via a unique compound index on `{ booking: 1 }`.
- **Automatic Rating Recalculation:** A static Mongoose aggregation pipeline (`Review.calculateAverageRating`) calculates the arithmetic mean of all reviews and updates `averageRating` and `totalReviews` on the `Listing` document immediately.

---

## 19. Deployment Instructions

### Frontend (Vercel):
The repository includes [frontend/vercel.json](file:///e:/Airbnb/frontend/vercel.json) pre-configured with SPA rewrites.
1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
4. Deploy.

### Backend (Render):
The repository includes [backend/render.yaml](file:///e:/Airbnb/backend/render.yaml) pre-configured with the service specification.
1. Create a new Web Service on Render from your repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend.vercel.app`.

---

## 20. Future Improvements

- [ ] Real-time in-app host-guest chat using WebSockets (Socket.io).
- [ ] Production Stripe checkout session integration with webhook event handling.
- [ ] Social OAuth authentication (Google & GitHub).
- [ ] User wishlist and saved collections sharing.
- [ ] Multi-currency conversion via real-time exchange rates.
