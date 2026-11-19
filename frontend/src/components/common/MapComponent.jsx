import React, { useState } from 'react';
import { FiMapPin, FiNavigation, FiExternalLink, FiList } from 'react-icons/fi';

const MapComponent = ({
  lat,
  lng,
  address = '',
  city = '',
  properties = [],
  zoom = 13,
  height = '400px',
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Selected property index for multi-property maps
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeProperty = properties.length > 0 ? properties[selectedIdx] : null;

  // Resolve coordinates
  const latitude =
    lat ||
    activeProperty?.location?.latitude ||
    properties[0]?.location?.latitude ||
    25.7617; // Default fallback: Miami, FL

  const longitude =
    lng ||
    activeProperty?.location?.longitude ||
    properties[0]?.location?.longitude ||
    -80.1918;

  const locationLabel =
    address ||
    activeProperty?.location?.address ||
    (city ? `${city}` : activeProperty?.location?.city || 'Property Location');

  // If Google Maps API key is configured, embed interactive Google Map
  if (apiKey) {
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
      locationLabel || `${latitude},${longitude}`
    )}&center=${latitude},${longitude}&zoom=${zoom}`;

    return (
      <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm" style={{ height }}>
        <iframe
          title="Property Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapSrc}
        />
      </div>
    );
  }

  // Fallback: Elegant Interactive Location Component with Map Preview & Directions
  const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.04}%2C${latitude - 0.03}%2C${longitude + 0.04}%2C${latitude + 0.03}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    locationLabel || `${latitude},${longitude}`
  )}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50 relative" style={{ height }}>
      <div className="relative w-full h-full flex flex-col justify-between">
        {/* OpenStreetMap interactive iframe fallback */}
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          className="w-full h-full border-0 filter saturate-75 contrast-95"
          src={openStreetMapUrl}
          loading="lazy"
        />

        {/* Floating location card badge */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-xl border border-neutral-200/80 shadow-card">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 shrink-0 mt-0.5">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-neutral-900 text-sm truncate">{locationLabel}</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {city ? `Located in ${city}` : 'Exact location provided after booking confirmation'}
              </p>
              <div className="mt-2 flex items-center space-x-3">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <FiNavigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                  <FiExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Multiple Property Switcher if viewing a collection */}
          {properties.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">
                Property {selectedIdx + 1} of {properties.length}
              </span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  disabled={selectedIdx === 0}
                  onClick={() => setSelectedIdx((p) => Math.max(0, p - 1))}
                  className="px-2 py-0.5 rounded border border-neutral-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={selectedIdx === properties.length - 1}
                  onClick={() => setSelectedIdx((p) => Math.min(properties.length - 1, p + 1))}
                  className="px-2 py-0.5 rounded border border-neutral-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
