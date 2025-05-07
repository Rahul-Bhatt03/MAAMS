
import axios from 'axios';
import BASE_URL from '../features/baseurl';

// Configure default axios instance
const api = axios.create({
  baseURL: BASE_URL
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 responses (unauthorized)
    if (error.response && error.response.status === 401) {
      // Optional: automatically logout on token expiration
      // store.dispatch(logout());
      console.error('Authentication error:', error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;