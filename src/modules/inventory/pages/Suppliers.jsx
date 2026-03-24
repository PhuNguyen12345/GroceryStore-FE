import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Modal, Table } from "react-bootstrap";
import { FaEdit, FaPlus, FaSearch, FaTrash, FaUndo } from "react-icons/fa";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const emptyForm = { name: "", contactPerson: "", phone: "", address: "" };
const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

function getApiErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;

  // BE validation error thường trả object dạng { field: message }
  if (data && typeof data === "object") {
    const firstMessage = Object.values(data).find((value) => typeof value === "string" && value.trim());
    if (firstMessage) return firstMessage;
  }

  return fallback || err?.message || "Đã có lỗi xảy ra";
}

export default function SuppliersPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const pageItems = useMemo(() => getPageItems(Math.max(totalPages, 1), page + 1), [page, totalPages]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await inventoryService.getSuppliers({ name: debouncedSearch, page, size: PAGE_SIZE });
      setItems(res.content || []);
      setTotalPages(Math.max(res.totalPages || 1, 1));
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item?.name || "",
      contactPerson: item?.contactPerson || "",
      phone: item?.phone || "",
      address: item?.address || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };

    if (!payload.name) {
      setFormError("Tên nhà cung cấp là bắt buộc");
      return;
    }

    if (payload.phone && !PHONE_REGEX.test(payload.phone)) {
      setFormError("Số điện thoại không hợp lệ. Định dạng đúng: 0xxxxxxxxx hoặc +84xxxxxxxxx");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      if (editing?.id) {
        await inventoryService.updateSupplier(editing.id, payload);
        setSuccess("Cập nhật nhà cung cấp thành công");
      } else {
        await inventoryService.createSupplier(payload);
        setSuccess("Tạo nhà cung cấp thành công");
      }
      setShowForm(false);
      await loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu nhà cung cấp thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await inventoryService.deleteSupplier(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Đã chuyển nhà cung cấp sang trạng thái ngưng");
      await loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Ngưng nhà cung cấp thất bại"));
    }
  };

  const handleRestore = async (supplier) => {
    if (!supplier?.id) return;

    try {
      await inventoryService.restoreSupplier(supplier.id);
      setSuccess("Đã khôi phục nhà cung cấp");
      await loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Khôi phục nhà cung cấp thất bại"));
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Kho - Nhà cung cấp</h2>
            <p className="text-muted mb-0">Quản lý dữ liệu nhà cung cấp.</p>
          </div>
          <Button onClick={openCreate} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex"><FaPlus size={12} /></span>
            <span>Thêm nhà cung cấp</span>
          </Button>
        </div>

        {error ? <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert> : null}
        {success ? <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert> : null}

        <Card className="admin-panel border-0 mb-4">
          <Card.Body>
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} className="ps-5" placeholder="Tìm nhà cung cấp theo tên..." />
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách nhà cung cấp</h6>
            <Badge bg="light" text="dark">{totalElements} bản ghi</Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            {loading && items.length === 0 ? <Alert variant="info">Đang tải...</Alert> : null}
            {!loading && items.length === 0 ? <Alert variant="warning">Không có nhà cung cấp phù hợp.</Alert> : null}

            {items.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 admin-brand-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên</th>
                      <th>Người liên hệ</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Trạng thái</th>
                      <th className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td>{item.name || "-"}</td>
                        <td>{item.contactPerson || "-"}</td>
                        <td>{item.phone || "-"}</td>
                        <td>{item.address || "-"}</td>
                        <td><Badge bg={item.isActive === false ? "secondary" : "success"}>{item.isActive === false ? "Ngưng" : "Hoạt động"}</Badge></td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline" size="icon-sm" onClick={() => openEdit(item)} title="Sửa">
                              <FaEdit />
                            </Button>
                            {item.isActive === false ? (
                              <Button variant="secondary" size="icon-sm" onClick={() => handleRestore(item)} title="Khôi phục">
                                <FaUndo />
                              </Button>
                            ) : (
                              <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(item)} title="Ngưng">
                                <FaTrash />
                              </Button>
                            )}
                          </div>
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 0) setPage((p) => p - 1); }} className={page === 0 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              {pageItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink href="#" isActive={item === page + 1} onClick={(e) => { e.preventDefault(); setPage(item - 1); }}>{item}</PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages - 1) setPage((p) => p + 1); }} className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Container>

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing ? "Cập nhật nhà cung cấp" : "Tạo nhà cung cấp"}</Modal.Title></Modal.Header>
        <Form onSubmit={submitForm}>
          <Modal.Body>
            {formError ? <Alert variant="danger">{formError}</Alert> : null}
            <Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required maxLength={150} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Người liên hệ</Form.Label><Form.Control value={form.contactPerson} onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))} maxLength={100} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></Form.Group>
            <Form.Group><Form.Label>Địa chỉ</Form.Label><Form.Control value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(deleteTarget)} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận ngưng</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn ngưng nhà cung cấp <strong>{deleteTarget?.name || ""}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button type="button" variant="destructive" onClick={confirmDelete}>Xác nhận</Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
}
