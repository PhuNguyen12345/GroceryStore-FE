import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1/vouchers";

export const voucherService = {
  getAllVouchers: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(API_BASE, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  saveVoucher: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApplicableVouchers: async (orderValue, page = 0, size = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/applicable`, {
        params: { orderValue, page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteVoucher: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreVoucher: async (id) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
