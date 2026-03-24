import axiosClient from "@/core/api/axiosClient";
import publicApiClient from "@/core/api/publicApiClient";

const API_BASE = "/products";
const FILE_API_BASE = "/files";
const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api/v1").origin;

const toAbsoluteMediaUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

const isLocalUploadUrl = (url) => {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return true;
  return url.startsWith(`${API_ORIGIN}/uploads/`);
};

export const productService = {
  toAbsoluteMediaUrl,

  // Public storefront
  getAllProducts: async (page = 0, size = 10) => {
    const response = await publicApiClient.get(API_BASE, { params: { page, size } });
    return response.data;
  },

  searchProducts: async (name, page = 0, size = 10) => {
    const response = await publicApiClient.get(`${API_BASE}/search`, {
      params: { name, page, size },
    });
    return response.data;
  },

  getProductsByCategory: async (categoryId, page = 0, size = 10) => {
    const response = await publicApiClient.get(`${API_BASE}/category/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getProductsByBrand: async (brandId, page = 0, size = 10) => {
    const response = await publicApiClient.get(`${API_BASE}/brand/${brandId}`, {
      params: { page, size },
    });
    return response.data;
  },

  // Admin product management
  createProduct: async (payload) => {
    const response = await axiosClient.post(API_BASE, payload);
    return response.data;
  },

  updateProduct: async (id, payload) => {
    const response = await axiosClient.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreProduct: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/restore/${id}`);
    return response.data;
  },

  uploadProductImage: async (file, oldFileUrl = "") => {
    const formData = new FormData();
    formData.append("file", file);

    const hasOldFile = isLocalUploadUrl(oldFileUrl && oldFileUrl.trim());
    const endpoint = hasOldFile ? `${FILE_API_BASE}/replace-image` : `${FILE_API_BASE}/upload-image`;

    const response = hasOldFile
      ? await axiosClient.put(endpoint, formData, { params: { oldFileUrl } })
      : await axiosClient.post(endpoint, formData);

    return response.data;
  },
};
