# StayScape — REST API Reference Manual

Base URL: `http://localhost:5000/api` (Development)

All requests and responses use standard `application/json` payloads. Authentication is carried via secure HTTP-Only cookies named `token`, or alternatively through `Authorization: Bearer <token>` headers.

---

## 1. Response Envelope Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## 2. Health & Utility APIs

### `GET /health`
Returns the operational status of the StayScape API.
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "StayScape API is running"
  }
  ```

---

## 3. Authentication APIs (`/auth`)

### `POST /auth/register`
Creates a new user account.
- **Access:** Public (Rate-limited: 30 requests / 15 mins)
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123",
    "role": "guest" // Optional: "guest" (default) or "host"
  }
  ```
- **Response (201 Created):** Sets HTTP-only `token` cookie and returns user object.

### `POST /auth/login`
Authenticates existing user.
- **Access:** Public (Rate-limited: 30 requests / 15 mins)
- **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (200 OK):** Sets HTTP-only `token` cookie and returns user object.

### `POST /auth/logout`
Terminates the user session.
- **Access:** Public
- **Response (200 OK):** Clears the `token` cookie.

### `GET /auth/me`
Fetches the currently authenticated user session.
- **Access:** Private (Requires auth cookie or Bearer token)
- **Response (200 OK):** Returns `data.user`.

---

## 4. User Profile APIs (`/users`)

### `GET /users/profile`
Fetches authenticated user's profile details.
- **Access:** Private

### `PUT /users/profile`
Updates user details.
- **Access:** Private
- **Body:**
  ```json
  {
    "name": "Jane Smith",
    "phone": "+1 555 123 4567",
    "avatar": "https://example.com/avatar.jpg",
    "role": "host" // Optional: allows upgrading account from guest to host
  }
  ```

### `PUT /users/change-password`
Changes account password.
- **Access:** Private
- **Body:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```

---

## 5. Property Listings APIs (`/listings`)

### `GET /listings`
Retrieves paginated and filtered property listings.
- **Access:** Public
- **Query Parameters:**
  - `keyword`: Search title, description, and city.
  - `city`: Exact or regex city filter.
  - `propertyType`: e.g. `apartment`, `villa`, `cabin`, `house`.
  - `minPrice` / `maxPrice`: Numerical price per night bounds.
  - `guests`: Minimum guest capacity required.
  - `sort`: e.g. `pricePerNight`, `-pricePerNight`, `-averageRating`, `-createdAt`.
  - `page`: Page number (default: 1).
  - `limit`: Items per page (default: 12).
- **Response (200 OK):** Returns `data.listings` and `data.pagination`.

### `GET /listings/:id`
Retrieves a single listing with populated host details and reviews.
- **Access:** Public

### `GET /listings/my-listings`
Retrieves all listings owned by the logged-in host.
- **Access:** Private (Host or Admin only)

### `POST /listings`
Publishes a new property listing.
- **Access:** Private (Host or Admin only)
- **Body:**
  ```json
  {
    "title": "Oceanfront Luxury Villa",
    "description": "Breathtaking views with private pool and beach access.",
    "location": {
      "address": "100 Ocean Blvd",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "latitude": 25.7617,
      "longitude": -80.1918
    },
    "propertyType": "villa",
    "pricePerNight": 350,
    "maxGuests": 8,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 3,
    "amenities": ["Wifi", "Kitchen", "Pool", "Air conditioning"],
    "images": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]
  }
  ```

### `PUT /listings/:id`
Updates an existing listing.
- **Access:** Private (Listing Owner Host or Admin only)

### `DELETE /listings/:id`
Deletes a listing and its reviews.
- **Access:** Private (Listing Owner Host or Admin only)

---

## 6. Booking APIs (`/bookings`)

### `GET /bookings/availability/:listingId`
Fetches booked date ranges and tests specific date availability.
- **Access:** Public
- **Query Parameters (Optional):**
  - `checkIn`: `YYYY-MM-DD`
  - `checkOut`: `YYYY-MM-DD`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "listingId": "65b...",
      "bookedRanges": [
        {
          "checkIn": "2026-12-01T00:00:00.000Z",
          "checkOut": "2026-12-05T00:00:00.000Z",
          "status": "confirmed"
        }
      ],
      "isAvailable": true
    }
  }
  ```

### `POST /bookings`
Creates a new property reservation.
- **Access:** Private (Authenticated Guest)
- **Double Booking Protection:** Overlap formula $\text{newCheckIn} < \text{existingCheckOut} \land \text{newCheckOut} > \text{existingCheckIn}$.
- **Body:**
  ```json
  {
    "listing": "65b...",
    "checkIn": "2026-12-10",
    "checkOut": "2026-12-15",
    "guests": 2,
    "payNow": false // If true, sets paymentStatus to 'paid'; if false, 'unpaid'
  }
  ```

### `PUT /bookings/:id/pay`
Simulates payment confirmation for an unpaid reservation.
- **Access:** Private (Guest who booked)

### `GET /bookings/my-bookings`
Lists all reservations made by the logged-in guest.
- **Access:** Private (Guest)

### `GET /bookings/host-bookings`
Lists all reservations placed on properties owned by the host.
- **Access:** Private (Host or Admin only)

### `GET /bookings/:id`
Retrieves details of a single booking.
- **Access:** Private (Guest, Host of listing, or Admin)

### `PUT /bookings/:id/cancel`
Cancels an eligible booking and refunds if previously paid.
- **Access:** Private (Guest, Host of listing, or Admin)

---

## 7. Review APIs (`/reviews`)

### `GET /reviews/listing/:listingId`
Lists all reviews for a property.
- **Access:** Public

### `POST /reviews`
Submits a review for a completed stay.
- **Access:** Private (Guest with a completed stay)
- **Constraint:** Maximum 1 review per booking. Automatically recalculates `averageRating` and `totalReviews`.
- **Body:**
  ```json
  {
    "listing": "65b...",
    "booking": "65c...",
    "rating": 5,
    "comment": "Outstanding stay! Clean, spacious, and lovely host."
  }
  ```

### `DELETE /reviews/:id`
Deletes a review and updates listing ratings.
- **Access:** Private (Review Author or Admin only)

---

## 8. Media Upload APIs (`/upload`)

### `POST /upload`
Uploads a single image. Stores in Cloudinary when configured; falls back to local `/uploads` directory otherwise.
- **Access:** Private
- **Payload:** `multipart/form-data` with key `image` (max 5MB, JPEG/PNG/WEBP).

### `POST /upload/multiple`
Uploads up to 10 images simultaneously.
- **Access:** Private
- **Payload:** `multipart/form-data` with key `images`.

---

## 9. Platform Administration APIs (`/admin`)

*Strictly restricted to users with `role: 'admin'`.*

### `GET /admin/stats`
Returns system metrics: total users, listings, bookings, reviews, paid revenue volume, and recent activity.

### `GET /admin/users`
Lists all registered users with query filters (`role`, `search`, `page`, `limit`).

### `PUT /admin/users/:id/role`
Updates a user's role (`guest`, `host`, `admin`).

### `DELETE /admin/users/:id`
Permanently deletes a user account.

### `GET /admin/listings`
Lists all property listings across the platform.

### `GET /admin/bookings`
Lists all bookings across all hosts and guests.
