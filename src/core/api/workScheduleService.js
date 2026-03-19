import axiosClient from "@/core/api/axiosClient";

const WORK_SCHEDULE_BASE = "/work-schedules";

const toPageParams = (page = 0, size = 10) => ({ page, size });

export const workScheduleService = {
  getAllWorkSchedules: async (page = 0, size = 10) => {
    const response = await axiosClient.get(WORK_SCHEDULE_BASE, { params: toPageParams(page, size) });
    return response.data;
  },

  searchWorkSchedules: async ({ date, employeeId, shiftId, attendanceStatus, page = 0, size = 10 } = {}) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/search`, {
      params: {
        date: date || undefined,
        employeeId: employeeId || undefined,
        shiftId: shiftId || undefined,
        attendanceStatus: attendanceStatus || undefined,
        ...toPageParams(page, size),
      },
    });
    return response.data;
  },

  createWorkSchedule: async (payload) => {
    const response = await axiosClient.post(WORK_SCHEDULE_BASE, payload);
    return response.data;
  },

  updateWorkSchedule: async (id, payload) => {
    const response = await axiosClient.put(`${WORK_SCHEDULE_BASE}/${id}`, payload);
    return response.data;
  },

  deleteWorkSchedule: async (id) => {
    const response = await axiosClient.delete(`${WORK_SCHEDULE_BASE}/${id}`);
    return response.data;
  },

  validateWorkSchedule: async (payload) => {
    const response = await axiosClient.post(`${WORK_SCHEDULE_BASE}/validate`, payload);
    return response.data;
  },

  checkIn: async (id) => {
    const response = await axiosClient.put(`${WORK_SCHEDULE_BASE}/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id) => {
    const response = await axiosClient.put(`${WORK_SCHEDULE_BASE}/${id}/check-out`);
    return response.data;
  },

  markPresent: async (id) => {
    const response = await axiosClient.put(`${WORK_SCHEDULE_BASE}/${id}/present`);
    return response.data;
  },

  markAbsent: async (id) => {
    const response = await axiosClient.put(`${WORK_SCHEDULE_BASE}/${id}/absent`);
    return response.data;
  },

  countByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/count/date`, { params: { date } });
    return response.data;
  },

  countPresentByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/count/date/present`, { params: { date } });
    return response.data;
  },

  countAbsentByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/count/date/absent`, { params: { date } });
    return response.data;
  },

  countScheduleDays: async (employeeId) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/count/schedule-days`, {
      params: { employeeId },
    });
    return response.data;
  },

  countAttendedDays: async (employeeId) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/count/attended-days`, {
      params: { employeeId },
    });
    return response.data;
  },
};
