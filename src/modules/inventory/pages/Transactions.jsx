import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Badge, Card, Container, Form, Modal, Table } from "react-bootstrap";
import { useAuthStore } from "@/core/store/useAuthStore";
import { FaEye, FaPlus } from "react-icons/fa";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { inventoryService } from "@/core/api/inventoryService";
import { employeeService } from "@/core/api/employeeService";
import { productService } from "@/core/api/productService";
import { productUnitService } from "@/core/api/productUnitService";

const PAGE_SIZE = 10;

function getPageItems(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("ellipsis-left");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

function formatDateTime(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("vi-VN");
}

function emptyImportItem() {
  return { productUnitId: "", quantity: "", importPrice: "", expiryDate: "" };
}

function emptyExportItem() {
  return { productUnitId: "", quantity: "" };
}

export default function TransactionsPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const role = String(useAuthStore((state) => state.role) || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
  const currentEmployeeId = user?.employeeId || user?.id || "";
  const isAdmin = role === "ADMIN";
  const canCreate = role === "ADMIN" || role === "INVENTORY_STAFF";

  const initialFilters = { transactionType: "", warehouseName: "", employeeName: "", fromDate: location.state?.fromDate || "", toDate: location.state?.toDate || "" };
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState("IMPORT");
  const [createSaving, setCreateSaving] = useState(false);

  const [lookupWarehouses, setLookupWarehouses] = useState([]);
  const [lookupSuppliers, setLookupSuppliers] = useState([]);
  const [lookupEmployees, setLookupEmployees] = useState([]);
  const [lookupUnits, setLookupUnits] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [importForm, setImportForm] = useState({ warehouseId: "", supplierId: "", employeeId: "", note: "", items: [emptyImportItem()] });
  const [exportForm, setExportForm] = useState({ warehouseId: "", employeeId: "", notes: "", items: [emptyExportItem()] });

  const pageItems = useMemo(() => getPageItems(Math.max(totalPages, 1), page + 1), [page, totalPages]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await inventoryService.getTransactions({ ...appliedFilters, page, size: PAGE_SIZE, sortBy: "createdAt", sortDir: "DESC" });
      setItems(res.content || []);
      setTotalPages(Math.max(res.totalPages || 1, 1));
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  const loadLookups = useCallback(async () => {
    try {
      setLookupLoading(true);
      const [warehouseRes, supplierRes, employeesRes] = await Promise.all([
        inventoryService.getWarehouses({ page: 0, size: 500 }),
        inventoryService.getSuppliers({ page: 0, size: 500 }),
        employeeService.getAllEmployees(),
      ]);

      setLookupWarehouses(warehouseRes.content || []);
      setLookupSuppliers(supplierRes.content || []);
      const allEmps = Array.isArray(employeesRes) ? employeesRes : [];
      setLookupEmployees(allEmps.filter(e => e.role === "ADMIN" || e.role === "INVENTORY_STAFF"));

      const pageSize = 100;
      let p = 0;
      let total = 1;
      const products = [];
      while (p < total) {
        const pageData = await productService.getAllProducts(p, pageSize);
        products.push(...(Array.isArray(pageData?.content) ? pageData.content : []));
        total = Number.isFinite(pageData?.totalPages) ? pageData.totalPages : p + 1;
        p += 1;
      }

      const unitsByProduct = await Promise.all(products.map(async (product) => {
        try { return await productUnitService.getUnitsByProduct(product.id); } catch { return []; }
      }));
      const mergedUnits = unitsByProduct.flat().filter(Boolean);
      const uniqueUnits = Array.from(new Map(mergedUnits.map((u) => [u.id, u])).values());
      setLookupUnits(uniqueUnits);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu danh mục");
    } finally {
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const applyFilter = (event) => { event.preventDefault(); setPage(0); setAppliedFilters(filters); };
  const resetFilter = () => {
    const reset = { transactionType: "", warehouseName: "", employeeName: "", fromDate: "", toDate: "" };
    setFilters(reset); setAppliedFilters(reset); setPage(0);
  };

  const openDetail = async (id) => {
    try {
      setDetailLoading(true); setShowDetail(true);
      const res = await inventoryService.getTransactionDetail(id);
      setDetail(res);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải chi tiết giao dịch");
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = async (mode) => {
    setCreateMode(mode);
    setShowCreate(true);
    const initialEmployeeId = isAdmin ? "" : String(currentEmployeeId);
    if (mode === "IMPORT") {
      setImportForm({ warehouseId: "", supplierId: "", employeeId: initialEmployeeId, note: "", items: [emptyImportItem()] });
    } else {
      setExportForm({ warehouseId: "", employeeId: initialEmployeeId, notes: "", items: [emptyExportItem()] });
    }
    if (lookupWarehouses.length === 0 || lookupSuppliers.length === 0 || lookupEmployees.length === 0 || lookupUnits.length === 0) {
      await loadLookups();
    }
  };

  const updateImportItem = (index, key, value) => {
    setImportForm((prev) => ({ ...prev, items: prev.items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)) }));
  };
  const updateExportItem = (index, key, value) => {
    setExportForm((prev) => ({ ...prev, items: prev.items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)) }));
  };

  const addImportItem = () => setImportForm((prev) => ({ ...prev, items: [...prev.items, emptyImportItem()] }));
  const removeImportItem = (index) => setImportForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
  const addExportItem = () => setExportForm((prev) => ({ ...prev, items: [...prev.items, emptyExportItem()] }));
  const removeExportItem = (index) => setExportForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));

  const submitCreate = async (event) => {
    event.preventDefault();
    try {
      setCreateSaving(true);
      setError("");

      if (createMode === "IMPORT") {
        const payload = {
          warehouseId: Number(importForm.warehouseId),
          supplierId: Number(importForm.supplierId),
          employeeId: Number(importForm.employeeId),
          note: importForm.note.trim() || null,
          items: importForm.items.map((item) => ({ productUnitId: Number(item.productUnitId), quantity: Number(item.quantity), importPrice: Number(item.importPrice), expiryDate: item.expiryDate || null })).filter((item) => item.productUnitId > 0 && item.quantity > 0 && Number.isFinite(item.importPrice)),
        };

        if (!payload.warehouseId || !payload.supplierId || !payload.employeeId || payload.items.length === 0) {
          setError("Thông tin phiếu nhập chưa đầy đủ");
          setCreateSaving(false);
          return;
        }

        const res = await inventoryService.createImportReceipt(payload);
        setSuccess(res?.message || "Tạo phiếu nhập thành công");
      } else {
        const payload = {
          warehouseId: Number(exportForm.warehouseId),
          employeeId: Number(exportForm.employeeId),
          notes: exportForm.notes.trim() || null,
          items: exportForm.items.map((item) => ({ productUnitId: Number(item.productUnitId), quantity: Number(item.quantity) })).filter((item) => item.productUnitId > 0 && item.quantity > 0),
        };

        if (!payload.warehouseId || !payload.employeeId || payload.items.length === 0) {
          setError("Thông tin phiếu xuất chưa đầy đủ");
          setCreateSaving(false);
          return;
        }

        const res = await inventoryService.createExportReceipt(payload);
        setSuccess(res?.message || "Tạo phiếu xuất thành công");
      }

      setShowCreate(false);
      const initialEmployeeId = isAdmin ? "" : String(currentEmployeeId);
      setImportForm({ warehouseId: "", supplierId: "", employeeId: initialEmployeeId, note: "", items: [emptyImportItem()] });
      setExportForm({ warehouseId: "", employeeId: initialEmployeeId, notes: "", items: [emptyExportItem()] });
      await loadTransactions();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Tạo giao dịch thất bại");
    } finally {
      setCreateSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Kho - Giao dịch</h2>
            <p className="text-muted mb-0">Theo dõi và tạo phiếu nhập xuất kho.</p>
          </div>
          <div className="d-flex gap-2">
            {canCreate ? (
              <>
                <Button onClick={() => openCreateModal("IMPORT")} className="admin-add-btn d-flex align-items-center gap-2"><span className="admin-add-btn-icon d-inline-flex"><FaPlus size={12} /></span><span>Tạo phiếu nhập</span></Button>
                <Button variant="outline" onClick={() => openCreateModal("EXPORT")} className="d-flex align-items-center gap-2"><span className="admin-add-btn-icon d-inline-flex"><FaPlus size={12} /></span><span>Tạo phiếu xuất</span></Button>
              </>
            ) : null}
          </div>
        </div>

        {error ? <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert> : null}
        {success ? <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert> : null}

        <Card className="admin-panel border-0 mb-4">
          <Card.Body>
            <Form onSubmit={applyFilter}>
              <div className="row g-2">
                <div className="col-12 col-md-2">
                  <div className="text-muted small mb-1">Loại GD</div>
                  <Form.Select value={filters.transactionType} onChange={(e) => setFilters((p) => ({ ...p, transactionType: e.target.value }))}><option value="">Tất cả loại</option><option value="IMPORT">IMPORT</option><option value="EXPORT">EXPORT</option></Form.Select>
                </div>
                <div className="col-12 col-md-3">
                  <div className="text-muted small mb-1">Tên kho</div>
                  <Form.Control placeholder="Tên kho" value={filters.warehouseName} onChange={(e) => setFilters((p) => ({ ...p, warehouseName: e.target.value }))} />
                </div>
                <div className="col-12 col-md-3">
                  <div className="text-muted small mb-1">Nhân viên</div>
                  <Form.Control placeholder="Tên nhân viên" value={filters.employeeName} onChange={(e) => setFilters((p) => ({ ...p, employeeName: e.target.value }))} />
                </div>
                <div className="col-12 col-md-2">
                  <div className="text-muted small mb-1">Từ ngày</div>
                  <Form.Control type="date" value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
                </div>
                <div className="col-12 col-md-2">
                  <div className="text-muted small mb-1">Đến ngày</div>
                  <Form.Control type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
                </div>
                <div className="col-12 d-flex gap-2 mt-2"><Button type="submit">Lọc</Button><Button type="button" variant="outline" onClick={resetFilter}>Đặt lại</Button></div>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center"><h6 className="mb-0 fw-semibold">Danh sách giao dịch</h6><Badge bg="light" text="dark">{totalElements} bản ghi</Badge></Card.Header>
          <Card.Body className="pt-1">
            {loading && items.length === 0 ? <Alert variant="info">Đang tải...</Alert> : null}
            {!loading && items.length === 0 ? <Alert variant="warning">Không có giao dịch phù hợp.</Alert> : null}
            {items.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 admin-brand-table">
                  <thead><tr><th>#</th><th>ID</th><th>Loại</th><th>Kho</th><th>Nhân viên</th><th>Ghi chú</th><th>Ngày tạo</th><th className="text-end"></th></tr></thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{page * PAGE_SIZE + index + 1}</td><td>{item.id}</td><td><Badge bg={item.transactionType === "IMPORT" ? "success" : "primary"}>{item.transactionType}</Badge></td><td>{item.warehouseName || "-"}</td><td>{item.employeeName || "-"}</td><td>{item.note || "-"}</td><td>{formatDateTime(item.createdAt)}</td>
                        <td className="text-end">
                          <Button size="icon-sm" variant="outline" onClick={() => openDetail(item.id)} title="Chi tiết">
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : null}
          </Card.Body>
        </Card>

        <div className="admin-pagination mt-4">
          <Pagination><PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 0) setPage((p) => p - 1); }} className={page === 0 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
            {pageItems.map((item) => (<PaginationItem key={item}>{typeof item === "number" ? (<PaginationLink href="#" isActive={item === page + 1} onClick={(e) => { e.preventDefault(); setPage(item - 1); }}>{item}</PaginationLink>) : (<PaginationEllipsis />)}</PaginationItem>))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages - 1) setPage((p) => p + 1); }} className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
          </PaginationContent></Pagination>
        </div>
      </Container>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Chi tiết giao dịch</Modal.Title></Modal.Header>
        <Modal.Body>
          {detailLoading ? <Alert variant="info" className="mb-0">Đang tải chi tiết...</Alert> : null}
          {!detailLoading && detail ? (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-md-4"><strong>ID:</strong> {detail.id}</div>
                <div className="col-md-4"><strong>Loại:</strong> {detail.transactionType}</div>
                <div className="col-md-4"><strong>Ngày tạo:</strong> {formatDateTime(detail.createdAt)}</div>
                <div className="col-md-6"><strong>Kho:</strong> {detail.warehouseName || "-"}</div>
                <div className="col-md-6"><strong>Nhân viên:</strong> {detail.employeeName || "-"}</div>
                <div className="col-12"><strong>Ghi chú:</strong> {detail.note || "-"}</div>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 admin-brand-table">
                  <thead><tr><th>Sản phẩm</th><th>Đơn vị</th><th>Mã lô</th><th>Số lượng</th><th>Giá</th></tr></thead>
                  <tbody>{(detail.items || []).map((row, index) => (<tr key={`${row.batchCode}-${index}`}><td>{row.productName || "-"}</td><td>{row.unitName || "-"}</td><td>{row.batchCode || "-"}</td><td>{row.quantity ?? "-"}</td><td>{row.price ?? "-"}</td></tr>))}</tbody>
                </Table>
              </div>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="xl">
        <Modal.Header closeButton><Modal.Title>{createMode === "IMPORT" ? "Tạo phiếu nhập kho" : "Tạo phiếu xuất kho"}</Modal.Title></Modal.Header>
        <Form onSubmit={submitCreate}>
          <Modal.Body>
            {lookupLoading ? <Alert variant="info">Đang tải dữ liệu danh mục...</Alert> : null}

            {createMode === "IMPORT" ? (
              <div className="d-grid gap-3">
                <div className="row g-2">
                  <div className="col-md-4"><Form.Label>Kho</Form.Label><Form.Select value={importForm.warehouseId} onChange={(e) => setImportForm((p) => ({ ...p, warehouseId: e.target.value }))} required><option value="">Chọn kho</option>{lookupWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Form.Select></div>
                  <div className="col-md-4"><Form.Label>Nhà cung cấp</Form.Label><Form.Select value={importForm.supplierId} onChange={(e) => setImportForm((p) => ({ ...p, supplierId: e.target.value }))} required><option value="">Chọn nhà cung cấp</option>{lookupSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Form.Select></div>
                  <div className="col-md-4"><Form.Label>Nhân viên</Form.Label><Form.Select value={importForm.employeeId} onChange={(e) => setImportForm((p) => ({ ...p, employeeId: e.target.value }))} required disabled={!isAdmin}><option value="">Chọn nhân viên</option>{lookupEmployees.map((e) => <option key={e.id} value={e.id}>{e.fullName || e.username || `Nhân viên ${e.id}`}</option>)}</Form.Select></div>
                </div>
                <Form.Group><Form.Label>Ghi chú</Form.Label><Form.Control value={importForm.note} onChange={(e) => setImportForm((p) => ({ ...p, note: e.target.value }))} /></Form.Group>
                <div className="d-flex justify-content-between align-items-center"><h6 className="mb-0">Danh sách hàng</h6><Button type="button" variant="outline" onClick={addImportItem}>Thêm dòng</Button></div>
                {importForm.items.map((item, index) => (
                  <div className="row g-2" key={index}>
                    <div className="col-md-4"><Form.Select value={item.productUnitId} onChange={(e) => updateImportItem(index, "productUnitId", e.target.value)} required><option value="">Chọn đơn vị sản phẩm</option>{lookupUnits.map((u) => <option key={u.id} value={u.id}>{u.productName} - {u.unitName}</option>)}</Form.Select></div>
                    <div className="col-md-2"><Form.Control type="number" min={1} placeholder="SL" value={item.quantity} onChange={(e) => updateImportItem(index, "quantity", e.target.value)} required /></div>
                    <div className="col-md-2"><Form.Control type="number" min={0} step="0.01" placeholder="Giá nhập" value={item.importPrice} onChange={(e) => updateImportItem(index, "importPrice", e.target.value)} required /></div>
                    <div className="col-md-3"><Form.Control type={item.expiryDate ? "date" : "text"} onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = item.expiryDate ? "date" : "text")} placeholder="Hạn sử dụng" value={item.expiryDate} onChange={(e) => updateImportItem(index, "expiryDate", e.target.value)} /></div>
                    <div className="col-md-1"><Button type="button" variant="destructive" onClick={() => removeImportItem(index)} disabled={importForm.items.length <= 1}>X</Button></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-grid gap-3">
                <div className="row g-2">
                  <div className="col-md-6"><Form.Label>Kho</Form.Label><Form.Select value={exportForm.warehouseId} onChange={(e) => setExportForm((p) => ({ ...p, warehouseId: e.target.value }))} required><option value="">Chọn kho</option>{lookupWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Form.Select></div>
                  <div className="col-md-6"><Form.Label>Nhân viên</Form.Label><Form.Select value={exportForm.employeeId} onChange={(e) => setExportForm((p) => ({ ...p, employeeId: e.target.value }))} required disabled={!isAdmin}><option value="">Chọn nhân viên</option>{lookupEmployees.map((e) => <option key={e.id} value={e.id}>{e.fullName || e.username || `Nhân viên ${e.id}`}</option>)}</Form.Select></div>
                </div>
                <Form.Group><Form.Label>Ghi chú</Form.Label><Form.Control value={exportForm.notes} onChange={(e) => setExportForm((p) => ({ ...p, notes: e.target.value }))} /></Form.Group>
                <div className="d-flex justify-content-between align-items-center"><h6 className="mb-0">Danh sách hàng</h6><Button type="button" variant="outline" onClick={addExportItem}>Thêm dòng</Button></div>
                {exportForm.items.map((item, index) => (
                  <div className="row g-2" key={index}>
                    <div className="col-md-7"><Form.Select value={item.productUnitId} onChange={(e) => updateExportItem(index, "productUnitId", e.target.value)} required><option value="">Chọn đơn vị sản phẩm</option>{lookupUnits.map((u) => <option key={u.id} value={u.id}>{u.productName} - {u.unitName}</option>)}</Form.Select></div>
                    <div className="col-md-4"><Form.Control type="number" min={1} placeholder="SL" value={item.quantity} onChange={(e) => updateExportItem(index, "quantity", e.target.value)} required /></div>
                    <div className="col-md-1"><Button type="button" variant="destructive" onClick={() => removeExportItem(index)} disabled={exportForm.items.length <= 1}>X</Button></div>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button type="submit" disabled={createSaving}>{createSaving ? "Đang lưu..." : "Xác nhận"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
