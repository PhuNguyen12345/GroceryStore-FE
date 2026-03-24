import axiosClient from "@/core/api/axiosClient";

const API_BASE = "/customers";

export const customerService = {
  getAllCustomers: async (page = 0, size = 10) => {
    const response = await axiosClient.get(API_BASE, {
      params: { page, size },
    });
    return response.data;
  },

  saveCustomer: async (data) => {
    const response = await axiosClient.post(API_BASE, data);
    return response.data;
  },

  searchCustomers: async ({
    keyword = "",
    isActive,
    tier,
    page = 0,
    size = 10,
  } = {}) => {
    const response = await axiosClient.get(`${API_BASE}/search`, {
      params: {
        keyword,
        isActive,
        tier,
        page,
        size,
      },
    });
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreCustomer: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/${id}/restore`);
    return response.data;
  },
};
