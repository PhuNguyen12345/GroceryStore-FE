import axiosClient from "@/core/api/axiosClient";

const WORK_SCHEDULE_BASE = "/work-schedules";

const toPageParams = (page = 0, size = 10) => ({ page, size });

export const workScheduleService = {
  getAllWorkSchedules: async (page = 0, size = 10) => {
    const response = await axiosClient.get(WORK_SCHEDULE_BASE, { params: toPageParams(page, size) });
    return response.data;
  },

  searchWorkSchedules: async ({ date, employeeId, shiftId, attendanceStatus, page = 0, size = 10 } = {}) => {
    const isPresent = attendanceStatus === "PRESENT" ? true : attendanceStatus === "ABSENT" ? false : undefined;
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/search`, {
      params: {
        from: date || undefined,
        to: date || undefined,
        employeeId: employeeId || undefined,
        shiftId: shiftId || undefined,
        isPresent,
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
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}`, payload);
    return response.data;
  },

  deleteWorkSchedule: async (id) => {
    const response = await axiosClient.delete(`${WORK_SCHEDULE_BASE}/${id}`);
    return response.data;
  },

  validateWorkSchedule: async (payload) => {
    return payload;
  },

  checkIn: async (id) => {
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}/check-in`, {
      checkInTime: new Date().toISOString(),
    });
    return response.data;
  },

  checkOut: async (id, closingCash) => {
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}/check-out`, {
      checkOutTime: new Date().toISOString(),
      closingCash: Number(closingCash),
    });
    return response.data;
  },

  updateOpeningCash: async (id, openingCash) => {
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}/opening-cash`, {
      openingCash: Number(openingCash),
    });
    return response.data;
  },

  markPresent: async (id) => {
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}/mark-present`);
    return response.data;
  },

  markAbsent: async (id) => {
    const response = await axiosClient.patch(`${WORK_SCHEDULE_BASE}/${id}/mark-absent`);
    return response.data;
  },

  countByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/stats/daily`, { params: { date } });
    return response.data?.scheduled ?? 0;
  },

  countPresentByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/stats/daily`, { params: { date } });
    return response.data?.present ?? 0;
  },

  countAbsentByDate: async (date) => {
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/stats/daily`, { params: { date } });
    return response.data?.absent ?? 0;
  },

  countScheduleDays: async (employeeId) => {
    const today = new Date().toISOString().slice(0, 10);
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/stats/employee/${employeeId}`, {
      params: { from: today, to: today },
    });
    return response.data?.scheduledDays ?? 0;
  },

  countAttendedDays: async (employeeId) => {
    const today = new Date().toISOString().slice(0, 10);
    const response = await axiosClient.get(`${WORK_SCHEDULE_BASE}/stats/employee/${employeeId}`, {
      params: { from: today, to: today },
    });
    return response.data?.attendedDays ?? 0;
  },
};
