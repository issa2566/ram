/**
 * Upload Service
 * 
 * API calls for image upload operations.
 */

import api from './api';
import type { ImageUploadResult } from '../types/common';

/**
 * Upload image file
 */
export const uploadImage = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<ImageUploadResult>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data.url;
};

/**
 * Delete image
 */
export const deleteImage = async (url: string): Promise<void> => {
  await api.delete('/upload/image', {
    data: { url },
  });
};

