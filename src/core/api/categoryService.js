import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1/categories";

export const categoryService = {
  getAllCategories: async (page = 0, size = 10) => {
    const response = await axios.get(API_BASE, { params: { page, size } });
    return response.data;
  },

  searchCategories: async (name, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { name, page, size },
    });
    return response.data;
  },

  getCategoriesByParent: async (parentId, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE}/parent/${parentId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getCategoryTree: async () => {
    const response = await axios.get(`${API_BASE}/tree`);
    return response.data;
  },

  getCategoryTreeActive: async () => {
    const response = await axios.get(`${API_BASE}/tree/active`);
    return response.data;
  },

  createCategory: async (payload) => {
    const response = await axios.post(API_BASE, payload);
    return response.data;
  },

  updateCategory: async (id, payload) => {
    const response = await axios.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreCategory: async (id) => {
    const response = await axios.put(`${API_BASE}/${id}/restore`);
    return response.data;
  },
};
