import axiosClient from "@/core/api/axiosClient";

const DEFAULT_PAGE = { page: 0, size: 10 };

function normalizePage(data = {}) {
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    page: Number.isFinite(data?.page) ? data.page : 0,
    size: Number.isFinite(data?.size) ? data.size : 10,
    totalElements: Number.isFinite(data?.totalElements) ? data.totalElements : 0,
    totalPages: Number.isFinite(data?.totalPages) ? data.totalPages : 1,
  };
}

function normalizeSupplier(item = {}) {
  const normalizedActive =
    typeof item?.isActive === "boolean"
      ? item.isActive
      : typeof item?.active === "boolean"
        ? item.active
        : true;

  return {
    ...item,
    isActive: normalizedActive,
  };
}

function normalizeWarehouse(item = {}) {
  const normalizedActive =
    typeof item?.isActive === "boolean"
      ? item.isActive
      : typeof item?.active === "boolean"
        ? item.active
        : true;

  return {
    ...item,
    isActive: normalizedActive,
  };
}

function withPage(params = {}, page = 0, size = 10) {
  return {
    ...params,
    page,
    size,
  };
}

export const inventoryService = {
  async getSuppliers({ name = "", page = DEFAULT_PAGE.page, size = DEFAULT_PAGE.size } = {}) {
    const response = await axiosClient.get("/suppliers", {
      params: withPage({ name: name || undefined }, page, size),
    });
    const pageData = normalizePage(response.data || {});
    return {
      ...pageData,
      content: pageData.content.map(normalizeSupplier),
    };
  },

  async createSupplier(payload) {
    const response = await axiosClient.post("/suppliers", payload);
    return response.data;
  },

  async updateSupplier(id, payload) {
    const response = await axiosClient.put(`/suppliers/${id}`, payload);
    return response.data;
  },

  async deleteSupplier(id) {
    const response = await axiosClient.delete(`/suppliers/${id}`);
    return response.data;
  },

  async restoreSupplier(id) {
    const response = await axiosClient.put(`/suppliers/${id}/restore`);
    return normalizeSupplier(response.data || {});
  },

  async getWarehouses({ name = "", page = DEFAULT_PAGE.page, size = DEFAULT_PAGE.size } = {}) {
    const response = await axiosClient.get("/warehouses", {
      params: withPage({ name: name || undefined }, page, size),
    });
    const pageData = normalizePage(response.data || {});
    return {
      ...pageData,
      content: pageData.content.map(normalizeWarehouse),
    };
  },

  async createWarehouse(payload) {
    const response = await axiosClient.post("/warehouses", payload);
    return response.data;
  },

  async updateWarehouse(id, payload) {
    const response = await axiosClient.put(`/warehouses/${id}`, payload);
    return response.data;
  },

  async deleteWarehouse(id) {
    const response = await axiosClient.delete(`/warehouses/${id}`);
    return response.data;
  },

  async restoreWarehouse(id) {
    const response = await axiosClient.put(`/warehouses/${id}/restore`);
    return normalizeWarehouse(response.data || {});
  },

  async getBatches({
    batchCode = "",
    productName = "",
    warehouseName = "",
    supplierName = "",
    fromExpiryDate,
    toExpiryDate,
    page = DEFAULT_PAGE.page,
    size = DEFAULT_PAGE.size,
  } = {}) {
    const response = await axiosClient.get("/inventory/batches", {
      params: withPage(
        {
          batchCode: batchCode || undefined,
          productName: productName || undefined,
          warehouseName: warehouseName || undefined,
          supplierName: supplierName || undefined,
          fromExpiryDate: fromExpiryDate || undefined,
          toExpiryDate: toExpiryDate || undefined,
        },
        page,
        size,
      ),
    });

    return normalizePage(response.data || {});
  },

  async getTransactions({
    transactionType = "",
    warehouseName = "",
    employeeName = "",
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortDir = "DESC",
    page = DEFAULT_PAGE.page,
    size = DEFAULT_PAGE.size,
  } = {}) {
    const response = await axiosClient.get("/inventory/transactions", {
      params: withPage(
        {
          transactionType: transactionType || undefined,
          warehouseName: warehouseName || undefined,
          employeeName: employeeName || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          sortBy,
          sortDir,
        },
        page,
        size,
      ),
    });

    return normalizePage(response.data || {});
  },

  async getTransactionDetail(id) {
    const response = await axiosClient.get(`/inventory/transactions/${id}`);
    return response.data;
  },

  async createImportReceipt(payload) {
    const response = await axiosClient.post("/inventory/transactions/import", payload);
    return response.data;
  },

  async createExportReceipt(payload) {
    const response = await axiosClient.post("/inventory/transactions/export", payload);
    return response.data;
  },

  async checkStock(payload) {
    const response = await axiosClient.post("/inventory/stocks/check", payload);
    return response.data;
  },

  async getAvailableStock(productUnitId, warehouseId) {
    const response = await axiosClient.get(`/inventory/stocks/${productUnitId}`, {
      params: { warehouseId },
    });
    return Number(response.data || 0);
  },
};
