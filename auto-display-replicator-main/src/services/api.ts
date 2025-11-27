/**
 * API Client
 * 
 * Axios instance with base configuration, interceptors, and error handling.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://69.169.108.182:3000/api',
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

