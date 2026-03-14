import axios from "axios";

const PROMOTION_API_BASE = "http://localhost:8080/api/v1/promotions";
const FILE_API_BASE = "http://localhost:8080/api/v1/files";

export const promotionService = {
  getAllPromotions: async (page = 0, size = 10) => {
    try {
      const response = await axios.get(PROMOTION_API_BASE, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadBannerImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${FILE_API_BASE}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  savePromotion: async (data) => {
    try {
      const response = await axios.post(PROMOTION_API_BASE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  filterByActive: async (isActive, page = 0, size = 10) => {
    try {
      const response = await axios.get(`${PROMOTION_API_BASE}/filter/active`, {
        params: { isActive, page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchByName: async (keyword, page = 0, size = 10) => {
    try {
      const response = await axios.get(`${PROMOTION_API_BASE}/search/name`, {
        params: { keyword, page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePromotion: async (id) => {
    try {
      const response = await axios.delete(`${PROMOTION_API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restorePromotion: async (id) => {
    try {
      const response = await axios.put(`${PROMOTION_API_BASE}/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
