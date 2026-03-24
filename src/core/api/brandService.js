import axiosClient from "@/core/api/axiosClient";

const API_BASE = "/brands";
const FILE_API_BASE = "/files";
const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api/v1").origin;

const toAbsoluteMediaUrl = (url) => {
  if (!url) {
    return "";
  }

  const normalizedUrl = String(url).trim().replace(/\\/g, "/");

  if (!normalizedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith("/")) {
    return `${API_ORIGIN}${normalizedUrl}`;
  }

  return `${API_ORIGIN}/${normalizedUrl}`;
};

const isLocalUploadUrl = (url) => {
  if (!url) {
    return false;
  }

  if (url.startsWith("/uploads/")) {
    return true;
  }

  return url.startsWith(`${API_ORIGIN}/uploads/`);
};

const normalizeBrand = (brand = {}) => {
  const logoUrl = brand.logoUrl
    || brand.logo_url
    || brand.logo
    || brand.imageUrl
    || brand.image_url
    || "";

  return {
    ...brand,
    logoUrl,
  };
};

const normalizePageResponse = (data = {}) => ({
  ...data,
  content: Array.isArray(data.content) ? data.content.map(normalizeBrand) : [],
});

export const brandService = {
  toAbsoluteMediaUrl,

  getAllBrands: async (page = 0, size = 10) => {
    const response = await axiosClient.get(API_BASE, { params: { page, size } });
    return normalizePageResponse(response.data);
  },

  searchBrands: async (name, page = 0, size = 10) => {
    const response = await axiosClient.get(`${API_BASE}/search`, {
      params: { name, page, size },
    });
    return normalizePageResponse(response.data);
  },

  getActiveBrands: async (page = 0, size = 10) => {
    const response = await axiosClient.get(`${API_BASE}/active`, { params: { page, size } });
    return normalizePageResponse(response.data);
  },

  createBrand: async (data) => {
    const response = await axiosClient.post(API_BASE, data);
    return response.data;
  },

  updateBrand: async (id, data) => {
    const response = await axiosClient.put(`${API_BASE}/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await axiosClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  restoreBrand: async (id) => {
    const response = await axiosClient.put(`${API_BASE}/${id}/restore`);
    return response.data;
  },

  uploadBrandLogo: async (file, oldFileUrl = "") => {
    const formData = new FormData();
    formData.append("file", file);

    const hasOldFile = isLocalUploadUrl(oldFileUrl && oldFileUrl.trim());
    const endpoint = hasOldFile ? `${FILE_API_BASE}/replace-image` : `${FILE_API_BASE}/upload-image`;
    const config = hasOldFile
      ? { params: { oldFileUrl } }
      : undefined;

    const response = hasOldFile
      ? await axiosClient.put(endpoint, formData, config)
      : await axiosClient.post(endpoint, formData);

    return response.data;
  },
};
