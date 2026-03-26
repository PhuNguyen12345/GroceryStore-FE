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

  cancelOrder: async (orderId) => {
    const res = await axiosClient.put(`${API}/${orderId}/cancel`);
    return res.data;
  },

  updateCustomer: async (orderId, customerId) => {
    const res = await axiosClient.put(`${API}/${orderId}/customer`, null, {
      params: { customerId }
    });
    return res.data;
  },

  createQr: async (orderId, payload = {}) => {
    const res = await axiosClient.post(`${API}/${orderId}/create-qr`, payload);
    return res.data;
  },

  getPendingOrders: async () => {
    const res = await axiosClient.get(`${API}/pending`);
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await axiosClient.get(`${API}/${orderId}`);
    return res.data;
  },

  syncPaymentStatus: async (orderId) => {
    const res = await axiosClient.get(`${API}/${orderId}/sync-payment`);
    return res.data;
  },
};
