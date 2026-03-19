import axiosClient from "@/core/api/axiosClient";

const EMPLOYEE_BASE = "/employees";

const toPageParams = (page = 0, size = 10) => ({ page, size });

export const employeeService = {
  getAllEmployees: async (page = 0, size = 10) => {
    const response = await axiosClient.get(EMPLOYEE_BASE, { params: toPageParams(page, size) });
    return response.data;
  },

  createEmployee: async (payload) => {
    const response = await axiosClient.post(EMPLOYEE_BASE, payload);
    return response.data;
  },

  updateEmployee: async (id, payload) => {
    const response = await axiosClient.put(`${EMPLOYEE_BASE}/${id}`, payload);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await axiosClient.delete(`${EMPLOYEE_BASE}/${id}`);
    return response.data;
  },

  activateEmployee: async (id) => {
    const response = await axiosClient.put(`${EMPLOYEE_BASE}/${id}/activate`);
    return response.data;
  },

  deactivateEmployee: async (id) => {
    const response = await axiosClient.put(`${EMPLOYEE_BASE}/${id}/deactivate`);
    return response.data;
  },

  searchEmployees: async ({ keyword = "", role = "", isActive, page = 0, size = 10 } = {}) => {
    const response = await axiosClient.get(`${EMPLOYEE_BASE}/search`, {
      params: {
        keyword: keyword || undefined,
        role: role || undefined,
        isActive,
        ...toPageParams(page, size),
      },
    });
    return response.data;
  },

  findByRole: async (role, page = 0, size = 10) => {
    const response = await axiosClient.get(`${EMPLOYEE_BASE}/search/role`, {
      params: { role, ...toPageParams(page, size) },
    });
    return response.data;
  },

  countByRole: async (role) => {
    const response = await axiosClient.get(`${EMPLOYEE_BASE}/count/role`, { params: { role } });
    return response.data;
  },

  countActive: async () => {
    const response = await axiosClient.get(`${EMPLOYEE_BASE}/count/active`);
    return response.data;
  },
};
