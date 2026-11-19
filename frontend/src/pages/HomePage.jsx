import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/listings/SearchBar';
import CategoryFilter from '../components/listings/CategoryFilter';
import ListingCard from '../components/listings/ListingCard';
import SkeletonCard from '../components/common/SkeletonCard';
import ErrorState from '../components/common/ErrorState';
import listingService from '../services/listingService';
import { FiArrowRight, FiShield, FiAward, FiStar, FiGlobe, FiMapPin } from 'react-icons/fi';

const POPULAR_DESTINATIONS = [
  {
    name: 'Miami, Florida',
    city: 'Miami',
    image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=600&q=80',
    stays: '500+ Stays',
  },
  {
    name: 'New York, USA',
    city: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    stays: '850+ Stays',
  },
  {
    name: 'Paris, France',
    city: 'Paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    stays: '620+ Stays',
  },
  {
    name: 'Bali, Indonesia',
    city: 'Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    stays: '430+ Stays',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedListings = async (categoryFilter = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { limit: 8 };

      if (categoryFilter.propertyType) {
        params.propertyType = categoryFilter.propertyType;
      }
      if (categoryFilter.keyword) {
        params.keyword = categoryFilter.keyword;
      }
      if (categoryFilter.sort) {
        params.sort = categoryFilter.sort;
      }

      const response = await listingService.getListings(params);
      if (response.success && response.data?.listings) {
        setListings(response.data.listings);
      } else {
        setListings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    fetchFeaturedListings(category);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-neutral-900 text-white">
        {/* Hero Background Image with High Priority */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury StayScape Villa"
            fetchpriority="high"
            className="w-full h-full object-cover object-center opacity-45 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-white">
            <FiGlobe className="w-3.5 h-3.5 text-brand-400" />
            <span>Discover Unforgettable Accommodations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Find Your Next <span className="text-brand-400">Stay</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Plan your next journey with StayScape. From tranquil coastal retreats to cozy alpine chalets, discover authentic places to stay around the globe.
          </p>

          {/* Search Bar Interface */}
          <div className="pt-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* 2. Category Filter Navigation */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* 3. Featured Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {selectedCategory === 'all' ? 'Explore Properties' : 'Handpicked Stays'}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Popular places rated highly for comfort, cleanliness, and location
            </p>
          </div>

          <Link
            to="/listings"
            className="hidden sm:inline-flex items-center space-x-1.5 text-sm font-semibold text-neutral-800 hover:text-brand-600 transition-colors"
          >
            <span>View All</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchFeaturedListings()} />
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-100 max-w-lg mx-auto p-8">
            <FiMapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">No properties available</h3>
            <p className="text-sm text-neutral-500 mt-1 mb-6">
              There are currently no listings in this category. Explore all properties or check back soon.
            </p>
            <Link
              to="/listings"
              className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-x-6 sm:gap-y-10">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Destinations Section */}
      <section className="bg-neutral-50 border-t border-b border-neutral-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Popular Destinations
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Top trending cities and travel spots favored by travelers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                onClick={() => navigate(`/listings?city=${encodeURIComponent(dest.city)}`)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-card-hover transition-all duration-300 aspect-[4/5] bg-neutral-200"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-bold text-lg leading-tight">{dest.name}</h3>
                  <p className="text-xs text-neutral-200 mt-1 font-medium">{dest.stays}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. StayScape Guarantees / Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-brand-500 flex items-center justify-center">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg">Safe & Secure Booking</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Every stay is protected with end-to-end encryption, overlap conflict prevention, and transparent pricing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiAward className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg">Verified Hosts</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Experience warm hospitality with detailed host ratings and verified guest feedback from completed stays.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiStar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg">Unmatched Selection</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Choose from beachfront villas, city lofts, mountain cabins, and secluded countryside escapes.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Become a Host Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 md:p-14">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Become a Host"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Host on StayScape
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Earn money sharing your extra space
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Join thousands of hosts welcoming travelers. Enjoy full control over your calendar, pricing, and house rules with our easy-to-use hosting tools.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/30"
              >
                <span>Get Started as a Host</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
