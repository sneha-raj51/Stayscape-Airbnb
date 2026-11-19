import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/listings/ListingCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import listingService from '../services/listingService';
import {
  FiFilter,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
} from 'react-icons/fi';

const PROPERTY_TYPES = [
  'all',
  'apartment',
  'house',
  'villa',
  'condo',
  'cabin',
  'cottage',
  'studio',
];

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state derived from URL
  const keyword = searchParams.get('keyword') || '';
  const city = searchParams.get('city') || '';
  const propertyType = searchParams.get('propertyType') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const guests = searchParams.get('guests') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Filter drawer / modal state on mobile
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Local draft filter states for the modal
  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const [draftCity, setDraftCity] = useState(city);
  const [draftPropertyType, setDraftPropertyType] = useState(propertyType);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);
  const [draftGuests, setDraftGuests] = useState(guests);
  const [draftSort, setDraftSort] = useState(sort);

  // Data state
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize draft filters when URL changes
  useEffect(() => {
    setDraftKeyword(keyword);
    setDraftCity(city);
    setDraftPropertyType(propertyType);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setDraftGuests(guests);
    setDraftSort(sort);
  }, [keyword, city, propertyType, minPrice, maxPrice, guests, sort]);

  // Fetch listings from backend API
  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 12,
      };

      if (keyword) params.keyword = keyword;
      if (city) params.city = city;
      if (propertyType && propertyType !== 'all') params.propertyType = propertyType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (guests) params.guests = guests;
      if (sort) params.sort = sort;

      const response = await listingService.getListings(params);

      if (response.success && response.data) {
        setListings(response.data.listings || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch properties from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [keyword, city, propertyType, minPrice, maxPrice, guests, sort, page]);

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    if (draftKeyword.trim()) newParams.set('keyword', draftKeyword.trim());
    if (draftCity.trim()) newParams.set('city', draftCity.trim());
    if (draftPropertyType && draftPropertyType !== 'all') newParams.set('propertyType', draftPropertyType);
    if (draftMinPrice) newParams.set('minPrice', draftMinPrice);
    if (draftMaxPrice) newParams.set('maxPrice', draftMaxPrice);
    if (draftGuests) newParams.set('guests', draftGuests);
    if (draftSort) newParams.set('sort', draftSort);
    newParams.set('page', '1');

    setSearchParams(newParams);
    setFilterModalOpen(false);
  };

  const resetFilters = () => {
    setDraftKeyword('');
    setDraftCity('');
    setDraftPropertyType('all');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftGuests('');
    setDraftSort('-createdAt');
    setSearchParams(new URLSearchParams());
    setFilterModalOpen(false);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const activeFilterCount = [
    keyword,
    city,
    propertyType !== 'all' ? propertyType : null,
    minPrice,
    maxPrice,
    guests,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Filter and Search Bar Header */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Quick search input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, location or keyword..."
                value={draftKeyword}
                onChange={(e) => setDraftKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
              {draftKeyword && (
                <button
                  onClick={() => {
                    setDraftKeyword('');
                    const p = new URLSearchParams(searchParams);
                    p.delete('keyword');
                    setSearchParams(p);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Sort & Filter Buttons */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-1 md:pb-0">
              {/* Sort Dropdown */}
              <select
                value={sort}
                onChange={(e) => {
                  const p = new URLSearchParams(searchParams);
                  p.set('sort', e.target.value);
                  p.set('page', '1');
                  setSearchParams(p);
                }}
                className="px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 bg-white hover:border-neutral-800 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="-createdAt">Newest First</option>
                <option value="pricePerNight">Price: Low to High</option>
                <option value="-pricePerNight">Price: High to Low</option>
                <option value="-averageRating">Highest Rated</option>
              </select>

              {/* Advanced Filter Modal Trigger */}
              <button
                onClick={() => setFilterModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-neutral-300 hover:border-neutral-800 text-neutral-800 text-sm font-medium transition-all bg-white relative"
              >
                <FiSliders className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline whitespace-nowrap pl-2"
                >
                  Reset all
                </button>
              )}
            </div>
          </div>

          {/* Quick Property Type Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-4 text-xs font-semibold">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = propertyType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    if (type === 'all') {
                      p.delete('propertyType');
                    } else {
                      p.set('propertyType', type);
                    }
                    p.set('page', '1');
                    setSearchParams(p);
                  }}
                  className={`px-4 py-1.5 rounded-full capitalize whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Results Count Header */}
        <div className="mb-6 flex items-baseline justify-between">
          <p className="text-sm font-medium text-neutral-500">
            {loading ? (
              'Searching stays...'
            ) : (
              <>
                Showing <span className="font-bold text-neutral-900">{pagination.total}</span>{' '}
                {pagination.total === 1 ? 'stay' : 'stays'}
                {city ? ` in ${city}` : ''}
              </>
            )}
          </p>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-y-10">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchListings} />
        ) : listings.length === 0 ? (
          <EmptyState
            title="No stays match your search criteria"
            description="Try changing your filters, clearing search keywords, or selecting a broader destination."
            actionText="Clear All Filters"
            onAction={resetFilters}
          />
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-x-6 sm:gap-y-10">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-neutral-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="p-2.5 rounded-full border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-neutral-800 transition-colors"
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pNum = i + 1;
                    if (
                      pNum === 1 ||
                      pNum === pagination.totalPages ||
                      (pNum >= pagination.page - 1 && pNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pNum}
                          onClick={() => handlePageChange(pNum)}
                          className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                            pagination.page === pNum
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    }
                    if (pNum === pagination.page - 2 || pNum === pagination.page + 2) {
                      return (
                        <span key={pNum} className="px-1 text-neutral-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="p-2.5 rounded-full border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-neutral-800 transition-colors"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Advanced Filter Modal Drawer */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900">Filters</h3>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* City filter */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                City / Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Miami, New York, Paris"
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraftPropertyType(t)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-colors ${
                      draftPropertyType === t
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {t === 'all' ? 'Any' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Price Range (per night)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-neutral-500 mb-1 block">Minimum ($)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={draftMinPrice}
                    onChange={(e) => setDraftMinPrice(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 mb-1 block">Maximum ($)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="1000+"
                    value={draftMaxPrice}
                    onChange={(e) => setDraftMaxPrice(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Guest capacity */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Minimum Guests Capacity
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="1"
                value={draftGuests}
                onChange={(e) => setDraftGuests(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 underline"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors shadow-md shadow-brand-500/20"
              >
                Show Stays
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
