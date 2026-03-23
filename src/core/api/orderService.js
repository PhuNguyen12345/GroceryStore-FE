import axios from "axios";

const API = "http://localhost:8080/api/v1/pos/orders";

export const orderService = {

  createOrder: async (employeeId) => {
    const res = await axios.post(`${API}/init`, { employeeId });
    return res.data;
  },

  updateCart: async (orderId, productUnitId, quantity) => {
    const res = await axios.put(`${API}/${orderId}/items`, {
      productUnitId: productUnitId,
      quantity: quantity
    });
    return res.data;
  },

  removeItem: async (orderId, productUnitId) => {
    const res = await axios.delete(`${API}/${orderId}/items/${productUnitId}`);
    return res.data;
  },

  checkout: async (orderId, payload) => {

  const res = await axios.post(
    `${API}/${orderId}/checkout`,
    payload
  );

  return res.data;

}

};