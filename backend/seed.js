const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});

    console.log('👤 Creating users...');
    const adminUser = await User.create({
      name: 'StayScape Admin',
      email: 'admin@stayscape.com',
      password: 'Password123!',
      role: 'admin',
      bio: 'Platform administrator for StayScape luxury and boutique vacation rentals.',
      phoneNumber: '+1-555-0100',
    });

    const hostUser = await User.create({
      name: 'Elena Rostova',
      email: 'host@stayscape.com',
      password: 'Password123!',
      role: 'host',
      bio: 'Superhost and architectural designer curating extraordinary spaces worldwide.',
      phoneNumber: '+1-555-0101',
    });

    const hostUser2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@stayscape.com',
      password: 'Password123!',
      role: 'host',
      bio: 'Passionate alpine lodge host & certified mountain hiking guide.',
      phoneNumber: '+1-555-0102',
    });

    const guestUser = await User.create({
      name: 'Sophia Chen',
      email: 'guest@stayscape.com',
      password: 'Password123!',
      role: 'guest',
      bio: 'Travel photographer and avid remote worker.',
      phoneNumber: '+1-555-0103',
    });

    console.log('🏡 Creating curated property listings...');
    const sampleListings = [
      {
        host: hostUser._id,
        title: 'The Glass Horizon Villa — Oceanfront Malibu',
        description:
          'Perched gracefully above the Pacific Ocean, this minimalist masterpiece features floor-to-ceiling glass walls, an infinity edge pool overlooking private coves, and direct beach trail access. Enjoy stunning sunsets, chef-grade kitchen appliances, and bespoke Italian furnishings.',
        propertyType: 'villa',
        category: 'Beachfront',
        pricePerNight: 850,
        maxGuests: 8,
        bedrooms: 4,
        beds: 5,
        bathrooms: 4,
        location: {
          address: '32100 Pacific Coast Hwy',
          city: 'Malibu',
          state: 'California',
          country: 'United States',
          latitude: 34.0259,
          longitude: -118.7798,
        },
        amenities: [
          'Wifi',
          'Pool',
          'Hot tub',
          'Air conditioning',
          'Kitchen',
          'Free parking',
          'TV',
          'Washer',
          'Dryer',
          'Dedicated workspace',
        ],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
      {
        host: hostUser2._id,
        title: 'Nordic Pine Chalet with Cedar Sauna & Fireplace',
        description:
          'Experience quintessential alpine luxury in this handcrafted timber chalet surrounded by evergreen pines. Features heated stone floors, an outdoor barrel cedar sauna, a roaring stone wood-burning hearth, and ski-in/ski-out convenience.',
        propertyType: 'cabin',
        category: 'Cabins',
        pricePerNight: 520,
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        bathrooms: 3,
        location: {
          address: '450 Roaring Fork Trail',
          city: 'Aspen',
          state: 'Colorado',
          country: 'United States',
          latitude: 39.1911,
          longitude: -106.8175,
        },
        amenities: [
          'Wifi',
          'Indoor fireplace',
          'Heating',
          'Hot tub',
          'Kitchen',
          'Free parking',
          'Dedicated workspace',
          'Pets allowed',
        ],
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
      {
        host: hostUser._id,
        title: 'Minimalist SoHo Artist Penthouse Loft',
        description:
          'Located in the historic heart of SoHo, this light-filled penthouse features 14-foot original cast-iron beamed ceilings, expansive skylights, exposed red brick, and curated contemporary art. Walk down cobblestone streets to premier fashion boutiques and Michelin-starred dining.',
        propertyType: 'apartment',
        category: 'Iconic cities',
        pricePerNight: 430,
        maxGuests: 3,
        bedrooms: 1,
        beds: 2,
        bathrooms: 2,
        location: {
          address: '112 Prince Street',
          city: 'New York',
          state: 'New York',
          country: 'United States',
          latitude: 40.7259,
          longitude: -73.9983,
        },
        amenities: [
          'Wifi',
          'Air conditioning',
          'Heating',
          'Kitchen',
          'TV',
          'Washer',
          'Dryer',
          'Dedicated workspace',
          'Elevator',
        ],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
      {
        host: hostUser._id,
        title: 'Serene Lakefront Lodge with Private Dock',
        description:
          'Wake up to crystal-clear water and misty pine mornings. This luxury timber estate boasts panoramic lake vistas, a cedar wrap-around sun deck, private boat launch and dock, kayaks, and an outdoor firepit for evening stargazing.',
        propertyType: 'house',
        category: 'Lakefront',
        pricePerNight: 680,
        maxGuests: 10,
        bedrooms: 5,
        beds: 6,
        bathrooms: 4,
        location: {
          address: '782 Lakeshore Blvd',
          city: 'Lake Tahoe',
          state: 'Nevada',
          country: 'United States',
          latitude: 39.245,
          longitude: -119.957,
        },
        amenities: [
          'Wifi',
          'Waterfront',
          'Indoor fireplace',
          'Heating',
          'Kitchen',
          'Free parking',
          'BBQ grill',
          'Hot tub',
        ],
        images: [
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
      {
        host: hostUser2._id,
        title: 'The Mirrored Cube — High Desert Architectural Sanctuary',
        description:
          'An architectural marvel blending into the surreal rock formations of Joshua Tree. Completely off-grid yet ultra-luxurious, featuring floor-to-ceiling mirrored glass exterior reflecting desert skies, solar heated pool, and zero light pollution stargazing roof deck.',
        propertyType: 'villa',
        category: 'Desert',
        pricePerNight: 610,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        location: {
          address: '61200 Desert Gold Drive',
          city: 'Joshua Tree',
          state: 'California',
          country: 'United States',
          latitude: 34.1347,
          longitude: -116.3131,
        },
        amenities: [
          'Wifi',
          'Pool',
          'Air conditioning',
          'Heating',
          'Kitchen',
          'Free parking',
          'Dedicated workspace',
        ],
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
      {
        host: hostUser._id,
        title: 'Private Cliffside Villa Overlooking Aegean Waves',
        description:
          'Carved organically into the volcanic caldera, this whitewashed Greek sanctuary features an iconic infinity plunge pool, private sunbeds overlooking the caldera, and complimentary Greek breakfast delivered daily to your terrace.',
        propertyType: 'villa',
        category: 'Amazing pools',
        pricePerNight: 920,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        location: {
          address: 'Caldera Cliff Path',
          city: 'Oia',
          state: 'Santorini',
          country: 'Greece',
          latitude: 36.4618,
          longitude: 25.3753,
        },
        amenities: [
          'Wifi',
          'Pool',
          'Hot tub',
          'Air conditioning',
          'Kitchen',
          'Free parking',
        ],
        images: [
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        ],
        isActive: true,
      },
    ];

    const createdListings = await Listing.insertMany(sampleListings);
    console.log(`✅ Inserted ${createdListings.length} luxury listings.`);

    console.log('📅 Creating sample completed booking & review...');
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 14);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 9);

    const pastBooking = await Booking.create({
      listing: createdListings[0]._id,
      guest: guestUser._id,
      host: createdListings[0].host,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      guests: 2,
      pricePerNight: createdListings[0].pricePerNight,
      totalNights: 5,
      totalPrice: createdListings[0].pricePerNight * 5,
      status: 'completed',
      paymentStatus: 'paid',
    });

    await Review.create({
      listing: createdListings[0]._id,
      guest: guestUser._id,
      booking: pastBooking._id,
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
      comment:
        'One of the most breathtaking villas I have ever stayed at! Watching dolphins pass by from the infinity pool at sunrise was unforgettable. Elena was an attentive and wonderful host.',
    });

    await Review.calculateAverageRating(createdListings[0]._id);

    console.log('✨ Seed complete!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@stayscape.com / Password123!');
    console.log('  Host:    host@stayscape.com  / Password123!');
    console.log('  Guest:   guest@stayscape.com / Password123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
