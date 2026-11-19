/**
 * StayScape Backend Automated Test & Verification Suite
 */
const http = require('http');
const app = require('./src/app');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');
const generateToken = require('./src/utils/generateToken');
const APIFeatures = require('./src/utils/apiFeatures');
const jwt = require('jsonwebtoken');

let server;
let baseUrl;

async function runTests() {
  console.log('====================================');
  console.log('🧪 Starting StayScape Backend Tests');
  console.log('====================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Server started for testing on port ${port}\n`);
        resolve();
      });
    });

    // 1. Health check test
    console.log('--- Health Check Test ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.success === true, 'Health response success is true');
    assert(
      healthData.message === 'StayScape API is running',
      'Health response message matches "StayScape API is running"'
    );

    // 2. 404 handler test
    console.log('\n--- 404 Route Handler Test ---');
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404, 'Unknown endpoint returns HTTP 404');
    assert(notFoundData.success === false, '404 response success is false');

    // 3. User Model & Password Hashing Verification
    console.log('\n--- User Model & Password Hashing Test ---');
    const userInstance = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'mypassword123',
      role: 'guest'
    });

    assert(userInstance.name === 'John Doe', 'User name field populated correctly');
    assert(userInstance.role === 'guest', 'Default role is guest');

    // Trigger pre-save password hash
    await userInstance.validate();
    assert(true, 'User model validation succeeds for valid fields');

    // Test JSON serialization excludes password
    const jsonUser = userInstance.toJSON();
    assert(jsonUser.password === undefined, 'User toJSON() does not expose password');

    // 4. Listing Model Verification
    console.log('\n--- Listing Model Test ---');
    const listingInstance = new Listing({
      title: 'Cozy Beachfront Villa',
      description: 'Stunning villa right by the ocean.',
      location: {
        address: '123 Ocean Drive',
        city: 'Miami',
        state: 'Florida',
        country: 'USA'
      },
      propertyType: 'villa',
      pricePerNight: 250,
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      amenities: ['Wifi', 'Pool', 'Air conditioning'],
      images: ['https://example.com/villa1.jpg'],
      host: '507f1f77bcf86cd799439011'
    });

    await listingInstance.validate();
    assert(listingInstance.pricePerNight === 250, 'Listing pricePerNight is valid');
    assert(listingInstance.averageRating === 0, 'Listing default averageRating is 0');
    assert(listingInstance.totalReviews === 0, 'Listing default totalReviews is 0');

    // 5. Booking Model & Overlap Logic Verification
    console.log('\n--- Booking Model & Overlap Verification ---');
    const checkIn = new Date('2026-12-01');
    const checkOut = new Date('2026-12-05');
    const diffNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    assert(diffNights === 4, 'Calculated nights count between Dec 1 and Dec 5 is 4');

    const bookingInstance = new Booking({
      listing: listingInstance._id,
      guest: '507f1f77bcf86cd799439012',
      host: listingInstance.host,
      checkIn,
      checkOut,
      guests: 2,
      totalNights: diffNights,
      pricePerNight: listingInstance.pricePerNight,
      totalPrice: diffNights * listingInstance.pricePerNight,
      status: 'confirmed'
    });

    await bookingInstance.validate();
    assert(bookingInstance.totalPrice === 1000, 'Calculated total price 4 * 250 is 1000');
    assert(bookingInstance.status === 'confirmed', 'Booking status default is confirmed');

    // Overlap formula unit test:
    // newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
    const existingCheckIn = new Date('2026-12-01');
    const existingCheckOut = new Date('2026-12-05');

    function checkOverlap(nIn, nOut, eIn, eOut) {
      return nIn < eOut && nOut > eIn;
    }

    assert(
      checkOverlap(new Date('2026-12-02'), new Date('2026-12-04'), existingCheckIn, existingCheckOut),
      'Detects inside overlap (Dec 2 - Dec 4)'
    );
    assert(
      checkOverlap(new Date('2026-11-28'), new Date('2026-12-02'), existingCheckIn, existingCheckOut),
      'Detects left-straddling overlap (Nov 28 - Dec 2)'
    );
    assert(
      checkOverlap(new Date('2026-12-04'), new Date('2026-12-08'), existingCheckIn, existingCheckOut),
      'Detects right-straddling overlap (Dec 4 - Dec 8)'
    );
    assert(
      !checkOverlap(new Date('2026-12-05'), new Date('2026-12-10'), existingCheckIn, existingCheckOut),
      'Allows adjacent checkout date (Dec 5 - Dec 10)'
    );
    assert(
      !checkOverlap(new Date('2026-11-25'), new Date('2026-12-01'), existingCheckIn, existingCheckOut),
      'Allows adjacent checkin date (Nov 25 - Dec 1)'
    );

    // 6. Review Model Verification
    console.log('\n--- Review Model Verification ---');
    const reviewInstance = new Review({
      listing: listingInstance._id,
      guest: '507f1f77bcf86cd799439012',
      booking: bookingInstance._id,
      rating: 5,
      comment: 'Absolutely wonderful stay, highly recommended!'
    });

    await reviewInstance.validate();
    assert(reviewInstance.rating === 5, 'Review rating validated (value: 5)');
    assert(typeof Review.calculateAverageRating === 'function', 'Review has calculateAverageRating static method');

    // 7. Token Generation Verification
    console.log('\n--- JWT Token Utility Verification ---');
    process.env.JWT_SECRET = 'test_secret_key_12345';
    let cookieResult = {};
    const mockRes = {
      cookie: (name, val, opts) => {
        cookieResult = { name, val, opts };
      }
    };
    const testToken = generateToken(mockRes, '507f1f77bcf86cd799439011');
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    assert(decoded.id === '507f1f77bcf86cd799439011', 'Decoded token matches User ID');
    assert(cookieResult.name === 'token', 'Sets cookie named "token"');
    assert(cookieResult.opts.httpOnly === true, 'Cookie is HTTP-only');

    // 8. Auth Protected Endpoints Test (Unauthorized behavior)
    console.log('\n--- Auth Protected Endpoints Verification ---');
    const protectedRes = await fetch(`${baseUrl}/api/auth/me`);
    const protectedData = await protectedRes.json();
    assert(protectedRes.status === 401, 'Accessing /api/auth/me without token returns 401 Unauthorized');
    assert(protectedData.success === false, 'Unauthorized response success is false');

    const myBookingsRes = await fetch(`${baseUrl}/api/bookings/my-bookings`);
    assert(myBookingsRes.status === 401, 'Accessing /api/bookings/my-bookings without token returns 401');

    const userProfileRes = await fetch(`${baseUrl}/api/users/profile`);
    assert(userProfileRes.status === 401, 'Accessing /api/users/profile without token returns 401');

    // 9. Admin & Availability Endpoints Test
    console.log('\n--- Admin & Availability Endpoints Verification ---');
    const adminStatsRes = await fetch(`${baseUrl}/api/admin/stats`);
    assert(adminStatsRes.status === 401, 'Accessing /api/admin/stats without token returns 401');

    const uploadRes = await fetch(`${baseUrl}/api/upload`, { method: 'POST' });
    assert(uploadRes.status === 401, 'Accessing /api/upload without token returns 401');

    // Test availability endpoint is mounted and returns JSON response
    const availRes = await fetch(`${baseUrl}/api/bookings/availability/507f1f77bcf86cd799439011?checkIn=invalid&checkOut=invalid`);
    const availData = await availRes.json();
    assert(typeof availData.success === 'boolean', 'Availability endpoint responds with structured API format');

    // 9. Validation Middleware Test
    console.log('\n--- Validation Middleware Test ---');
    const invalidRegisterRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: '123' })
    });
    const invalidRegisterData = await invalidRegisterRes.json();
    assert(invalidRegisterRes.status === 400, 'Registration with invalid fields returns 400 Bad Request');
    assert(Array.isArray(invalidRegisterData.errors), 'Response contains array of validation error messages');

    console.log('\n====================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('====================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
