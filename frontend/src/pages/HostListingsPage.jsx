import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import listingService from '../services/listingService';
import uploadService from '../services/uploadService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiImage,
  FiUploadCloud,
  FiX,
  FiStar,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ALL_AMENITIES = [
  'Wifi',
  'Kitchen',
  'Free parking',
  'Pool',
  'Air conditioning',
  'TV',
  'Washer',
  'Dryer',
  'Coffee maker',
  'Dedicated workspace',
  'Balcony',
  'Hot tub',
];

const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'condo',
  'cabin',
  'cottage',
  'studio',
  'loft',
  'chalet',
  'other',
];

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  propertyType: 'apartment',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  location: {
    address: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
  },
  amenities: ['Wifi', 'Kitchen'],
  images: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
  ],
};

const HostListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchHostListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.getMyListings();
      if (response.success && response.data?.listings) {
        setListings(response.data.listings);
      } else {
        setListings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostListings();
  }, []);

  const openCreateModal = () => {
    setEditingListingId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  const openEditModal = (listing) => {
    setEditingListingId(listing._id);
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      propertyType: listing.propertyType || 'apartment',
      pricePerNight: listing.pricePerNight || '',
      maxGuests: listing.maxGuests || 2,
      bedrooms: listing.bedrooms || 1,
      beds: listing.beds || 1,
      bathrooms: listing.bathrooms || 1,
      location: {
        address: listing.location?.address || '',
        city: listing.location?.city || '',
        state: listing.location?.state || '',
        country: listing.location?.country || '',
        latitude: listing.location?.latitude || '',
        longitude: listing.location?.longitude || '',
      },
      amenities: listing.amenities || [],
      images: listing.images || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingListingId(null);
    setNewImageUrl('');
  };

  const handleToggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`File ${f.name} exceeds 5MB size limit`);
        return;
      }
    }

    setUploadingImage(true);
    try {
      if (files.length === 1) {
        const response = await uploadService.uploadImage(files[0]);
        if (response.success && response.data?.url) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, response.data.url],
          }));
          toast.success(response.message || 'Image uploaded successfully');
        }
      } else {
        const response = await uploadService.uploadImages(files);
        if (response.success && response.data?.urls) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...response.data.urls],
          }));
          toast.success(response.message || `${files.length} images uploaded successfully`);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed. You can paste an image URL instead.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please provide a listing title and description');
      return;
    }

    if (!formData.location.address || !formData.location.city || !formData.location.country) {
      toast.error('Please complete the location details (address, city, country)');
      return;
    }

    if (!formData.pricePerNight || Number(formData.pricePerNight) <= 0) {
      toast.error('Please enter a valid price per night');
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      toast.error('Please include at least one property photo');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        maxGuests: Number(formData.maxGuests),
        bedrooms: Number(formData.bedrooms),
        beds: Number(formData.beds),
        bathrooms: Number(formData.bathrooms),
        location: {
          ...formData.location,
          latitude: formData.location.latitude ? Number(formData.location.latitude) : undefined,
          longitude: formData.location.longitude ? Number(formData.location.longitude) : undefined,
        },
      };

      if (editingListingId) {
        const response = await listingService.updateListing(editingListingId, payload);
        if (response.success) {
          toast.success('Listing updated successfully!');
          closeModal();
          fetchHostListings();
        }
      } else {
        const response = await listingService.createListing(payload);
        if (response.success) {
          toast.success('Listing published successfully!');
          closeModal();
          fetchHostListings();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) {
      return;
    }

    try {
      const response = await listingService.deleteListing(listingId);
      if (response.success) {
        toast.success('Listing deleted');
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your properties..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error} onRetry={fetchHostListings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Manage Properties
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Add new accommodations, update pricing, or manage your active spaces
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md shadow-brand-500/25"
          >
            <FiPlus className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Listing</span>
          </button>
        </div>

        {/* Listings Display */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200">
            <EmptyState
              title="No properties listed yet"
              description="Start hosting travelers by creating your first property listing on StayScape."
              actionText="Create Listing"
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const primaryImg =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative w-full aspect-[16/10] bg-neutral-100 overflow-hidden">
                      <img
                        src={primaryImg}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold capitalize text-neutral-800 shadow-sm">
                        {item.propertyType}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                        <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-neutral-900 text-base truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.location?.address}, {item.location?.city}, {item.location?.country}
                      </p>
                      <p className="text-xs text-neutral-600">
                        Up to {item.maxGuests} guests · {item.bedrooms || 1} bed · {item.bathrooms || 1} bath
                      </p>
                      <div className="pt-2 flex items-baseline space-x-1">
                        <span className="text-lg font-bold text-neutral-900">
                          ${item.pricePerNight?.toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-500">/ night</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      to={`/listings/${item._id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Preview</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl border border-neutral-200 hover:bg-white text-neutral-700 text-xs font-semibold transition-colors"
                        title="Edit listing"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                        title="Delete listing"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listing Form Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {editingListingId ? 'Edit Property Listing' : 'Create New Property Listing'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Title & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sunny Beachfront Villa with Ocean Views"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 capitalize"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your space, atmosphere, neighborhood, and special features..."
                  className="w-full p-4 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Location details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Location Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address (e.g. 123 Ocean Drive)"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="City (e.g. Miami)"
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="State / Province (e.g. Florida)"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Country (e.g. United States)"
                      value={formData.location.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, country: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Capacity Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Price / Night ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Select Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_AMENITIES.map((amenity) => {
                    const checked = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-medium transition-colors text-left ${
                          checked
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        <FiCheck className={`w-3.5 h-3.5 ${checked ? 'text-white' : 'opacity-0'}`} />
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos / Images */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Property Photos
                </label>

                {/* Upload or URL entry */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-neutral-800 text-white text-xs font-bold rounded-xl hover:bg-neutral-900 transition-colors"
                  >
                    Add URL
                  </button>

                  <label className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                    <FiUploadCloud className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingImage}
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image thumbnails preview */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 group">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                        title="Remove photo"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingListingId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostListingsPage;
