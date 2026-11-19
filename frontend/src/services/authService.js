import api from './api';

export const authService = {
  // Register a new user (guest or host)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Authenticate user & receive cookie
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Clear authentication cookie
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get currently logged-in user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
