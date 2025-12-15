// Database API - PostgreSQL Backend
// In production build, VITE_API_BASE_URL is required
// In development, use localhost fallback with warning
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

export const API_BASE_URL = getApiBaseUrl();

// Base URL for static files (without /api)
const getStaticBaseUrl = (): string => {
  const apiUrl = API_BASE_URL;
  // Remove /api suffix to get base URL for static files
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Resolve image URL to full path
 * Handles: /brands/file.png, /hero/file.png, /uploads/file.png, etc.
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
      return `${getStaticBaseUrl()}${path}`;
    }
    // Public folder assets (e.g., /pp.jpg, /k.png) - keep as-is
    return path;
  }
  
  // Just a filename - assume it's a brand image
  return `${getStaticBaseUrl()}/brands/${path}`;
};

export interface ProductData {
  id?: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
  allImages?: string[];
  brand: string;
  sku: string;
  category: string;
  loyaltyPoints: number;
  hasPreview?: boolean;
  hasOptions?: boolean;
  description?: string;
}

export interface SectionContentData {
  id?: string;
  sectionType: string;
  title?: string;
  description?: string;
  content?: unknown;
}

export interface SearchOptionData {
  id?: string;
  field: string;
  value: string;
}

export interface CarBrandData {
  id?: string;
  name: string;
  model?: string;
  description?: string;
  image_url?: string;
}

// Vehicle data interface for the Catalogue page
export interface VehicleData {
  id?: string;
  name: string;
  brand: string;
  model: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Model data interface for Catalogue2 page
export interface VehicleModelData {
  id?: string | number;
  marque: string;
  model: string;
  description?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Model Part data interface for PiecesDispo page
export interface VehiclePartData {
  id: number;
  model_id: number;
  name: string;
  reference?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// VEHICLES API - For Catalogue Page
// ==========================================

/**
 * Get all vehicles from the database
 */
export const getVehicles = async (): Promise<VehicleData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch vehicles');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    throw error;
  }
};

/**
 * Get a vehicle by ID
 */
export const getVehicleById = async (id: string): Promise<VehicleData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch vehicle: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch vehicle');
    }
    
    return result.data || null;
  } catch (error) {
    console.error('❌ Error fetching vehicle:', error);
    throw error;
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (data: Omit<VehicleData, 'id' | 'created_at' | 'updated_at'>): Promise<VehicleData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        brand: data.brand,
        model: data.model,
        description: data.description || null,
        image_url: data.image_url || null,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create vehicle: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Vehicle created:', result.data.name);
    return result.data;
  } catch (error) {
    console.error('❌ Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async (id: string, data: Partial<VehicleData>): Promise<VehicleData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update vehicle: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete vehicle: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete vehicle');
    }
    
    console.log('✅ Vehicle deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting vehicle:', error);
    throw error;
  }
};

// ==========================================
// VEHICLE MODELS API - For Catalogue2 Page
// ==========================================

/**
 * Get all vehicle models for a specific marque
 */
export const getVehicleModels = async (marque: string): Promise<VehicleModelData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicleModels/${encodeURIComponent(marque)}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle models: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch vehicle models');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching vehicle models:', error);
    return [];
  }
};

/**
 * Create a new vehicle model
 */
export const createVehicleModel = async (data: Omit<VehicleModelData, 'id' | 'created_at' | 'updated_at'>): Promise<VehicleModelData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicleModels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        marque: data.marque,
        model: data.model,
        description: data.description || null,
        image: data.image || null,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create vehicle model: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Invalid API response');
    }
    
    console.log('✅ Vehicle model created:', result.data.model);
    return result.data;
  } catch (error) {
    console.error('❌ Error creating vehicle model:', error);
    throw error;
  }
};

/**
 * Delete a vehicle model
 */
export const deleteVehicleModel = async (id: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicleModels/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete vehicle model: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete vehicle model');
    }
    
    console.log('✅ Vehicle model deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting vehicle model:', error);
    throw error;
  }
};

// ==========================================
// VEHICLE MODEL PARTS API - For PiecesDispo Page
// ==========================================

/**
 * Get all parts for a specific vehicle model
 */
export const getPartsForModel = async (modelId: string | number): Promise<VehiclePartData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/models/${modelId}/parts`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch parts: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch parts');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching parts for model:', error);
    return [];
  }
};

/**
 * Create a new part for a vehicle model
 */
export const createPartForModel = async (
  modelId: string | number, 
  data: Omit<VehiclePartData, 'id' | 'model_id' | 'created_at' | 'updated_at'>
): Promise<VehiclePartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/models/${modelId}/parts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        reference: data.reference || null,
        description: data.description || null,
        price: data.price || null,
        image_url: data.image_url || null,
        category: data.category || null,
        in_stock: data.in_stock !== false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create part: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Invalid API response');
    }
    
    console.log('✅ Part created:', result.data.name);
    return result.data;
  } catch (error) {
    console.error('❌ Error creating part:', error);
    throw error;
  }
};

/**
 * Delete a part
 */
export const deletePart = async (partId: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete part: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete part');
    }
    
    console.log('✅ Part deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting part:', error);
    throw error;
  }
};

// ==========================================
// PRODUCTS API
// ==========================================

// Import search utilities
import { calculateMatchScore, normalizeText } from '@/utils/fuzzySearch';
import { SearchResult } from '@/types/search';
import Fuse from 'fuse.js';

export const getProducts = async (): Promise<ProductData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    const products = result.data;
    
    const mappedProducts = products.map((p: Record<string, unknown>) => ({
      id: p.id?.toString() || p.id,
      name: p.name,
      price: p.price?.toString() || p.price,
      originalPrice: p.original_price?.toString(),
      discount: p.discount,
      image: p.main_image || p.image,
      allImages: p.all_images || [],
      brand: p.brand,
      sku: p.sku,
      category: p.category,
      loyaltyPoints: p.loyalty_points || p.loyaltyPoints || 0,
      hasPreview: p.has_preview || p.hasPreview || false,
      hasOptions: p.has_options || p.hasOptions || false,
      description: p.description || '',
    }));
    
    console.log('✅ API: Fetched', mappedProducts.length, 'products from PostgreSQL');
    return mappedProducts;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
};

export const searchProducts = async (
  query: string, 
  fuzzyThreshold: number = 0.6
): Promise<SearchResult[]> => {
  console.log('🔍 API: Starting advanced search with query:', query);
  const startTime = performance.now();
  
  try {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery || normalizedQuery.length < 1) {
      console.log('🔍 API: Empty query after normalization');
      return [];
    }
    
    console.log('🔍 API: Normalized query:', normalizedQuery);
    
    const allProducts = await getProducts();
    console.log('🔍 API: Loaded', allProducts.length, 'products (fresh)');
    
    if (allProducts.length === 0) {
      console.log('🔍 API: No products available');
      return [];
    }
    
    const results: SearchResult[] = [];
    const processedProductIds = new Set<string>();
    
    for (const product of allProducts) {
      if (product.id && processedProductIds.has(product.id)) continue;
      
      let bestScore = 0;
      let bestMatchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';
      let bestMatchedField: 'name' | 'brand' | 'category' | 'sku' = 'name';
      let bestMatchedText = '';
      
      const fields: Array<{ field: 'name' | 'brand' | 'category' | 'sku'; value: string }> = [
        { field: 'name', value: product.name || '' },
        { field: 'brand', value: product.brand || '' },
        { field: 'category', value: product.category || '' },
        { field: 'sku', value: product.sku || '' },
      ];
      
      for (const { field, value } of fields) {
        if (!value) continue;
        
        const normalizedValue = normalizeText(value);
        if (!normalizedValue) continue;
        
        const match = calculateMatchScore(normalizedValue, normalizedQuery, field);
        
        if (match.score > bestScore) {
          bestScore = match.score;
          bestMatchType = match.matchType;
          bestMatchedField = field;
          bestMatchedText = value;
        }
      }
      
      if (bestScore > 0) {
        results.push({
          product,
          score: bestScore,
          matchType: bestMatchType,
          matchedField: bestMatchedField,
          matchedText: bestMatchedText,
        });
        if (product.id) processedProductIds.add(product.id);
      }
    }
    
    console.log('🔍 API: Found', results.length, 'matches using custom algorithm');
    
    if (results.length < 5 && normalizedQuery.length >= 2) {
      console.log('🔍 API: Using Fuse.js fallback for better results');
      
      try {
        const fuse = new Fuse(allProducts, {
          keys: [
            { name: 'name', weight: 0.4 },
            { name: 'brand', weight: 0.3 },
            { name: 'category', weight: 0.2 },
            { name: 'sku', weight: 0.1 },
          ],
          threshold: 0.4,
          ignoreLocation: true,
          includeScore: true,
          minMatchCharLength: 2,
          getFn: (obj, path) => {
            const value = Fuse.config.getFn(obj, path);
            return typeof value === 'string' ? normalizeText(value) : value;
          },
        });
        
        const fuseResults = fuse.search(normalizedQuery);
        
        const fuseResultMap = new Map<string, SearchResult>();
        
        for (const fuseResult of fuseResults) {
          const product = fuseResult.item;
          const score = fuseResult.score || 0;
          const fuseScore = Math.max(0, Math.min(100, (1 - score) * 100));
          
          if (product.id && processedProductIds.has(product.id)) continue;
          
          let matchedField: 'name' | 'brand' | 'category' | 'sku' = 'name';
          let matchedText = product.name || '';
          
          const fieldScores = [
            { field: 'name' as const, value: product.name || '', weight: 0.4 },
            { field: 'brand' as const, value: product.brand || '', weight: 0.3 },
            { field: 'category' as const, value: product.category || '', weight: 0.2 },
            { field: 'sku' as const, value: product.sku || '', weight: 0.1 },
          ];
          
          let bestFieldScore = 0;
          for (const { field, value } of fieldScores) {
            if (value && normalizeText(value).includes(normalizedQuery)) {
              const fieldScore = fuseScore * (field === 'name' ? 1.2 : field === 'brand' ? 1.1 : 1.0);
              if (fieldScore > bestFieldScore) {
                bestFieldScore = fieldScore;
                matchedField = field;
                matchedText = value;
              }
            }
          }
          
          fuseResultMap.set(product.id || '', {
            product,
            score: fuseScore,
            matchType: fuseScore >= 80 ? 'exact' : fuseScore >= 60 ? 'partial' : 'fuzzy',
            matchedField,
            matchedText,
          });
          
          if (product.id) processedProductIds.add(product.id);
        }
        
        for (const [productId, fuseResult] of fuseResultMap.entries()) {
          const existingResult = results.find(r => r.product.id === productId);
          if (!existingResult) {
            results.push(fuseResult);
          } else {
            if (fuseResult.score > existingResult.score) {
              const index = results.indexOf(existingResult);
              results[index] = fuseResult;
            }
          }
        }
        
        console.log('🔍 API: After Fuse.js fallback, total results:', results.length);
      } catch (fuseError) {
        console.error('🔍 API: Error using Fuse.js fallback:', fuseError);
      }
    }
    
    console.log('🔍 API: Sorting results by score');
    results.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }
      const fieldPriority: Record<'name' | 'brand' | 'category' | 'sku', number> = {
        name: 4,
        brand: 3,
        category: 2,
        sku: 1,
      };
      return fieldPriority[b.matchedField] - fieldPriority[a.matchedField];
    });
    
    const finalResults = results.slice(0, 50);
    const searchTime = performance.now() - startTime;
    
    console.log('🔍 API: Final results:', finalResults.length, 'products');
    console.log('🔍 API: Search completed in', searchTime.toFixed(2), 'ms');
    
    return finalResults;
  } catch (error) {
    console.error('🔍 API: Error performing search:', error);
    return [];
  }
};

export const searchProductsSimple = async (query: string): Promise<ProductData[]> => {
  const results = await searchProducts(query);
  return results.map(r => r.product);
};

export const getProductById = async (id: string): Promise<ProductData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    const product = result.data;
    
    return {
      id: product.id?.toString() || product.id,
      name: product.name,
      price: product.price?.toString() || product.price,
      originalPrice: product.original_price?.toString(),
      discount: product.discount,
      image: product.main_image || product.image,
      allImages: product.all_images || [],
      brand: product.brand,
      sku: product.sku,
      category: product.category,
      loyaltyPoints: product.loyalty_points || 0,
      hasPreview: product.has_preview || false,
      hasOptions: product.has_options || false,
      description: product.description || '',
    };
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (data: ProductData): Promise<ProductData> => {
  try {
    const backendData = {
      name: data.name,
      price: parseFloat(data.price),
      original_price: data.originalPrice ? parseFloat(data.originalPrice) : null,
      discount: data.discount || null,
      main_image: data.image || null,
      all_images: data.allImages || (data.image ? [data.image] : []),
      brand: data.brand,
      sku: data.sku,
      category: data.category,
      loyalty_points: data.loyaltyPoints || 0,
      has_preview: data.hasPreview || false,
      has_options: data.hasOptions || false,
      description: data.description || null,
    };

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    const product = result.data;
    
    return {
      id: product.id?.toString() || product.id,
      name: product.name,
      price: product.price?.toString() || product.price,
      originalPrice: product.original_price?.toString(),
      discount: product.discount,
      image: product.main_image || product.image,
      allImages: product.all_images || [],
      brand: product.brand,
      sku: product.sku,
      category: product.category,
      loyaltyPoints: product.loyalty_points || 0,
      hasPreview: product.has_preview || false,
      hasOptions: product.has_options || false,
      description: product.description || '',
    };
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: Partial<ProductData>): Promise<ProductData> => {
  try {
    const backendData: Record<string, unknown> = {};
    if (data.name !== undefined) backendData.name = data.name;
    if (data.price !== undefined) backendData.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) backendData.original_price = data.originalPrice ? parseFloat(data.originalPrice) : null;
    if (data.discount !== undefined) backendData.discount = data.discount || null;
    if (data.image !== undefined) backendData.main_image = data.image || null;
    if (data.allImages !== undefined) backendData.all_images = data.allImages;
    if (data.brand !== undefined) backendData.brand = data.brand;
    if (data.sku !== undefined) backendData.sku = data.sku;
    if (data.category !== undefined) backendData.category = data.category;
    if (data.loyaltyPoints !== undefined) backendData.loyalty_points = data.loyaltyPoints;
    if (data.hasPreview !== undefined) backendData.has_preview = data.hasPreview;
    if (data.hasOptions !== undefined) backendData.has_options = data.hasOptions;
    if (data.description !== undefined) backendData.description = data.description || null;

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    const product = result.data;
    
    return {
      id: product.id?.toString() || product.id,
      name: product.name,
      price: product.price?.toString() || product.price,
      originalPrice: product.original_price?.toString(),
      discount: product.discount,
      image: product.main_image || product.image,
      allImages: product.all_images || [],
      brand: product.brand,
      sku: product.sku,
      category: product.category,
      loyaltyPoints: product.loyalty_points || 0,
      hasPreview: product.has_preview || false,
      hasOptions: product.has_options || false,
      description: product.description || '',
    };
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete product');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
};

// ==========================================
// SECTION CONTENT API
// ==========================================

export const getSectionContent = async (sectionType: string): Promise<SectionContentData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sectionContent?sectionType=${sectionType}`);
    
    if (response.status === 404) {
      // Section doesn't exist yet, return null
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch section content: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching section content:', error);
    return null;
  }
};

export const updateSectionContent = async (sectionType: string, data: SectionContentData): Promise<SectionContentData> => {
  try {
    // Backend handles create/update automatically based on sectionType
    const response = await fetch(`${API_BASE_URL}/sectionContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sectionType: sectionType,
        title: data.title || null,
        content: data.content || null
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update section content: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('❌ Error updating section content:', error);
    throw error;
  }
};

// ==========================================
// SEARCH OPTIONS API
// ==========================================

export const getSearchOptions = async (field?: string): Promise<SearchOptionData[]> => {
  try {
    const url = field ? `${API_BASE_URL}/searchOptions?field=${field}` : `${API_BASE_URL}/searchOptions`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch search options: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching search options:', error);
    throw error;
  }
};

export const createSearchOption = async (data: SearchOptionData): Promise<SearchOptionData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error creating search option:', error);
    throw error;
  }
};

export const deleteSearchOption = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete search option');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting search option:', error);
    throw error;
  }
};

export const deleteSearchOptionByValue = async (field: string, value: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions/field-value`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field, value }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete search option');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting search option by value:', error);
    throw error;
  }
};

// ==========================================
// CAR BRANDS API (Legacy - for backwards compatibility)
// ==========================================

export const getCarBrands = async (): Promise<CarBrandData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch car brands: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching car brands:', error);
    throw error;
  }
};

export const createCarBrand = async (data: CarBrandData): Promise<CarBrandData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create car brand: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error creating car brand:', error);
    throw error;
  }
};

export const updateCarBrand = async (id: string, data: Partial<CarBrandData>): Promise<CarBrandData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update car brand: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error updating car brand:', error);
    throw error;
  }
};

export const deleteCarBrand = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete car brand: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete car brand');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting car brand:', error);
    throw error;
  }
};

export const deleteCarBrandByName = async (name: string): Promise<boolean> => {
  try {
    const brands = await getCarBrands();
    const brand = brands.find(b => b.name === name);
    
    if (!brand || !brand.id) {
      throw new Error(`Car brand "${name}" not found`);
    }
    
    return await deleteCarBrand(brand.id.toString());
  } catch (error) {
    console.error('❌ Error deleting car brand by name:', error);
    throw error;
  }
};

export const getBrandSuggestions = async (query: string, limit: number = 3): Promise<CarBrandData[]> => {
  console.log('🔍 API: Getting brand suggestions for:', query);
  try {
    const brands = await getCarBrands();
    const { normalizeText, calculateMatchScore } = await import('@/utils/fuzzySearch');
    const normalizedQuery = normalizeText(query);
    
    if (!normalizedQuery) return brands.slice(0, limit);
    
    const scored = brands.map((brand: CarBrandData) => {
      const normalizedBrand = normalizeText(brand.name);
      const match = calculateMatchScore(normalizedBrand, normalizedQuery, 'brand');
      return { brand, score: match.score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.brand);
  } catch (error) {
    console.error('🔍 API: Error getting brand suggestions:', error);
    return [];
  }
};

export const getCategorySuggestions = async (query: string, limit: number = 3): Promise<string[]> => {
  console.log('🔍 API: Getting category suggestions for:', query);
  try {
    const products = await getProducts();
    const { normalizeText, calculateMatchScore } = await import('@/utils/fuzzySearch');
    const normalizedQuery = normalizeText(query);
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    if (!normalizedQuery) return categories.slice(0, limit);
    
    const scored = categories.map(category => {
      const normalizedCategory = normalizeText(category);
      const match = calculateMatchScore(normalizedCategory, normalizedQuery, 'category');
      return { category, score: match.score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.category);
  } catch (error) {
    console.error('🔍 API: Error getting category suggestions:', error);
    return [];
  }
};

// ==========================================
// SUBCATEGORIES API - For FamillesPiecesSectionCompact
// ==========================================

export interface SubcategoryData {
  id?: number;
  name: string;
  family_name?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all subcategories from database - ALWAYS FRESH (no cache)
 */
export const getSubcategories = async (): Promise<SubcategoryData[]> => {
  try {
    const timestamp = Date.now(); // Cache buster
    const response = await fetch(`${API_BASE_URL}/subcategories?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response');
    }
    
    console.log('✅ Subcategories fetched (fresh):', result.data.length, 'items');
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    return [];
  }
};

/**
 * Upload subcategory image AND link to family - triggers global refresh
 * @param name - Subcategory name
 * @param file - Image file
 * @param familyName - Parent family name (required for persistence)
 */
export const uploadSubcategoryImage = async (
  name: string, 
  file: File, 
  familyName?: string
): Promise<SubcategoryData | null> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('subcategory_name', name);
    if (familyName) {
      formData.append('family_name', familyName);
    }
    
    const response = await fetch(`${API_BASE_URL}/subcategories/upload-image`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Subcategory image uploaded:', name, 'Family:', familyName || 'N/A');
    
    // Dispatch global event to refresh all components
    window.dispatchEvent(new CustomEvent('subcategories-updated'));
    
    return result.data;
  } catch (error) {
    console.error('❌ Error uploading subcategory image:', error);
    throw error;
  }
};

/**
 * Get subcategories grouped by family name
 */
export const getSubcategoriesByFamily = async (): Promise<Record<string, SubcategoryData[]>> => {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/subcategories/by-family?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response');
    }
    
    console.log('✅ Subcategories by family fetched');
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching subcategories by family:', error);
    return {};
  }
};

/**
 * Get subcategories for a specific family
 */
export const getSubcategoriesForFamily = async (familyName: string): Promise<SubcategoryData[]> => {
  try {
    const timestamp = Date.now();
    const response = await fetch(
      `${API_BASE_URL}/subcategories/family/${encodeURIComponent(familyName)}?t=${timestamp}`, 
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid API response');
    }
    
    console.log('✅ Subcategories for family fetched:', familyName);
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching subcategories for family:', error);
    return [];
  }
};

/**
 * Force refresh subcategories globally
 * Call this after any create/update/delete operation
 * Triggers refresh across ALL tabs/windows using BroadcastChannel
 */
export const refreshSubcategoriesGlobally = async (): Promise<void> => {
  console.log('🔄 Triggering global subcategories refresh...');
  
  // Method 1: Custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent('subcategories-updated'));
  
  // Method 2: BroadcastChannel for cross-tab communication
  try {
    const channel = new BroadcastChannel('subcategories-updates');
    channel.postMessage({ type: 'refresh', timestamp: Date.now() });
    channel.close();
  } catch (e) {
    console.warn('BroadcastChannel not supported, using events only');
  }
  
  // Method 3: Fetch fresh data to ensure cache is cleared
  await getSubcategories();
};

/**
 * Global refresh function for all categories/subcategories
 * Forces re-fetch everywhere (same tab, other tabs, React Query cache)
 */
export const refreshCategoriesGlobally = async (): Promise<void> => {
  console.log('🔄 refreshCategoriesGlobally: Forcing refresh everywhere...');
  
  // Refresh subcategories
  await refreshSubcategoriesGlobally();
  
  // Dispatch global categories refresh event
  window.dispatchEvent(new CustomEvent('categories-updated'));
  
  // BroadcastChannel for cross-tab
  try {
    const channel = new BroadcastChannel('categories-updates');
    channel.postMessage({ type: 'refresh', timestamp: Date.now() });
    channel.close();
  } catch (e) {
    console.warn('BroadcastChannel not supported');
  }
};

// ==========================================
// ACHA PRODUCTS API - For Acha Page
// ==========================================

export interface AchaProductData {
  id?: number;
  sub_id: string;
  name?: string;
  brand_name?: string;
  model_name?: string;
  description?: string;
  price?: string;
  images?: string[];
  quantity?: number;
  product_references?: string[];
  promotion_percentage?: number | null;
  promotion_price?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get or create an Acha product by sub_id
 */
export const getOrCreateAchaProduct = async (subId: string): Promise<AchaProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/acha-products/sub/${encodeURIComponent(subId)}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get or create acha product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Acha product loaded:', {
      sub_id: result.data.sub_id,
      promotion_percentage: result.data.promotion_percentage,
      promotion_price: result.data.promotion_price,
      price: result.data.price
    });
    return result.data;
  } catch (error) {
    console.error('❌ Error getting/creating acha product:', error);
    throw error;
  }
};

/**
 * Update an Acha product
 */
export const updateAchaProduct = async (id: number, data: Partial<AchaProductData>): Promise<AchaProductData> => {
  try {
    console.log('🔄 Updating Acha product:', { id, data, promotion_percentage: data.promotion_percentage });
    
    const response = await fetch(`${API_BASE_URL}/acha-products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update acha product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Acha product updated');
    return result.data;
  } catch (error) {
    console.error('❌ Error updating acha product:', error);
    throw error;
  }
};

/**
 * Perform vente hors ligne (decrease quantity by 1)
 */
export const venteHorsLigneAchaProduct = async (id: number): Promise<AchaProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/acha-products/${id}/vente-hors-ligne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to perform vente hors ligne: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Vente hors ligne successful, new quantity:', result.data.quantity);
    return result.data;
  } catch (error) {
    console.error('❌ Error performing vente hors ligne:', error);
    throw error;
  }
};

// ==========================================
// HERO CONTENT API - Dynamic Hero Section
// ==========================================

export interface HeroContentData {
  id?: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  images: string[];
  updatedAt?: string;
}

/**
 * Get hero content from database
 */
export const getHeroContent = async (): Promise<HeroContentData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hero`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get hero content: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Hero content loaded from database');
    return result.data;
  } catch (error) {
    console.error('❌ Error loading hero content:', error);
    // Return default content on error
    return {
      title: 'Un large choix de pièces auto',
      subtitle: 'Découvrez des milliers de références pour toutes les marques populaires. Qualité garantie, service fiable.',
      buttonText: 'Découvrir le catalogue',
      buttonLink: '/catalogue',
      images: ['/k.png', '/k2.jpg', '/k3.png']
    };
  }
};

/**
 * Update hero content (admin only)
 */
export const updateHeroContent = async (data: Partial<HeroContentData>): Promise<HeroContentData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hero`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update hero content: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Hero content updated successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error updating hero content:', error);
    throw error;
  }
};

/**
 * Upload hero images (admin only)
 */
export const uploadHeroImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${API_BASE_URL}/hero/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to upload images: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Hero images uploaded successfully');
    return result.data.images;
  } catch (error) {
    console.error('❌ Error uploading hero images:', error);
    throw error;
  }
};

// ==========================================
// BRANDS SECTION API
// ==========================================

export interface BrandImagesData {
  id?: number;
  title: string;
  images: string[];
  updatedAt?: string;
}

const DEFAULT_BRANDS: BrandImagesData = {
  id: 0,
  title: 'NOS MARQUES DISPONIBLES',
  images: ['/pp.jpg'],
  updatedAt: new Date().toISOString()
};

/**
 * Get brand images from database
 */
export const getBrandImages = async (): Promise<BrandImagesData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('⚠️ Failed to fetch brands, using defaults');
      return DEFAULT_BRANDS;
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.warn('⚠️ Invalid brands response, using defaults');
      return DEFAULT_BRANDS;
    }
    
    console.log('✅ Brand images fetched successfully');
    return {
      id: result.data.id,
      title: result.data.title || DEFAULT_BRANDS.title,
      images: result.data.images || DEFAULT_BRANDS.images,
      updatedAt: result.data.updatedAt
    };
  } catch (error) {
    console.error('❌ Error fetching brand images:', error);
    return DEFAULT_BRANDS;
  }
};

/**
 * Update brand images (admin only)
 */
export const updateBrandImages = async (data: Partial<BrandImagesData>): Promise<BrandImagesData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update brands: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Brand images updated successfully');
    return {
      id: result.data.id,
      title: result.data.title,
      images: result.data.images,
      updatedAt: result.data.updatedAt
    };
  } catch (error) {
    console.error('❌ Error updating brand images:', error);
    throw error;
  }
};

/**
 * Upload brand images (admin only)
 */
export const uploadBrandImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${API_BASE_URL}/brands/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to upload images: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Brand images uploaded successfully');
    return result.data.images;
  } catch (error) {
    console.error('❌ Error uploading brand images:', error);
    throw error;
  }
};

/**
 * Dashboard Product Data Interface
 */
export interface DashboardProductData {
  id?: number;
  acha_id: number;
  sub_id?: string | null;
  name?: string | null;
  price?: number | string;
  quantity?: number;
  first_image?: string | null;
  reference?: string | null;
  promotion_percentage?: number;
  created_at?: string;
}

/**
 * Add product to dashboard
 */
export async function addDashboardProduct(product) {
  // Ensure quantity is included in the JSON body
  const requestBody = {
    id: product.id || product.product_id,
    product_id: product.product_id || product.id,
    name: product.name,
    image: product.image,
    reference: product.reference,
    price: product.price,
    quantity: product.quantity !== undefined ? Number(product.quantity) : 0
  };

  console.log('🌐 API call - Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${API_BASE_URL}/dashboard-products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Error while adding dashboard product");
  }

  const result = await response.json();
  console.log('✅ API response received:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Get all dashboard products
 */
export async function getDashboardProducts() {
  const res = await fetch(`${API_BASE_URL}/dashboard-products`);
  if (!res.ok) throw new Error("Failed to fetch dashboard products");
  return res.json();
}

/**
 * Delete dashboard product
 */
export async function deleteDashboardProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/dashboard-products/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to delete product");
  return response.json();
}

/**
 * Update dashboard product
 */
export async function updateDashboardProduct(id: string, data: any) {
  const requestBody = {
    id: data.id,
    name: data.name,
    image: data.image,
    reference: data.reference,
    price: data.price,
    quantity: data.quantity !== undefined ? Number(data.quantity) : 0
  };

  const response = await fetch(`${API_BASE_URL}/dashboard-products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
}

/**
 * Acha2 Product Data Interface
 */
export interface Acha2ProductData {
  id: string; // Product name used as ID
  name: string;
  quantity2: number;
  price2: number;
  description2: string;
  references2: string[];
  images2: string[];
  modele2: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all Acha2 products
 */
export async function getAcha2Products(): Promise<Acha2ProductData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/acha2/all`);
    if (!response.ok) {
      throw new Error("Failed to fetch Acha2 products");
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching Acha2 products:', error);
    throw error;
  }
}

/**
 * Save Acha2 product to dashboard (UPSERT - insert or update)
 */
export async function saveAcha2Product(data: {
  name: string;
  quantity2: number;
  price2: number;
  description2: string;
  references2: string[];
  images2: string[];
  modele2: string[];
}): Promise<Acha2ProductData> {
  try {
    const response = await fetch(`${API_BASE_URL}/acha2/${encodeURIComponent(data.name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity2: data.quantity2 || 0,
        price2: data.price2 || 0,
        description2: data.description2 || '',
        references2: Array.isArray(data.references2) ? data.references2 : [],
        images2: Array.isArray(data.images2) ? data.images2 : [],
        modele2: Array.isArray(data.modele2) ? data.modele2 : [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save Acha2 product");
    }

    const result = await response.json();
    if (result.success && result.data) {
      console.log('✅ Acha2 product saved to dashboard:', data.name);
      return result.data;
    }
    throw new Error("Invalid API response");
  } catch (error) {
    console.error('❌ Error saving Acha2 product:', error);
    throw error;
  }
}

/**
 * Update Acha2 product by name
 */
export async function updateAcha2Product(
  name: string,
  data: Partial<Omit<Acha2ProductData, 'id' | 'name' | 'created_at' | 'updated_at'>>
): Promise<Acha2ProductData> {
  try {
    const response = await fetch(`${API_BASE_URL}/acha2/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity2: data.quantity2 ?? 0,
        price2: data.price2 ?? 0,
        description2: data.description2 ?? '',
        references2: data.references2 ?? [],
        images2: data.images2 ?? [],
        modele2: data.modele2 ?? [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update Acha2 product");
    }

    const result = await response.json();
    if (result.success && result.data) {
      console.log('✅ Acha2 product updated:', name);
      return result.data;
    }
    throw new Error("Invalid API response");
  } catch (error) {
    console.error('❌ Error updating Acha2 product:', error);
    throw error;
  }
}

/**
 * Delete Acha2 product by name
 */
export async function deleteAcha2Product(name: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/acha2/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete Acha2 product");
    }
  } catch (error) {
    console.error('❌ Error deleting Acha2 product:', error);
    throw error;
  }
}

// ==========================================
// PROMOTIONS API
// ==========================================

export interface PromotionData {
  id: number;
  image?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  badge?: string;
  productId?: string;
}

export interface PromotionsData {
  promotions: PromotionData[];
}

/**
 * Get promotions from database
 */
export const getPromotions = async (): Promise<PromotionData[]> => {
  try {
    const section = await getSectionContent('promotions');
    
    if (section && section.content) {
      const content = typeof section.content === 'string' 
        ? JSON.parse(section.content) 
        : section.content;
      
      if (Array.isArray(content)) {
        return content;
      }
      
      // If content is an object with promotions array
      if (content.promotions && Array.isArray(content.promotions)) {
        return content.promotions;
      }
    }
    
    // Return default promotions if none exist
    return [
      { id: 0, image: '/ff.png' },
      { id: 1, image: '/ll.png' }
    ];
  } catch (error) {
    console.error('❌ Error fetching promotions:', error);
    // Return defaults on error
    return [
      { id: 0, image: '/ff.png' },
      { id: 1, image: '/ll.png' }
    ];
  }
};

/**
 * Update promotion image
 */
export const updatePromotionImage = async (promoId: number, imageUrl: string): Promise<PromotionData[]> => {
  try {
    // Get current promotions
    const currentPromotions = await getPromotions();
    
    // Find and update the promotion
    const updatedPromotions = currentPromotions.map(promo => 
      promo.id === promoId 
        ? { ...promo, image: imageUrl }
        : promo
    );
    
    // If promotion doesn't exist, add it
    if (!updatedPromotions.find(p => p.id === promoId)) {
      updatedPromotions.push({ id: promoId, image: imageUrl });
    }
    
    // Save to database using sectionContent
    await updateSectionContent('promotions', {
      sectionType: 'promotions',
      title: 'PROMOTIONS',
      content: updatedPromotions
    });
    
    return updatedPromotions;
  } catch (error) {
    console.error('❌ Error updating promotion image:', error);
    throw error;
  }
};

// ==========================================
// ORDERS API
// ==========================================

export interface OrderData {
  id?: number;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  product_price: number | string;
  product_references?: string[];
  quantity: number;
  customer_nom: string;
  customer_prenom: string;
  customer_phone: string;
  customer_wilaya: string;
  customer_delegation: string;
  created_at?: string;
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: Omit<OrderData, 'id' | 'created_at'>): Promise<OrderData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create order: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }

    console.log('✅ Order created successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders (admin only)
 */
export const getOrders = async (): Promise<OrderData[]> => {
  try {
    // Get user from localStorage to send as header (basic auth)
    const userData = localStorage.getItem('user');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (userData) {
      headers['x-user'] = userData;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin access required');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch orders: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }

    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
};

/**
 * Delete an order (admin only)
 */
export const deleteOrder = async (orderId: number): Promise<boolean> => {
  try {
    const userData = localStorage.getItem('user');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (userData) {
      headers['x-user'] = userData;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin access required');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete order: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete order');
    }

    console.log('✅ Order deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    throw error;
  }
};

