import api from './api';

export const listingService = {
  // Get listings with filters (keyword, city, propertyType, minPrice, maxPrice, guests, sort, page, limit)
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  // Get single listing by ID with populated host and reviews
  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Get listings owned by the logged-in host
  getMyListings: async () => {
    const response = await api.get('/listings/my-listings');
    return response.data;
  },

  // Create new listing (Host/Admin)
  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData);
    return response.data;
  },

  // Update existing listing (Owner Host/Admin)
  updateListing: async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  },

  // Delete listing (Owner Host/Admin)
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};

export default listingService;
