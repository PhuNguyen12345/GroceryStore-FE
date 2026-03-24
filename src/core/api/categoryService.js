import axiosClient from "@/core/api/axiosClient";
import publicApiClient from "@/core/api/publicApiClient";

const API_BASE = "/categories";

export const categoryService = {
  // Admin
  getAllCategories: async (page = 0, size = 10) => {
    const response = await axiosClient.get(API_BASE, { params: { page, size } });
    return response.data;
  },

  searchCategories: async (name, page = 0, size = 10) => {
    const response = await axiosClient.get(`${API_BASE}/search`, {
      params: { name, page, size },
    });
    return response.data;
  },

  getCategoriesByParent: async (parentId, page = 0, size = 10) => {
    const response = await axiosClient.get(`${API_BASE}/parent/${parentId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getCategoryTree: async () => {
    const response = await axiosClient.get(`${API_BASE}/tree`);
    return response.data;
  },

  // Public homepage/storefront
  getCategoryTreeActive: async () => {
    const response = await publicApiClient.get(`${API_BASE}/tree/active`);
    return response.data;
  },

  createCategory: async (payload) => {
    const response = await axiosClient.post(API_BASE, payload);
    return response.data;
  },

  updateCategory: async (id, payload) => {
    const response = await axiosClient.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreCategory: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/${id}/restore`);
    return response.data;
  },
};
