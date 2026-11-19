# StayScape - Full Stack Airbnb Clone (Backend API)

Welcome to **StayScape**, a scalable, production-grade REST API backend foundation for a full-stack Airbnb clone. StayScape handles secure authentication, user roles, property listings, booking management with overlap conflict resolution, rating calculations, and photo uploads.

---

## 1. Technology Stack

- **Runtime & Framework:** Node.js (v18+) & Express.js
- **Database & ODM:** MongoDB & Mongoose
- **Authentication & Security:** 
  - JSON Web Tokens (JWT) stored in HTTP-Only Cookies
  - Password hashing with `bcryptjs`
  - Helmet for secure HTTP headers
  - CORS with configurable origins and credentials
  - Express Rate Limiting against brute-force authentication attacks
- **Validation & Parsing:** 
  - `express-validator` for structured schema validation
  - `cookie-parser` for secure cookie extraction
  - Body parsers with payload size restrictions (10MB)
- **Media Uploads:** `multer` with file extension and MIME type validation

---

## 2. Architecture & Directory Structure

The backend follows an enterprise-grade modular MVC pattern:

```
Airbnb/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, login, logout, me
│   │   │   ├── userController.js     # User profile and password changes
│   │   │   ├── listingController.js  # Listing CRUD, search, filter, pagination
│   │   │   ├── bookingController.js  # Booking creation, overlap check, cancellation
│   │   │   └── reviewController.js   # Review submission and rating aggregation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   │   ├── errorMiddleware.js    # 404 handler, error formatter, validator
│   │   │   └── uploadMiddleware.js   # Multer file upload handling
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt pre-save hook
│   │   │   ├── Listing.js            # Listing schema with compound indexes
│   │   │   ├── Booking.js            # Booking schema with date validation
│   │   │   └── Review.js             # Review schema with rating recalculation
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Authentication endpoints
│   │   │   ├── userRoutes.js         # Profile management endpoints
│   │   │   ├── listingRoutes.js      # Listing endpoints
│   │   │   ├── bookingRoutes.js      # Booking endpoints
│   │   │   └── reviewRoutes.js       # Review endpoints
│   │   ├── utils/
│   │   │   ├── generateToken.js      # JWT token & HTTP-only cookie helper
│   │   │   └── apiFeatures.js        # Search, filter, sort & pagination helper
│   │   ├── app.js                    # Express app configuration & middlewares
│   │   └── server.js                 # HTTP listener & process event handlers
│   ├── uploads/                      # Uploaded images directory
│   ├── test_runner.js                # Automated test suite
│   ├── .env.example                  # Environment variable template
│   ├── .gitignore                    # Git ignore file
│   ├── package.json                  # Dependencies & scripts
│   └── README.md                     # Documentation
├── package.json                      # Root workspace scripts
└── README.md
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://localhost:27017/stayscape` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_jwt_key` |
| `JWT_EXPIRE` | JWT duration token lifespan | `7d` |
| `CLIENT_URL` | Frontend URL allowed by CORS | `http://localhost:3000` |

---

## 4. Installation & Running the Backend

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB instance (local or MongoDB Atlas connection string)

### Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Run automated verification tests:**
   ```bash
   npm test
   ```

3. **Start development server (with nodemon):**
   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

5. **Verify API health:**
   Open [http://localhost:5000/api/health](http://localhost:5000/api/health) in your browser. You will receive:
   ```json
   {
     "success": true,
     "message": "StayScape API is running"
   }
   ```

---

## 5. Authentication & Authorization

StayScape uses **JSON Web Tokens (JWT)** transmitted via **HTTP-Only cookies** (`token`).
- **HTTP-Only Cookies:** Prevents cross-site scripting (XSS) attacks from stealing tokens.
- **Authorization Header Support:** Additionally accepts `Authorization: Bearer <token>` for flexible mobile or API client usage.
- **Role-Based Access Control (RBAC):**
  - `guest`: Can browse listings, create bookings, view own bookings, and post reviews on completed stays.
  - `host`: Inherits all guest abilities, plus listing creation, editing, deleting, and viewing bookings placed on host properties.
  - `admin`: Full administrative access to manage all listings, bookings, and reviews.

---

## 6. API Endpoints

All responses follow a consistent envelope structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Health Check
- `GET /api/health` — Check server status (Public)

---

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new guest or host user |
| `POST` | `/api/auth/login` | Public | Log in with email and password |
| `POST` | `/api/auth/logout` | Public | Log out and clear authentication cookie |
| `GET` | `/api/auth/me` | Private | Get currently authenticated user data |

---

### User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Get user profile details |
| `PUT` | `/api/users/profile` | Private | Update user profile (name, phone, avatar) |
| `PUT` | `/api/users/change-password` | Private | Change password verifying old password |

---

### Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Public | Get all active listings with search, filter, sort & pagination |
| `GET` | `/api/listings/:id` | Public | Get listing details by ID (with host & reviews) |
| `GET` | `/api/listings/my-listings` | Private (Host/Admin) | Get all listings created by current host |
| `POST` | `/api/listings` | Private (Host/Admin) | Create a new property listing |
| `PUT` | `/api/listings/:id` | Private (Owner/Admin) | Update listing information |
| `DELETE` | `/api/listings/:id` | Private (Owner/Admin) | Delete listing and related reviews |

#### Query Parameters for `GET /api/listings`:
- `keyword`: Search across title, description, and location (`/api/listings?keyword=beach`)
- `city`: Filter by city (`/api/listings?city=Miami`)
- `propertyType`: Filter by property type (`/api/listings?propertyType=villa`)
- `minPrice` / `maxPrice`: Filter by price range (`/api/listings?minPrice=100&maxPrice=300`)
- `guests`: Filter by minimum guest capacity (`/api/listings?guests=4`)
- `sort`: Sort by fields (`/api/listings?sort=pricePerNight` or `sort=-averageRating`)
- `page` & `limit`: Pagination parameters (`/api/listings?page=1&limit=12`)

---

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | Create booking (overlap check, server-side pricing) |
| `GET` | `/api/bookings/my-bookings` | Private | Get bookings made by logged-in guest |
| `GET` | `/api/bookings/host-bookings` | Private (Host/Admin) | Get bookings made on current host's properties |
| `GET` | `/api/bookings/:id` | Private (Guest/Host/Admin)| Get single booking details |
| `PUT` | `/api/bookings/:id/cancel` | Private (Guest/Host/Admin)| Cancel a confirmed booking |

#### Overlap Prevention Logic:
Before creating any booking, StayScape verifies that no confirmed/pending booking exists where:
$$\text{newCheckIn} < \text{existingCheckOut} \quad \text{AND} \quad \text{newCheckOut} > \text{existingCheckIn}$$
This guarantees double bookings cannot occur. Furthermore, pricing is strictly calculated on the server ($totalNights \times pricePerNight$), ignoring any client-sent pricing.

---

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Private | Submit review for a completed stay |
| `GET` | `/api/reviews/listing/:listingId` | Public | Get all reviews for a listing |
| `DELETE` | `/api/reviews/:id` | Private (Author/Admin) | Delete a review and trigger rating update |

#### Rating Aggregation:
Whenever a review is created or deleted, a MongoDB aggregation pipeline automatically updates `averageRating` and `totalReviews` on the corresponding `Listing` document.

---

## 7. Security Highlights

1. **Password Safety:** Passwords are never returned in queries (`select: false` on schema, explicit omission in `toJSON`).
2. **Brute Force Protection:** Authentication endpoints are rate-limited to 30 requests per 15 minutes per IP.
3. **Payload Limits:** Request bodies are restricted to a maximum of 10MB to defend against payload exhaustion attacks.
4. **Header Hardening:** Helmet automatically sets secure headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
5. **No Hardcoded Secrets:** All credentials, JWT secrets, and ports are read from environment variables.
