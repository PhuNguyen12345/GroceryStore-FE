import axiosClient from "@/core/api/axiosClient";

const API = "/pos/orders";

export const orderService = {
  createOrder: async (employeeId) => {
    const res = await axiosClient.post(`${API}/init`, { employeeId });
    return res.data;
  },

  updateCart: async (orderId, productUnitId, quantity) => {
    const res = await axiosClient.put(`${API}/${orderId}/items`, {
      productUnitId,
      quantity,
    });
    return res.data;
  },

  removeItem: async (orderId, productUnitId) => {
    const res = await axiosClient.delete(`${API}/${orderId}/items/${productUnitId}`);
    return res.data;
  },

  checkout: async (orderId, payload) => {
    const res = await axiosClient.post(`${API}/${orderId}/checkout`, payload);
    return res.data;
  },
};
