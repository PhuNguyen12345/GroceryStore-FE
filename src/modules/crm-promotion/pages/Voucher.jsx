import { useEffect, useState } from "react";
import { Container, Card, Alert, Badge, Modal, Form } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import VoucherList from "../components/VoucherList";
import VoucherForm from "../components/VoucherForm";
import { voucherService } from "../../../core/api/voucherService";
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
const FETCH_SIZE = 1000;

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

function matchesVoucher(voucher, keyword, activeFilter, discountTypeFilter) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const code = voucher.code?.toLowerCase() || "";
  const description = voucher.description?.toLowerCase() || "";

  const matchesSearch =
    !normalizedKeyword ||
    code.includes(normalizedKeyword) ||
    description.includes(normalizedKeyword);

  const matchesActive =
    activeFilter === "all" || String(Boolean(voucher.isActive)) === activeFilter;

  const matchesDiscountType =
    discountTypeFilter === "all" || voucher.discountType === discountTypeFilter;

  return matchesSearch && matchesActive && matchesDiscountType;
}

export default function VoucherPage() {
  const [allVouchers, setAllVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const filteredVouchers = allVouchers.filter((voucher) =>
    matchesVoucher(voucher, searchQuery, activeFilter, discountTypeFilter)
  );
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / PAGE_SIZE));
  const currentPage = Math.min(page + 1, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const vouchers = filteredVouchers.slice(startIndex, startIndex + PAGE_SIZE);
  const pageItems = getPageItems(totalPages, currentPage);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await voucherService.getAllVouchers(0, FETCH_SIZE);
      setAllVouchers(result.content || []);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách voucher"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, activeFilter, discountTypeFilter]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handleOpenForm = (voucher = null) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVoucher(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      await voucherService.saveVoucher(formData);
      setSuccess(editingVoucher ? "Cập nhật voucher thành công" : "Tạo voucher thành công");
      await loadVouchers();
      handleCloseForm();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi: ${getErrorMessage(err, "Không thể lưu voucher")}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await voucherService.deleteVoucher(deletingId);
      setSuccess("Xóa voucher thành công");
      await loadVouchers();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${getErrorMessage(err, "Không thể xóa voucher")}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await voucherService.restoreVoucher(id);
      setSuccess("Khôi phục voucher thành công");
      await loadVouchers();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${getErrorMessage(err, "Không thể khôi phục voucher")}`);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý voucher</h2>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm voucher</span>
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
          <Card.Body>
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
                    placeholder="Tìm kiếm theo mã hoặc mô tả voucher..."
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
                <Form.Select
                  value={discountTypeFilter}
                  onChange={(event) => setDiscountTypeFilter(event.target.value)}
                >
                  <option value="all">Tất cả loại giảm</option>
                  <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                  <option value="PERCENTAGE">Giảm theo phần trăm</option>
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
                    setDiscountTypeFilter("all");
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
            <h6 className="mb-0 fw-semibold">Danh sách voucher</h6>
            <Badge bg="light" text="dark">
              {filteredVouchers.length} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <VoucherList
              vouchers={vouchers}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={setDeletingId}
              onRestore={handleRestore}
              page={currentPage - 1}
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
                    if (currentPage > 1) setPage((prev) => prev - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                    if (currentPage < totalPages) setPage((prev) => prev + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Container>

      <VoucherForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingVoucher}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa voucher này?</Modal.Body>
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
