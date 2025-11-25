// Search API using JSON Server
const API_BASE_URL = 'http://localhost:3000';

export interface SearchOptionData {
  id?: string;
  field: string;
  value: string;
}

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
