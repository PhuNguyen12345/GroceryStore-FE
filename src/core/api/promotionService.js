import axiosClient from "@/core/api/axiosClient";
import publicApiClient from "@/core/api/publicApiClient";

const PROMOTION_API_BASE = "/promotions";
const FILE_API_BASE = "/files";

export const promotionService = {
  // Admin
  getAllPromotions: async (page = 0, size = 10) => {
    const response = await axiosClient.get(PROMOTION_API_BASE, {
      params: { page, size },
    });
    return response.data;
  },

  // Public homepage/storefront
  getActivePromotions: async (page = 0, size = 10) => {
    const response = await publicApiClient.get(`${PROMOTION_API_BASE}/filter/active`, {
      params: { isActive: true, page, size },
    });
    return response.data;
  },

  uploadBannerImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post(`${FILE_API_BASE}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  savePromotion: async (data) => {
    const response = await axiosClient.post(PROMOTION_API_BASE, data);
    return response.data;
  },

  filterByActive: async (isActive, page = 0, size = 10) => {
    const response = await axiosClient.get(`${PROMOTION_API_BASE}/filter/active`, {
      params: { isActive, page, size },
    });
    return response.data;
  },

  searchByName: async (keyword, page = 0, size = 10) => {
    const response = await axiosClient.get(`${PROMOTION_API_BASE}/search/name`, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  deletePromotion: async (id) => {
    const response = await axiosClient.delete(`${PROMOTION_API_BASE}/${id}`);
    return response.data;
  },

  restorePromotion: async (id) => {
    const response = await axiosClient.put(`${PROMOTION_API_BASE}/${id}/restore`);
    return response.data;
  },
};
