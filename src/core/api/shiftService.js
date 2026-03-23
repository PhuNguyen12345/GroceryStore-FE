import axiosClient from "@/core/api/axiosClient";

const SHIFT_BASE = "/shifts";

const toPageParams = (page = 0, size = 10) => ({ page, size });

export const shiftService = {
  getAllShifts: async (page = 0, size = 10) => {
    const response = await axiosClient.get(SHIFT_BASE, { params: toPageParams(page, size) });
    return response.data;
  },

  createShift: async (payload) => {
    const response = await axiosClient.post(SHIFT_BASE, payload);
    return response.data;
  },

  updateShift: async (id, payload) => {
    const response = await axiosClient.put(`${SHIFT_BASE}/${id}`, payload);
    return response.data;
  },

  deactivateShift: async (id) => {
    const response = await axiosClient.put(`${SHIFT_BASE}/${id}/deactivate`);
    return response.data;
  },

  activateShift: async (id) => {
    const response = await axiosClient.put(`${SHIFT_BASE}/${id}/activate`);
    return response.data;
  },

  findByName: async (name, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/name`, {
      params: { name, ...toPageParams(page, size) },
    });
    return response.data;
  },

  existByName: async (name) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/exists/by-name`, { params: { name } });
    return response.data;
  },

  findByIsActive: async (isActive, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/active`, {
      params: { isActive, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByNameContainingIgnoreCase: async (keyword, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/contains`, {
      params: { keyword, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByStartTimeGreaterThanEqual: async (startTime, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/start-time-gte`, {
      params: { startTime, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByEndTimeLessThanEqual: async (endTime, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/end-time-lte`, {
      params: { endTime, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findOverlaping: async (startTime, endTime, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/overlapping`, {
      params: { startTime, endTime, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByTimeWithin: async (time, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/time-within`, {
      params: { time, ...toPageParams(page, size) },
    });
    return response.data;
  },

  countByIsActive: async (isActive) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/count/active`, { params: { isActive } });
    return response.data;
  },
};
