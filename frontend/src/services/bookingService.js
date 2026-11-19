import api from './api';

export const bookingService = {
  // Get listing availability and booked date ranges
  getListingAvailability: async (listingId, params = {}) => {
    const response = await api.get(`/bookings/availability/${listingId}`, { params });
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Simulate payment confirmation
  payBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/pay`);
    return response.data;
  },

  // Get current user's bookings (Guest)
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get bookings made on properties owned by current host
  getHostBookings: async () => {
    const response = await api.get('/bookings/host-bookings');
    return response.data;
  },

  // Get single booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default bookingService;
