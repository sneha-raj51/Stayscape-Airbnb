import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiStar,
  FiMapPin,
  FiShare2,
  FiHeart,
  FiUser,
  FiCheck,
  FiWifi,
  FiTv,
  FiCoffee,
  FiWind,
  FiShield,
  FiChevronLeft,
} from 'react-icons/fi';
import { MdOutlineKitchen, MdOutlinePool, MdOutlineLocalParking } from 'react-icons/md';
import BookingCard from '../components/booking/BookingCard';
import ReviewsSection from '../components/listings/ReviewsSection';
import MapComponent from '../components/common/MapComponent';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import listingService from '../services/listingService';
import toast from 'react-hot-toast';

const AMENITY_ICONS = {
  wifi: FiWifi,
  pool: MdOutlinePool,
  parking: MdOutlineLocalParking,
  kitchen: MdOutlineKitchen,
  tv: FiTv,
  coffee: FiCoffee,
  'air conditioning': FiWind,
  ac: FiWind,
};

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  const fetchListingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.getListingById(id);
      if (response.success && response.data?.listing) {
        setListing(response.data.listing);
      } else {
        setError('Listing not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading property details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <ErrorState
          title="Property Not Found"
          message={error || "The listing you are looking for does not exist or has been removed."}
          onRetry={fetchListingDetails}
        />
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'];

  const host = listing.host;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-neutral-500 mb-4">
          <Link to="/listings" className="inline-flex items-center space-x-1 hover:text-neutral-900">
            <FiChevronLeft className="w-4 h-4" />
            <span>All Listings</span>
          </Link>
          <span>/</span>
          <span className="capitalize">{listing.propertyType}</span>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate max-w-xs">{listing.location?.city}</span>
        </div>

        {/* Title & Header Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 mt-2">
              <div className="flex items-center space-x-1 font-semibold text-neutral-900">
                <FiStar className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}</span>
                <span className="text-neutral-400 font-normal">·</span>
                <span className="underline font-normal text-neutral-700">
                  {listing.totalReviews || 0} reviews
                </span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1 font-medium">
                <FiMapPin className="w-4 h-4 text-neutral-400" />
                <span>
                  {listing.location?.address}, {listing.location?.city}, {listing.location?.country}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => toast.success('Saved to your wishlist!')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors"
            >
              <FiHeart className="w-3.5 h-3.5 text-brand-500" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Image Gallery Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 rounded-2xl md:rounded-3xl overflow-hidden mb-10 max-h-[520px]">
          {/* Main Large Image (High Fetch Priority for LCP) */}
          <div className="md:col-span-2 h-72 md:h-[500px] overflow-hidden bg-neutral-100">
            <img
              src={images[0]}
              alt={listing.title}
              fetchpriority="high"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => setGalleryModalOpen(true)}
            />
          </div>

          {/* Secondary Grid Images (Lazy loading) */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 md:gap-3 h-[500px]">
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = images[idx] || images[0];
              return (
                <div key={idx} className="relative h-[244px] overflow-hidden bg-neutral-100">
                  <img
                    src={imgUrl}
                    alt={`${listing.title} view ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setGalleryModalOpen(true)}
                  />
                  {idx === 4 && images.length > 5 && (
                    <div
                      onClick={() => setGalleryModalOpen(true)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-black/50 transition-colors"
                    >
                      +{images.length - 5} more photos
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show All Photos button */}
          <button
            onClick={() => setGalleryModalOpen(true)}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-neutral-800 border border-neutral-200 shadow-md hover:bg-white transition-colors"
          >
            Show all {images.length} photos
          </button>
        </div>

        {/* Content Layout (Left: Details, Right: Sticky Booking Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hosted by info */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Entire {listing.propertyType} hosted by {host?.name || 'Local Host'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {listing.maxGuests} guests · {listing.bedrooms || 1} bedroom{(listing.bedrooms || 1) > 1 ? 's' : ''} ·{' '}
                  {listing.beds || 1} bed{(listing.beds || 1) > 1 ? 's' : ''} ·{' '}
                  {listing.bathrooms || 1} bath{(listing.bathrooms || 1) > 1 ? 's' : ''}
                </p>
              </div>

              {host?.avatar ? (
                <img
                  src={host.avatar}
                  alt={host.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-neutral-100 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-neutral-800 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                  {host?.name ? host.name.charAt(0).toUpperCase() : <FiUser />}
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="space-y-4 pb-6 border-b border-neutral-200">
              <div className="flex items-start space-x-4">
                <FiShield className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">AirCover Protection</h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FiStar className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">Experienced Hospitality</h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    This host has earned highly rated reviews from guests on StayScape.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">About this space</h3>
              <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">What this place offers</h3>
              {listing.amenities && listing.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {listing.amenities.map((amenity, idx) => {
                    const normalized = amenity.toLowerCase();
                    const Icon = AMENITY_ICONS[normalized] || FiCheck;
                    return (
                      <div key={idx} className="flex items-center space-x-3 text-sm text-neutral-700">
                        <Icon className="w-5 h-5 text-neutral-500" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Contact host for full amenities list.</p>
              )}
            </div>

            {/* Location Map Section */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Where you'll be</h3>
              <p className="text-sm text-neutral-600 mb-4">
                {listing.location?.address}, {listing.location?.city}, {listing.location?.state}, {listing.location?.country}
              </p>
              <MapComponent
                lat={listing.location?.latitude}
                lng={listing.location?.longitude}
                address={listing.location?.address}
                city={listing.location?.city}
                height="380px"
              />
            </div>

            {/* Reviews Section */}
            <ReviewsSection
              listingId={listing._id}
              averageRating={listing.averageRating}
              totalReviews={listing.totalReviews}
              onReviewAdded={fetchListingDetails}
            />
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <BookingCard listing={listing} onBookingSuccess={fetchListingDetails} />
          </div>
        </div>
      </div>

      {/* Full Photo Gallery Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="flex justify-between items-center text-white mb-6">
            <span className="font-semibold text-sm">{listing.title} Photos ({images.length})</span>
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
            >
              Close Gallery
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-neutral-900">
                <img
                  src={img}
                  alt={`${listing.title} photo ${i + 1}`}
                  loading="lazy"
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailsPage;
