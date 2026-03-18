import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/brands';
const FILE_API_BASE = 'http://localhost:8080/api/v1/files';
const API_ORIGIN = new URL(API_BASE).origin;

const toAbsoluteMediaUrl = (url) => {
  if (!url) {
    return '';
  }

  const normalizedUrl = String(url).trim().replace(/\\/g, '/');

  if (!normalizedUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith('/')) {
    return `${API_ORIGIN}${normalizedUrl}`;
  }

  return `${API_ORIGIN}/${normalizedUrl}`;
};

const isLocalUploadUrl = (url) => {
  if (!url) {
    return false;
  }

  if (url.startsWith('/uploads/')) {
    return true;
  }

  return url.startsWith(`${API_ORIGIN}/uploads/`);
};

const normalizeBrand = (brand = {}) => {
  const logoUrl = brand.logoUrl
    || brand.logo_url
    || brand.logo
    || brand.imageUrl
    || brand.image_url
    || '';

  return {
    ...brand,
    logoUrl,
  };
};

const normalizePageResponse = (data = {}) => ({
  ...data,
  content: Array.isArray(data.content) ? data.content.map(normalizeBrand) : [],
});

export const brandService = {
  toAbsoluteMediaUrl,

  // Get all brands
  getAllBrands: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(API_BASE, { params: { page, size } });
      return normalizePageResponse(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Search brands
  searchBrands: async (name, page = 0, size = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, { 
        params: { name, page, size } 
      });
      return normalizePageResponse(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Get active brands
  getActiveBrands: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/active`, { params: { page, size } });
      return normalizePageResponse(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Create brand
  createBrand: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update brand
  updateBrand: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Restore brand
  restoreBrand: async (id) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload or replace brand logo image
  uploadBrandLogo: async (file, oldFileUrl = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const hasOldFile = isLocalUploadUrl(oldFileUrl && oldFileUrl.trim());
      const endpoint = hasOldFile ? `${FILE_API_BASE}/replace-image` : `${FILE_API_BASE}/upload-image`;
      const config = hasOldFile
        ? { params: { oldFileUrl } }
        : undefined;

      const response = hasOldFile
        ? await axios.put(endpoint, formData, config)
        : await axios.post(endpoint, formData);

      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
