/**
 * Centralized API Configuration
 * 
 * Single source of truth for API base URL.
 * Production builds REQUIRE VITE_API_BASE_URL environment variable.
 * Development mode allows localhost fallback with warning.
 */

/**
 * Get API base URL from environment variable
 * 
 * @throws Error in production if VITE_API_BASE_URL is not set
 * @returns API base URL (e.g., "https://api.example.com/api" or "http://localhost:5000/api")
 */
export const getApiBaseUrl = (): string => {
  // Production: require environment variable
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_API_BASE_URL) {
      throw new Error(
        'VITE_API_BASE_URL environment variable is required in production. ' +
        'Set it in your build environment or .env.production file.'
      );
    }
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development: allow fallback with warning
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback (localhost)
  console.warn('⚠️ VITE_API_BASE_URL not set. Using default: http://localhost:5000/api');
  console.warn('   Create a .env file with: VITE_API_BASE_URL=http://localhost:5000/api');
  return 'http://localhost:5000/api';
};

/**
 * Get backend base URL (without /api suffix) for static file serving
 * Used for resolving image URLs like /brands/file.png
 */
export const getBackendBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  // Remove /api suffix to get base URL
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Resolve image URL to full path
 * Handles relative paths, absolute paths, and full URLs
 */
export const resolveImageUrl = (path: string | undefined | null): string => {
  if (!path) return '/pp.jpg';
  
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Data URL (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Relative path starting with /
  if (path.startsWith('/')) {
    // Backend-served paths that need full URL
    if (path.startsWith('/brands/') || path.startsWith('/hero/') || path.startsWith('/uploads/')) {
      return `${getBackendBaseUrl()}${path}`;
    }
    // Public folder assets (e.g., /pp.jpg, /k.png) - keep as-is
    return path;
  }
  
  // Just a filename - assume it's a brand image
  return `${getBackendBaseUrl()}/brands/${path}`;
};

