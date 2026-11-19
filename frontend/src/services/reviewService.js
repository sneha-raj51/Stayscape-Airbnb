import api from './api';

export const reviewService = {
  // Submit a review for a completed stay
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a specific listing
  getListingReviews: async (listingId) => {
    const response = await api.get(`/reviews/listing/${listingId}`);
    return response.data;
  },

  // Delete review (Review author or Admin)
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
