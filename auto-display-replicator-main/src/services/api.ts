/**
 * API Client
 * 
 * Axios instance with base configuration, interceptors, and error handling.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API base URL with development fallback
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    console.warn('⚠️ VITE_API_BASE_URL not set. Using default: http://localhost:5000/api');
    console.warn('   Create a .env file with: VITE_API_BASE_URL=http://localhost:5000/api');
    return 'http://localhost:5000/api';
  }
  
  // Production build: fail fast
  throw new Error('VITE_API_BASE_URL environment variable is required in production. Please set it in your .env file.');
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('userLogout'));
        // Redirect to login page
        window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
    }

    return Promise.reject(error);
  }
);

export default api;

