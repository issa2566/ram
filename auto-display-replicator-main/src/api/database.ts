// Database API using JSON Server
const API_BASE_URL = 'http://69.169.108.182:3000';

export interface ProductData {
  id?: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
  brand: string;
  sku: string;
  category: string;
  loyaltyPoints: number;
  hasPreview?: boolean;
  hasOptions?: boolean;
}

export interface SectionContentData {
  id?: string;
  sectionType: string;
  title?: string;
  description?: string;
  content?: any;
}

export interface SearchOptionData {
  id?: string;
  field: string;
  value: string;
}

export interface CarBrandData {
  id?: string;
  name: string;
  file: string;
  models?: string[];
  description?: string;
}

// Products API
export const getProducts = async (): Promise<ProductData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      cache: 'no-store', // Always fetch fresh data
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    const products = await response.json();
    console.log('🔍 API: Fetched', products.length, 'products from server');
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to localStorage if server is not available
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      console.log('🔍 API: Using', parsed.length, 'products from localStorage');
      return parsed;
    }
    return [];
  }
};

// Import search utilities
import { calculateMatchScore, normalizeText } from '@/utils/fuzzySearch';
import { SearchResult } from '@/types/search';
import Fuse from 'fuse.js';

/**
 * 🔍 البحث المتقدم في المنتجات مع Fuzzy Search و Fuse.js Fallback
 * - يحمّل أحدث المنتجات دائماً
 * - يطبع النص بشكل كامل (lowercase + trim + remove accents)
 * - يبحث في: name, brand, category, sku
 * - يستخدم Fuse.js كـ fallback (threshold 0.4)
 * - لا يوجد case-sensitivity issues
 * - لا يوجد مشاكل في المسافات والحركات
 */
export const searchProducts = async (
  query: string, 
  fuzzyThreshold: number = 0.6
): Promise<SearchResult[]> => {
  console.log('🔍 API: Starting advanced search with query:', query);
  const startTime = performance.now();
  
  try {
    // 1. تطبيع نص البحث
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery || normalizedQuery.length < 1) {
      console.log('🔍 API: Empty query after normalization');
      return [];
    }
    
    console.log('🔍 API: Normalized query:', normalizedQuery);
    
    // 2. جلب أحدث المنتجات دائماً (بدون cache)
    const allProducts = await getProducts();
    console.log('🔍 API: Loaded', allProducts.length, 'products (fresh)');
    
    if (allProducts.length === 0) {
      console.log('🔍 API: No products available');
      return [];
    }
    
    // 3. البحث الأولي باستخدام الخوارزمية المخصصة
    const results: SearchResult[] = [];
    const processedProductIds = new Set<string>();
    
    for (const product of allProducts) {
      // تجنب المنتجات المكررة
      if (product.id && processedProductIds.has(product.id)) continue;
      
      let bestScore = 0;
      let bestMatchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';
      let bestMatchedField: 'name' | 'brand' | 'category' | 'sku' = 'name';
      let bestMatchedText = '';
      
      // البحث في كل حقل مع تطبيع
      const fields: Array<{ field: 'name' | 'brand' | 'category' | 'sku'; value: string }> = [
        { field: 'name', value: product.name || '' },
        { field: 'brand', value: product.brand || '' },
        { field: 'category', value: product.category || '' },
        { field: 'sku', value: product.sku || '' },
      ];
      
      for (const { field, value } of fields) {
        if (!value) continue;
        
        // تطبيع القيمة قبل البحث
        const normalizedValue = normalizeText(value);
        if (!normalizedValue) continue;
        
        const match = calculateMatchScore(normalizedValue, normalizedQuery, field);
        
        if (match.score > bestScore) {
          bestScore = match.score;
          bestMatchType = match.matchType;
          bestMatchedField = field;
          bestMatchedText = value; // القيمة الأصلية (غير المطابقة)
        }
      }
      
      // إضافة النتيجة إذا كانت الدرجة أعلى من الحد الأدنى
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
    
    // 4. إذا كانت النتائج قليلة أو فارغة، استخدم Fuse.js كـ fallback
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
          threshold: 0.4, // Lower threshold for more results
          ignoreLocation: true,
          includeScore: true,
          minMatchCharLength: 2,
          getFn: (obj, path) => {
            const value = Fuse.config.getFn(obj, path);
            return typeof value === 'string' ? normalizeText(value) : value;
          },
        });
        
        const fuseResults = fuse.search(normalizedQuery);
        
        // دمج النتائج مع النتائج الموجودة
        const fuseResultMap = new Map<string, SearchResult>();
        
        for (const fuseResult of fuseResults) {
          const product = fuseResult.item;
          const score = fuseResult.score || 0;
          const fuseScore = Math.max(0, Math.min(100, (1 - score) * 100)); // Convert Fuse score (0-1) to 0-100
          
          // تجنب التكرار
          if (product.id && processedProductIds.has(product.id)) continue;
          
          // تحديد الحقل المطابق
          let matchedField: 'name' | 'brand' | 'category' | 'sku' = 'name';
          let matchedText = product.name || '';
          
          // البحث عن أفضل حقل مطابق
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
        
        // دمج النتائج: إضافة نتائج Fuse التي ليست موجودة في النتائج الأصلية
        for (const [productId, fuseResult] of fuseResultMap.entries()) {
          const existingResult = results.find(r => r.product.id === productId);
          if (!existingResult) {
            results.push(fuseResult);
          } else {
            // إذا كانت نتيجة Fuse أفضل، استبدل النتيجة الأصلية
            if (fuseResult.score > existingResult.score) {
              const index = results.indexOf(existingResult);
              results[index] = fuseResult;
            }
          }
        }
        
        console.log('🔍 API: After Fuse.js fallback, total results:', results.length);
      } catch (fuseError) {
        console.error('🔍 API: Error using Fuse.js fallback:', fuseError);
        // Continue with existing results
      }
    }
    
    // 5. ترتيب حسب الدرجة (الأعلى أولاً)
    console.log('🔍 API: Sorting results by score');
    results.sort((a, b) => {
      // أولاً حسب الدرجة
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }
      // في حالة التساوي، نفضل name على brand على category على sku
      const fieldPriority: Record<'name' | 'brand' | 'category' | 'sku', number> = {
        name: 4,
        brand: 3,
        category: 2,
        sku: 1,
      };
      return fieldPriority[b.matchedField] - fieldPriority[a.matchedField];
    });
    
    // 6. إرجاع أفضل 50 نتيجة
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

/**
 * 🔍 البحث البسيط (للتوافق مع الكود القديم)
 */
export const searchProductsSimple = async (query: string): Promise<ProductData[]> => {
  const results = await searchProducts(query);
  return results.map(r => r.product);
};

export const getProductById = async (id: string): Promise<ProductData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return products.find((p: ProductData) => p.id === id) || null;
  }
};

export const createProduct = async (data: ProductData): Promise<ProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    // Use the provided ID if available, otherwise generate a new one
    const newProduct = { ...data, id: data.id || Date.now().toString() };
    // Check if product with this ID already exists
    const existingIndex = products.findIndex((p: ProductData) => p.id === newProduct.id);
    if (existingIndex >= 0) {
      // Update existing product
      products[existingIndex] = newProduct;
    } else {
      // Add new product
      products.push(newProduct);
    }
    localStorage.setItem('products', JSON.stringify(products));
    return newProduct;
  }
};

export const updateProduct = async (id: string, data: Partial<ProductData>): Promise<ProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex((p: ProductData) => p.id === id);
    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...data };
      localStorage.setItem('products', JSON.stringify(products));
      return products[productIndex];
    }
    throw new Error('Product not found');
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filteredProducts = products.filter((p: ProductData) => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    return true;
  }
};

// Section Content API
export const getSectionContent = async (sectionType: string): Promise<SectionContentData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sectionContent?sectionType=${sectionType}`);
    if (!response.ok) throw new Error('Failed to fetch section content');
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching section content:', error);
    // Fallback to localStorage
    const savedContent = localStorage.getItem(`section_${sectionType}`);
    return savedContent ? JSON.parse(savedContent) : null;
  }
};

export const updateSectionContent = async (sectionType: string, data: SectionContentData): Promise<SectionContentData> => {
  try {
    // First try to get existing content
    const existing = await getSectionContent(sectionType);
    
    if (existing) {
      // Update existing
      const response = await fetch(`${API_BASE_URL}/sectionContent/${existing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update section content');
      return await response.json();
    } else {
      // Create new
      const response = await fetch(`${API_BASE_URL}/sectionContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, sectionType }),
      });
      if (!response.ok) throw new Error('Failed to create section content');
      return await response.json();
    }
  } catch (error) {
    console.error('Error updating section content:', error);
    // Fallback to localStorage
    localStorage.setItem(`section_${sectionType}`, JSON.stringify(data));
    return data;
  }
};

// Search Options API
export const getSearchOptions = async (field?: string): Promise<SearchOptionData[]> => {
  try {
    const url = field ? `${API_BASE_URL}/searchOptions?field=${field}` : `${API_BASE_URL}/searchOptions`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch search options');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search options:', error);
    // Fallback to localStorage
    const savedOptions = localStorage.getItem('searchOptions');
    const options = savedOptions ? JSON.parse(savedOptions) : [];
    return field ? options.filter((opt: SearchOptionData) => opt.field === field) : options;
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
    if (!response.ok) throw new Error('Failed to create search option');
    return await response.json();
  } catch (error) {
    console.error('Error creating search option:', error);
    // Fallback to localStorage
    const options = JSON.parse(localStorage.getItem('searchOptions') || '[]');
    const newOption = { ...data, id: Date.now().toString() };
    options.push(newOption);
    localStorage.setItem('searchOptions', JSON.stringify(options));
    return newOption;
  }
};

export const deleteSearchOption = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete search option');
    return true;
  } catch (error) {
    console.error('Error deleting search option:', error);
    // Fallback to localStorage
    const options = JSON.parse(localStorage.getItem('searchOptions') || '[]');
    const filteredOptions = options.filter((opt: any) => opt.id !== id);
    localStorage.setItem('searchOptions', JSON.stringify(filteredOptions));
    return true;
  }
};

export const deleteSearchOptionByValue = async (field: string, value: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions?field=${field}&value=${value}`);
    if (!response.ok) throw new Error('Failed to fetch search options');
    const options = await response.json();
    
    // Delete all matching options
    for (const option of options) {
      await deleteSearchOption(option.id);
    }
    return true;
  } catch (error) {
    console.error('Error deleting search option by value:', error);
    // Fallback to localStorage
    const options = JSON.parse(localStorage.getItem('searchOptions') || '[]');
    const filteredOptions = options.filter((opt: SearchOptionData) => !(opt.field === field && opt.value === value));
    localStorage.setItem('searchOptions', JSON.stringify(filteredOptions));
    return true;
  }
};

// Car Brands API
export const getCarBrands = async (): Promise<CarBrandData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch car brands');
    return await response.json();
  } catch (error) {
    console.error('Error fetching car brands:', error);
    // Fallback to localStorage if server is not available
    const savedBrands = localStorage.getItem('catalogue_brands');
    if (savedBrands) {
      return JSON.parse(savedBrands);
    }
    return [];
  }
};

// Helper function to compress data before localStorage
const trySetLocalStorage = (key: string, value: any, maxRetries: number = 3): boolean => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const jsonStr = JSON.stringify(value);
      // Check size (localStorage limit is usually ~5-10MB)
      if (jsonStr.length > 4 * 1024 * 1024) { // 4MB warning
        console.warn(`Warning: Data size (${(jsonStr.length / 1024 / 1024).toFixed(2)}MB) is getting large`);
      }
      localStorage.setItem(key, jsonStr);
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Attempting to clean old data...');
        // Try to remove old brands if possible (keep last 50)
        if (Array.isArray(value) && value.length > 50) {
          const reduced = value.slice(-50); // Keep only last 50
          try {
            localStorage.setItem(key, JSON.stringify(reduced));
            console.warn('Reduced brands list to last 50 items');
            return true;
          } catch {
            // If still fails, try clearing old localStorage data
            try {
              localStorage.removeItem('catalogue_brands');
              // Try saving only the new item
              if (value.length > 0) {
                localStorage.setItem(key, JSON.stringify([value[value.length - 1]]));
                console.warn('Saved only the latest brand due to storage limits');
                return true;
              }
            } catch {
              console.error('Unable to save to localStorage. Please clear browser storage or use a database.');
            }
          }
        } else {
          // Try clearing other localStorage data
          try {
            // Clear old brands completely and save only new one
            localStorage.removeItem('catalogue_brands');
            if (Array.isArray(value) && value.length > 0) {
              localStorage.setItem(key, JSON.stringify([value[value.length - 1]]));
              console.warn('Cleared old brands, saved only latest');
              return true;
            }
          } catch {
            console.error('LocalStorage is full. Please clear browser storage.');
          }
        }
      }
      return false;
    }
  }
  return false;
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
    if (!response.ok) throw new Error('Failed to create car brand');
    const newBrand = await response.json();
    // Also update localStorage as backup (with size check)
    const brands = JSON.parse(localStorage.getItem('catalogue_brands') || '[]');
    brands.push(newBrand);
    trySetLocalStorage('catalogue_brands', brands);
    return newBrand;
  } catch (error) {
    console.error('Error creating car brand:', error);
    // Fallback to localStorage with size management
    const brands = JSON.parse(localStorage.getItem('catalogue_brands') || '[]');
    const newBrand = { ...data, id: Date.now().toString() };
    brands.push(newBrand);
    const saved = trySetLocalStorage('catalogue_brands', brands);
    if (!saved) {
      console.error('Failed to save to localStorage. Brand added to state but may not persist after refresh.');
    }
    return newBrand;
  }
};

export const deleteCarBrand = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carBrands/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete car brand');
    // Also update localStorage as backup
    const brands = JSON.parse(localStorage.getItem('catalogue_brands') || '[]');
    const filteredBrands = brands.filter((b: CarBrandData) => b.id !== id);
    localStorage.setItem('catalogue_brands', JSON.stringify(filteredBrands));
    return true;
  } catch (error) {
    console.error('Error deleting car brand:', error);
    // Fallback to localStorage
    const brands = JSON.parse(localStorage.getItem('catalogue_brands') || '[]');
    const filteredBrands = brands.filter((b: CarBrandData) => b.id !== id);
    localStorage.setItem('catalogue_brands', JSON.stringify(filteredBrands));
    return true;
  }
};

export const deleteCarBrandByName = async (name: string): Promise<boolean> => {
  try {
    // First, try to get the brand by name from the server
    const response = await fetch(`${API_BASE_URL}/carBrands?name=${encodeURIComponent(name)}`);
    if (response.ok) {
      const brands = await response.json();
      if (brands.length > 0) {
        return await deleteCarBrand(brands[0].id);
      }
    }
    throw new Error('Brand not found on server');
  } catch (error) {
    console.error('Error deleting car brand by name:', error);
    // Fallback to localStorage
    const brands = JSON.parse(localStorage.getItem('catalogue_brands') || '[]');
    const filteredBrands = brands.filter((b: CarBrandData) => b.name !== name);
    localStorage.setItem('catalogue_brands', JSON.stringify(filteredBrands));
    return true;
  }
};

/**
 * 🔍 الحصول على اقتراحات من العلامات التجارية
 */
export const getBrandSuggestions = async (query: string, limit: number = 3): Promise<any[]> => {
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

/**
 * 🔍 الحصول على اقتراحات من الفئات
 */
export const getCategorySuggestions = async (query: string, limit: number = 3): Promise<string[]> => {
  console.log('🔍 API: Getting category suggestions for:', query);
  try {
    const products = await getProducts();
    const { normalizeText, calculateMatchScore } = await import('@/utils/fuzzySearch');
    const normalizedQuery = normalizeText(query);
    
    // استخراج الفئات الفريدة
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
