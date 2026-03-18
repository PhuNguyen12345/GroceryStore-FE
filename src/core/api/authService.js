import axiosClient from "@/core/api/axiosClient";

function normalizeRole(role = "") {
  return String(role)
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_");
}

function normalizeLoginResponse(data = {}) {
  const token = data.token || data.accessToken || data.jwt || "";
  const user = data.user || data.account || data.staff || null;
  const role = normalizeRole(data.role || user?.role || user?.authority || "");

  return {
    token,
    user,
    role,
  };
}

export const authService = {
  async login(payload) {
    const response = await axiosClient.post("/auth/login", payload);
    return normalizeLoginResponse(response.data || {});
  },

  async forgotPassword(payload) {
    const response = await axiosClient.post("/auth/forgot-password", payload);

    return {
      message:
        response.data?.message ||
        "Yeu cau dat lai mat khau da duoc gui. Vui long kiem tra email da dang ky.",
    };
  },
};
