import { useEffect, useState } from "react";
import { Container, Card, Alert, Badge, Modal, Form } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import CustomerList from "../components/CustomerList";
import CustomerForm from "../components/CustomerForm";
import { customerService } from "../../../core/api/customerService";
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

const PAGE_SIZE = 10;

function getPageItems(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push("ellipsis-left");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  return fallback || err?.message || "Đã có lỗi xảy ra";
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const keyword = searchQuery.trim();
  const hasFilter = activeFilter !== "all" || tierFilter !== "all";
  const shouldUseSearch = Boolean(keyword) || hasFilter;
  const currentPage = page + 1;
  const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

  const loadCustomers = async (targetPage = page) => {
    try {
      setLoading(true);
      setError(null);

      const result = shouldUseSearch
        ? await customerService.searchCustomers({
            keyword,
            isActive: activeFilter === "all" ? undefined : activeFilter === "true",
            tier: tierFilter === "all" ? undefined : tierFilter,
            page: targetPage,
            size: PAGE_SIZE,
          })
        : await customerService.getAllCustomers(targetPage, PAGE_SIZE);

      setCustomers(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách khách hàng"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(page);
    }, shouldUseSearch && keyword ? 350 : 0);

    return () => clearTimeout(timer);
  }, [page, keyword, activeFilter, tierFilter, shouldUseSearch]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, activeFilter, tierFilter]);

  const handleOpenForm = (customer = null) => {
    setEditingCustomer(customer);
    setFormError(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormError(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      await customerService.saveCustomer(formData);
      setFormError(null);
      setSuccess(editingCustomer ? "Cập nhật khách hàng thành công" : "Thêm khách hàng thành công");
      await loadCustomers(page);
      handleCloseForm();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setFormError(getErrorMessage(err, "Không thể lưu khách hàng"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await customerService.deleteCustomer(deletingId);
      setSuccess("Xóa khách hàng thành công");
      await loadCustomers(page);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${getErrorMessage(err, "Không thể xóa khách hàng")}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await customerService.restoreCustomer(id);
      setSuccess("Khôi phục khách hàng thành công");
      await loadCustomers(page);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${getErrorMessage(err, "Không thể khôi phục khách hàng")}`);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý khách hàng</h2>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm khách hàng</span>
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}

        <Card className="admin-panel border-0 mb-4">
          <Card.Body className="d-flex flex-column gap-3">
            <div className="row g-3">
              <div className="col-lg-4">
                <div className="position-relative">
                  <FaSearch
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                    size={14}
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm kiếm theo họ tên, số điện thoại hoặc email..."
                    className="ps-5"
                  />
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <Form.Select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="true">Kích hoạt</option>
                  <option value="false">Tạm dừng</option>
                </Form.Select>
              </div>
              <div className="col-md-6 col-lg-2">
                <Form.Select value={tierFilter} onChange={(event) => setTierFilter(event.target.value)}>
                  <option value="all">Tất cả hạng khách hàng</option>
                  <option value="BRONZE">Đồng</option>
                  <option value="SILVER">Bạc</option>
                  <option value="GOLD">Vàng</option>
                  <option value="DIAMOND">Kim cương</option>
                </Form.Select>
              </div>
              <div className="col-md-6 col-lg-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-100"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                    setTierFilter("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách khách hàng</h6>
            <Badge bg="light" text="dark">
              {customers.length} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <CustomerList
              customers={customers}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={setDeletingId}
              onRestore={handleRestore}
              page={page}
              size={PAGE_SIZE}
            />
          </Card.Body>
        </Card>

        <div className="admin-pagination mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page > 0) setPage((prev) => prev - 1);
                  }}
                  className={page === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {pageItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(item - 1);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page < totalPages - 1) setPage((prev) => prev + 1);
                  }}
                  className={page >= totalPages - 1 || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Container>

      <CustomerForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingCustomer}
        submitError={formError}
        onClearSubmitError={() => setFormError(null)}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa khách hàng này?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
}
