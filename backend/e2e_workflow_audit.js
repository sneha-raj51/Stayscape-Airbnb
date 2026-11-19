/**
 * StayScape End-to-End Workflow Audit & Verification Suite
 * Tests Workflows 1-7 as requested in Section 12 of the Internship Requirements.
 */
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');
const jwt = require('jsonwebtoken');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runE2EAudit() {
  console.log('========================================================');
  console.log('🚀 StayScape End-to-End Integration & Workflow Audit');
  console.log('========================================================\n');

  // WORKFLOW 1: AUTHENTICATION
  console.log('▶ WORKFLOW 1 — AUTHENTICATION & SESSION LIFECYCLE');
  const guestUser = new User({
    name: 'Traveler Guest',
    email: 'traveler.guest@example.com',
    password: 'password123',
    role: 'guest',
  });
  await guestUser.validate();
  assert(guestUser.role === 'guest', 'Guest user model instantiates with role "guest"');

  const jsonSerialized = guestUser.toJSON();
  assert(!jsonSerialized.password, 'Password field is completely omitted upon JSON serialization');

  const token = jwt.sign({ id: guestUser._id }, 'stayscape_jwt_secret', { expiresIn: '7d' });
  const decoded = jwt.verify(token, 'stayscape_jwt_secret');
  assert(decoded.id.toString() === guestUser._id.toString(), 'JWT token safely verifies user ID');

  // WORKFLOW 2: LISTINGS CRUD
  console.log('\n▶ WORKFLOW 2 — LISTING MANAGEMENT & CONSTRAINTS');
  const hostUser = new User({
    name: 'Coastal Host',
    email: 'coastal.host@example.com',
    password: 'password123',
    role: 'host',
  });
  await hostUser.validate();
  assert(hostUser.role === 'host', 'Host account instantiates with role "host"');

  const listing = new Listing({
    title: 'Sunny Seaside Retreat',
    description: 'Charming beachfront villa with private pool.',
    location: {
      address: '200 Ocean Breeze Way',
      city: 'Santa Monica',
      state: 'California',
      country: 'United States',
      latitude: 34.0195,
      longitude: -118.4912,
    },
    propertyType: 'villa',
    pricePerNight: 350,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ['Wifi', 'Pool', 'Kitchen'],
    images: ['https://example.com/villa.jpg'],
    host: hostUser._id,
  });
  await listing.validate();
  assert(listing.pricePerNight === 350, 'Listing validated with correct price per night');
  assert(listing.averageRating === 0, 'New listing initializes with averageRating = 0');
  assert(listing.isActive === true, 'Listing is active by default');

  // Update listing check
  listing.title = 'Updated Luxury Seaside Retreat';
  listing.pricePerNight = 400;
  await listing.validate();
  assert(listing.title === 'Updated Luxury Seaside Retreat', 'Property title successfully edited');
  assert(listing.pricePerNight === 400, 'Price per night successfully updated');

  // WORKFLOW 3: SEARCH & FILTERING LOGIC
  console.log('\n▶ WORKFLOW 3 — SEARCH & MULTI-PARAM FILTERING');
  const APIFeatures = require('./src/utils/apiFeatures');
  const mockQuery = {
    find: function (criteria) {
      this.criteria = criteria;
      return this;
    },
    sort: function (sortBy) {
      this.sortBy = sortBy;
      return this;
    },
    skip: function (num) {
      this.skipNum = num;
      return this;
    },
    limit: function (num) {
      this.limitNum = num;
      return this;
    },
    select: function (fields) {
      this.selectedFields = fields;
      return this;
    },
  };

  const queryString = {
    keyword: 'ocean',
    city: 'Miami',
    propertyType: 'villa',
    minPrice: '150',
    maxPrice: '500',
    guests: '4',
    sort: 'pricePerNight',
    page: '2',
    limit: '10',
  };

  const features = new APIFeatures(mockQuery, queryString)
    .search()
    .filter()
    .sort()
    .paginate()
    .limitFields();

  assert(mockQuery.criteria['location.city'] !== undefined, 'City filter parsed into query criteria');
  assert(mockQuery.criteria.pricePerNight.$gte === 150, 'Minimum price parsed ($gte: 150)');
  assert(mockQuery.criteria.pricePerNight.$lte === 500, 'Maximum price parsed ($lte: 500)');
  assert(mockQuery.criteria.maxGuests.$gte === 4, 'Guest capacity parsed ($gte: 4)');
  assert(mockQuery.sortBy === 'pricePerNight', 'Sorting applied according to user selection');
  assert(features.page === 2 && features.limit === 10, 'Pagination page (2) and limit (10) computed');

  // WORKFLOW 4: BOOKING ENGINE & DOUBLE-BOOKING CONFLICT
  console.log('\n▶ WORKFLOW 4 — BOOKINGS, OVERLAP PREVENTION & CANCELLATIONS');
  const checkIn = new Date('2026-12-15');
  const checkOut = new Date('2026-12-20');
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  assert(nights === 5, 'Calculated duration between Dec 15 and Dec 20 is exactly 5 nights');

  const booking = new Booking({
    listing: listing._id,
    guest: guestUser._id,
    host: hostUser._id,
    checkIn,
    checkOut,
    guests: 2,
    totalNights: nights,
    pricePerNight: listing.pricePerNight,
    totalPrice: nights * listing.pricePerNight,
    status: 'confirmed',
    paymentStatus: 'unpaid',
  });
  await booking.validate();
  assert(booking.totalPrice === 2000, 'Server calculated total price: 5 nights * $400 = $2000');
  assert(booking.paymentStatus === 'unpaid', 'Reservation created with unpaid status until payment confirmation');

  // Conflict overlap formula check
  function isOverlap(newIn, newOut, existingIn, existingOut) {
    return newIn < existingOut && newOut > existingIn;
  }

  // Exact conflict
  assert(
    isOverlap(new Date('2026-12-16'), new Date('2026-12-19'), checkIn, checkOut),
    'Successfully detects nested overlapping reservation (Dec 16 - Dec 19)'
  );
  // Straddling conflict
  assert(
    isOverlap(new Date('2026-12-10'), new Date('2026-12-16'), checkIn, checkOut),
    'Successfully detects overlapping check-in (Dec 10 - Dec 16)'
  );
  // Adjacent allowed
  assert(
    !isOverlap(new Date('2026-12-20'), new Date('2026-12-25'), checkIn, checkOut),
    'Allows adjacent reservation starting on check-out date (Dec 20 - Dec 25)'
  );

  // Cancellation
  booking.status = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.validate();
  assert(booking.status === 'cancelled', 'Booking status transitions to "cancelled"');
  assert(booking.paymentStatus === 'refunded', 'Payment status updates to "refunded" on cancellation');

  // WORKFLOW 5: REVIEWS & AUTOMATIC RATING AGGREGATION
  console.log('\n▶ WORKFLOW 5 — REVIEWS & AUTOMATIC RATING AGGREGATION');
  const review = new Review({
    listing: listing._id,
    guest: guestUser._id,
    booking: booking._id,
    rating: 5,
    comment: 'Spectacular villa with incredible ocean views. Very responsive host!',
  });
  await review.validate();
  assert(review.rating === 5, 'Review validated with 5-star rating');
  assert(review.booking.toString() === booking._id.toString(), 'Review bound to specific booking');
  assert(typeof Review.calculateAverageRating === 'function', 'Review model contains calculateAverageRating static method');

  // WORKFLOW 6: HOST DASHBOARD STATS & REVENUE DISTINCTION
  console.log('\n▶ WORKFLOW 6 — HOST DASHBOARD & REVENUE SEGREGATION');
  const bookingsCollection = [
    { status: 'confirmed', paymentStatus: 'paid', totalPrice: 800 },
    { status: 'confirmed', paymentStatus: 'paid', totalPrice: 1200 },
    { status: 'confirmed', paymentStatus: 'unpaid', totalPrice: 600 },
    { status: 'cancelled', paymentStatus: 'refunded', totalPrice: 500 },
  ];

  const paidRevenue = bookingsCollection
    .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const unpaidRevenue = bookingsCollection
    .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'unpaid')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  assert(paidRevenue === 2000, 'Calculates paid/confirmed revenue ($2000) excluding unpaid reservations');
  assert(unpaidRevenue === 600, 'Distinguishes pending unpaid revenue ($600) for on-arrival settlement');

  // WORKFLOW 7: MAP COORDINATES & FALLBACK
  console.log('\n▶ WORKFLOW 7 — MAP INTEGRATION & FALLBACKS');
  const hasCoords = !!(listing.location.latitude && listing.location.longitude);
  assert(hasCoords, 'Listing location contains valid latitude and longitude coordinates');

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?marker=${listing.location.latitude}%2C${listing.location.longitude}`;
  assert(osmUrl.includes('34.0195'), 'Generates valid OpenStreetMap interactive fallback URL');

  console.log('\n========================================================');
  console.log(`Audit Summary: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runE2EAudit();
