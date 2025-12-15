// Search API - PostgreSQL Backend
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    console.warn('⚠️ VITE_API_BASE_URL not set. Using default: http://localhost:5000/api');
    return 'http://localhost:5000/api';
  }
  throw new Error('VITE_API_BASE_URL environment variable is required in production.');
};

const API_BASE_URL = getApiBaseUrl();

export interface SearchOptionData {
  id?: string;
  field: string;
  value: string;
}

export const getSearchOptions = async (field?: string): Promise<SearchOptionData[]> => {
  try {
    const url = field ? `${API_BASE_URL}/searchOptions?field=${field}` : `${API_BASE_URL}/searchOptions`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch search options: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle API response format: { success: true, data: [...] }
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching search options:', error);
    throw error; // Don't fallback to localStorage
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
      throw new Error(`Failed to create search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle API response format: { success: true, data: {...} }
    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error creating search option:', error);
    throw error; // Don't fallback to localStorage
  }
};

export const deleteSearchOption = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/searchOptions/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete search option');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting search option:', error);
    throw error; // Don't fallback to localStorage
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
      throw new Error(`Failed to delete search option: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete search option');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting search option by value:', error);
    throw error; // Don't fallback to localStorage
  }
};
