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
    const response = await axiosClient.patch(`${SHIFT_BASE}/${id}`, payload);
    return response.data;
  },

  deactivateShift: async (id) => {
    const response = await axiosClient.patch(`${SHIFT_BASE}/${id}/deactivate`);
    return response.data;
  },

  activateShift: async (id) => {
    const response = await axiosClient.patch(`${SHIFT_BASE}/${id}/activate`);
    return response.data;
  },

  findByName: async (name, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search/name`, {
      params: { name, ...toPageParams(page, size) },
    });
    return response.data;
  },

  existByName: async (name) => {
    try {
      await axiosClient.get(`${SHIFT_BASE}/name/${encodeURIComponent(name)}`);
      return true;
    } catch {
      return false;
    }
  },

  findByIsActive: async (isActive, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/active`, {
      params: { status: isActive, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByNameContainingIgnoreCase: async (keyword, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/search`, {
      params: { keyword, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByStartTimeGreaterThanEqual: async (startTime, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/starting-from`, {
      params: { time: startTime, ...toPageParams(page, size) },
    });
    return response.data;
  },

  findByEndTimeLessThanEqual: async (endTime, page = 0, size = 10) => {
    const response = await axiosClient.get(`${SHIFT_BASE}/ending-before`, {
      params: { time: endTime, ...toPageParams(page, size) },
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
    const response = await axiosClient.get(`${SHIFT_BASE}/active-at`, {
      params: { time, ...toPageParams(page, size) },
    });
    return response.data;
  },

  countByIsActive: async (isActive) => {
    const [statsRes, allRes] = await Promise.all([
      axiosClient.get(`${SHIFT_BASE}/stats`),
      axiosClient.get(SHIFT_BASE),
    ]);
    const totalActive = Number(statsRes.data?.totalActive || 0);
    if (isActive) return totalActive;
    const total = Array.isArray(allRes.data) ? allRes.data.length : totalActive;
    return Math.max(total - totalActive, 0);
  },
};
