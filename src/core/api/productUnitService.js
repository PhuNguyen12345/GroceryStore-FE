import axiosClient from "@/core/api/axiosClient";
import publicApiClient from "@/core/api/publicApiClient";

const API_BASE = "/products/units";

export const productUnitService = {
  // Public storefront (used for price lookup)
  getUnitsByProduct: async (productId, page = 0, size = 100) => {
    const response = await publicApiClient.get(`${API_BASE}/product/${productId}`, {
      params: { page, size },
    });
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.content || [];
  },

  searchUnitsByProductName: async (productName) => {
    const response = await publicApiClient.get(`${API_BASE}/search/product`, {
      params: { productName },
    });
    return response.data;
  },

  // Admin product management
  createProductUnit: async (payload) => {
    const response = await axiosClient.post(API_BASE, payload);
    return response.data;
  },

  updateProductUnit: async (id, payload) => {
    const response = await axiosClient.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteProductUnit: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreProductUnit: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/restore/${id}`);
    return response.data;
  },
};
