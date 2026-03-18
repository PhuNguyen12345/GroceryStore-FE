import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1/customers";

export const customerService = {
  getAllCustomers: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(API_BASE, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  saveCustomer: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchCustomers: async ({
    keyword = "",
    isActive,
    tier,
    page = 0,
    size = 10,
  } = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, {
        params: {
          keyword,
          isActive,
          tier,
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreCustomer: async (id) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
