import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data) {
      if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.errors && error.response.data.errors.length > 0) {
        message = error.response.data.errors.map((e) => e.message).join(', ');
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      originalError: error,
    });
  }
);

export default api;
