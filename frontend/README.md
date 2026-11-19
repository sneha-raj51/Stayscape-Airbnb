# StayScape - Full Stack Airbnb Clone (Frontend)

StayScape is a travel and accommodation booking web application inspired by Airbnb. It is built with React 18, Vite, Tailwind CSS, Framer Motion, and React Router 7, connecting to the Express & MongoDB REST API.

---

## 1. Technology Stack

- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS with custom Airbnb brand color palette (`#FF385C`), rounded aesthetic (`rounded-3xl`), and subtle elevation shadows.
- **Routing:** React Router DOM (v7)
- **HTTP Client:** Axios with `withCredentials: true` for HTTP-only cookie session authentication.
- **Notifications:** React Hot Toast
- **Date Picking:** React Datepicker
- **Icons:** React Icons (Feather, Material Design, Tabler Icons)
- **Animations:** Framer Motion

---

## 2. Directory Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MapComponent.jsx     # Google Maps & graceful OpenStreetMap fallback
│   │   │   ├── ProtectedRoute.jsx   # Route guard supporting role authorization
│   │   │   └── SkeletonCard.jsx     # Pulse loading skeletons
│   │   ├── layout/
│   │   │   ├── Navbar.jsx           # Responsive header with auth state & user menu
│   │   │   └── Footer.jsx           # Comprehensive footer with links & currency
│   │   ├── listings/
│   │   │   ├── CategoryFilter.jsx   # Category carousel filtering backend data
│   │   │   ├── ListingCard.jsx      # Property card with image, rating, price
│   │   │   ├── ReviewsSection.jsx   # Ratings, reviews & review submission
│   │   │   └── SearchBar.jsx        # Location, dates, and guest capacity picker
│   │   └── booking/
│   │       └── BookingCard.jsx      # Sticky booking widget with server pricing
│   ├── context/
│   │   └── AuthContext.jsx          # User state management via HTTP-only cookies
│   ├── pages/
│   │   ├── HomePage.jsx             # Hero, search, categories, destinations
│   │   ├── ListingsPage.jsx         # Search, filters, sorting & pagination
│   │   ├── ListingDetailsPage.jsx   # Gallery, description, amenities, reviews, map
│   │   ├── LoginPage.jsx            # Authentication form with remember me
│   │   ├── RegisterPage.jsx         # Registration supporting Guest & Host roles
│   │   ├── ProfilePage.jsx          # Edit details, upload avatar, change password
│   │   ├── MyBookingsPage.jsx       # Guest reservations with cancellation action
│   │   ├── HostDashboardPage.jsx    # Host portfolio metrics, revenue & arrivals
│   │   ├── HostListingsPage.jsx     # Host listing management (Create, Edit, Delete)
│   │   └── NotFoundPage.jsx         # 404 handler
│   ├── services/
│   │   ├── api.js                   # Centralized Axios client with error interceptor
│   │   ├── authService.js           # Register, login, logout, getMe
│   │   ├── listingService.js        # Listings CRUD & search/filter API
│   │   ├── bookingService.js        # Bookings creation, history & cancellation
│   │   ├── reviewService.js         # Reviews fetch, submit & delete API
│   │   ├── userService.js           # User profile & password update
│   │   └── uploadService.js         # Media file upload to backend
│   ├── styles/
│   │   └── index.css                # Tailwind directives & datepicker custom styles
│   ├── App.jsx                      # Route definitions & global Toast provider
│   └── main.jsx                     # Application entry point
├── .env.example                     # Environment template
├── .env                             # Local development configuration
├── index.html                       # HTML5 template with Plus Jakarta Sans font
├── tailwind.config.js               # Theme configuration
├── vite.config.js                   # Vite configuration with chunk splitting
└── package.json                     # Dependencies & build scripts
```

---

## 3. Environment Variables

Create `.env` inside `frontend/`:

```env
# Backend REST API Base URL
VITE_API_URL=http://localhost:5000

# Google Maps API Key (Optional - graceful OpenStreetMap fallback provided if blank)
VITE_GOOGLE_MAPS_API_KEY=
```

---

## 4. Getting Started

### Development Mode

1. Ensure the backend is running on `http://localhost:5000`:
   ```bash
   cd backend
   npm run dev
   ```

2. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
cd frontend
npm run build
```

---

## 5. Key Features

- **Responsive Airbnb Interface:** Crafted with warm neutral backgrounds, coral accent (`#FF385C`), and micro-interactions.
- **Real Backend Integration:** Directly connects to existing MongoDB models and REST controllers. No mock data substitutes.
- **Session Auth with Cookies:** Uses HTTP-only cookies; passwords are never placed in local storage.
- **Interactive Search & Filtering:** Filter by city, property type, price range, and guest capacity.
- **Overlap-Safe Reservation:** Server-side date overlap verification and automated pricing calculation.
- **Host Management:** Dedicated host dashboard with portfolio statistics and an interactive listing editor supporting image file uploads.
- **Location Map Support:** Embeds Google Maps when an API key is provided, or provides an interactive OpenStreetMap view with instant driving directions.
