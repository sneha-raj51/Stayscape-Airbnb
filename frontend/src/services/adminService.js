import api from './api';

export const adminService = {
  // Get platform metrics & statistics
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users with filters & pagination
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Update a user's role (guest, host, admin)
  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Delete user account
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all listings
  getAllListings: async (params = {}) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  // Get all bookings
  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },
};

export default adminService;
