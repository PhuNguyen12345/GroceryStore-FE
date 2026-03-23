// src/services/api.js (Hoặc đường dẫn tương ứng của bạn)
import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1"; // Đổi lại port nếu cần

export const supplierApi = {
  getAll: () => axios.get(`${API_BASE}/suppliers`),
  create: (data) => axios.post(`${API_BASE}/suppliers`, data),
  update: (id, data) => axios.put(`${API_BASE}/suppliers/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/suppliers/${id}`),
};

export const fileApi = {
  // Gọi vào FileController bạn vừa chụp
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `${API_BASE}/files/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data; // Giả sử Backend trả về { fileUrl: "..." }
  },
};
