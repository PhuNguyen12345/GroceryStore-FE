import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1/products/units";

export const productUnitService = {
  getUnitsByProduct: async (productId) => {
    const response = await axios.get(`${API_BASE}/product/${productId}`);
    return response.data;
  },

  createProductUnit: async (payload) => {
    const response = await axios.post(API_BASE, payload);
    return response.data;
  },

  updateProductUnit: async (id, payload) => {
    const response = await axios.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteProductUnit: async (id) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreProductUnit: async (id) => {
    const response = await axios.put(`${API_BASE}/restore/${id}`);
    return response.data;
  },
};

