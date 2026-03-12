import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/brands';

export const brandService = {
  // Get all brands
  getAllBrands: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(API_BASE, { params: { page, size } });
      return response.data;
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
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get active brands
  getActiveBrands: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/active`, { params: { page, size } });
      return response.data;
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
  }
};
