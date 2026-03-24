import axiosClient from "@/core/api/axiosClient";

const API_BASE = "/vouchers";

export const voucherService = {
  getAllVouchers: async (page = 0, size = 10) => {
    const response = await axiosClient.get(API_BASE, {
      params: { page, size },
    });
    return response.data;
  },

  saveVoucher: async (data) => {
    const response = await axiosClient.post(API_BASE, data);
    return response.data;
  },

  getApplicableVouchers: async (orderValue, page = 0, size = 10) => {
    const response = await axiosClient.get(`${API_BASE}/applicable`, {
      params: { orderValue, page, size },
    });
    return response.data;
  },

  deleteVoucher: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreVoucher: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/${id}/restore`);
    return response.data;
  },
};
