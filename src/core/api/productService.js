import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1/products";
const FILE_API_BASE = "http://localhost:8080/api/v1/files";
const API_ORIGIN = new URL(API_BASE).origin;

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

  getAllProducts: async (page = 0, size = 10) => {
    const response = await axios.get(API_BASE, { params: { page, size } });
    return response.data;
  },

  searchProducts: async (name, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { name, page, size },
    });
    return response.data;
  },

  filterProducts: async ({ name = "", categoryId = "", brandId = "", isActive = "" } = {}, page = 0, size = 10) => {
    const params = { page, size };
    const trimmedName = String(name || "").trim();

    if (trimmedName) params.name = trimmedName;
    if (categoryId !== "" && categoryId != null) params.categoryId = Number(categoryId);
    if (brandId !== "" && brandId != null) params.brandId = Number(brandId);
    if (isActive !== "" && isActive != null) params.isActive = isActive;

    const response = await axios.get(`${API_BASE}/filter`, { params });
    return response.data;
  },

  getProductsByCategory: async (categoryId, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE}/category/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getProductsByBrand: async (brandId, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE}/brand/${brandId}`, {
      params: { page, size },
    });
    return response.data;
  },

  createProduct: async (payload) => {
    const response = await axios.post(API_BASE, payload);
    return response.data;
  },

  updateProduct: async (id, payload) => {
    const response = await axios.put(`${API_BASE}/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreProduct: async (id) => {
    const response = await axios.put(`${API_BASE}/restore/${id}`);
    return response.data;
  },

  uploadProductImage: async (file, oldFileUrl = "") => {
    const formData = new FormData();
    formData.append("file", file);

    const hasOldFile = isLocalUploadUrl(oldFileUrl && oldFileUrl.trim());
    const endpoint = hasOldFile ? `${FILE_API_BASE}/replace-image` : `${FILE_API_BASE}/upload-image`;

    const response = hasOldFile
      ? await axios.put(endpoint, formData, { params: { oldFileUrl } })
      : await axios.post(endpoint, formData);

    return response.data;
  },
};
