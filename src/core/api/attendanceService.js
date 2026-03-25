import axiosClient from "@/core/api/axiosClient";

export const attendanceService = {
  getMySchedules: async () => {
    const response = await axiosClient.get("/me/schedule");
    return response.data;
  },

  getMyTodaySchedule: async () => {
    const response = await axiosClient.get("/me/schedule/today");
    return response.data;
  },

  getMySchedulesInRange: async (from, to) => {
    const response = await axiosClient.get("/me/schedule/range", {
      params: { from, to },
    });
    return response.data;
  },

  clockIn: async () => {
    const response = await axiosClient.post("/me/schedule/clock-in");
    return response.data;
  },

  clockOut: async () => {
    const response = await axiosClient.post("/me/schedule/clock-out");
    return response.data;
  },

  getDailyReport: async (date) => {
    const response = await axiosClient.get("/attendance/report/daily", {
      params: { date },
    });
    return response.data;
  },

  getRangeReport: async (from, to) => {
    const response = await axiosClient.get("/attendance/report/range", {
      params: { from, to },
    });
    return response.data;
  },

  getEmployeeHistory: async (employeeId, from, to) => {
    const response = await axiosClient.get(`/attendance/employee/${employeeId}`, {
      params: { from, to },
    });
    return response.data;
  },
};
