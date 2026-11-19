import api from './api';

export const userService = {
  // Get current user profile
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile (name, phone, avatar, role)
  updateUserProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },
};

export default userService;
