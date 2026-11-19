import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const ListingCard = ({ listing }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!listing) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const primaryImage =
    !imageError && listing.images && listing.images.length > 0
      ? listing.images[0]
      : fallbackImage;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group flex flex-col space-y-3 cursor-pointer select-none"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[20/19] rounded-2xl overflow-hidden bg-neutral-100">
        <img
          src={primaryImage}
          alt={listing.title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform text-white drop-shadow-md z-10"
        >
          {isFavorite ? (
            <FaHeart className="w-5 h-5 text-brand-500 fill-brand-500" />
          ) : (
            <FiHeart className="w-5 h-5 stroke-[2.5] stroke-white fill-black/20" />
          )}
        </button>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-neutral-800 capitalize shadow-sm">
          {listing.propertyType}
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-col space-y-1 text-sm">
        <div className="flex items-center justify-between font-semibold text-neutral-900">
          <span className="truncate pr-2">
            {listing.location?.city ? `${listing.location.city}, ${listing.location.country || ''}` : listing.title}
          </span>
          <div className="flex items-center space-x-1 shrink-0 text-neutral-800">
            <FiStar className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
            <span>
              {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        <p className="text-neutral-500 text-xs truncate">
          {listing.title}
        </p>

        <p className="text-neutral-500 text-xs">
          Up to {listing.maxGuests} guests · {listing.bedrooms || 1} bed{(listing.bedrooms || 1) > 1 ? 's' : ''}
        </p>

        <div className="pt-1 flex items-baseline space-x-1 text-neutral-900">
          <span className="font-bold text-base text-neutral-900">
            ${listing.pricePerNight?.toLocaleString()}
          </span>
          <span className="text-neutral-600 text-xs font-normal">night</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
