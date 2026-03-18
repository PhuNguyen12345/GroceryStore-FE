import { useState, useEffect, useCallback } from "react";
import { Container, Card, Alert, Badge, Form, Modal } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import BrandList from "../components/BrandList";
import BrandForm from "../components/BrandForm";
import { brandService } from "../../../core/api/brandService";
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

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const currentPage = page + 1;
  const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

  const loadBrands = useCallback(async (targetPage, keyword) => {
    try {
      setLoading(true);
      setError(null);

      const result = keyword
        ? await brandService.searchBrands(keyword, targetPage, 10)
        : await brandService.getAllBrands(targetPage, 10);

      setBrands(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError("Lỗi khi tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadBrands(page, debouncedSearch);
  }, [page, debouncedSearch, loadBrands]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const handleOpenForm = (brand = null) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, formData);
        setSuccess("Cập nhật thương hiệu thành công");
      } else {
        await brandService.createBrand(formData);
        setSuccess("Tạo thương hiệu thành công");
      }

      setPage(0);
      await loadBrands(0, debouncedSearch);
      handleCloseForm();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await brandService.deleteBrand(deletingId);
      setSuccess("Xóa thương hiệu thành công");
      await loadBrands(page, debouncedSearch);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await brandService.restoreBrand(id);
      setSuccess("Khôi phục thương hiệu thành công");
      await loadBrands(page, debouncedSearch);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${err.message}`);
    }
  };

  const filteredBrands = (brands || []).filter((item) => {
    if (statusFilter === "active") return item.isActive;
    if (statusFilter === "inactive") return !item.isActive;
    return true;
  });

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý thương hiệu</h2>
            <p className="text-muted mb-0">Theo dõi, cập nhật và quản trị thương hiệu sản phẩm.</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm thương hiệu</span>
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
            <div className="admin-search-bar d-flex flex-wrap gap-2">
              <div className="position-relative flex-grow-1">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm kiếm tên thương hiệu..."
                  className="ps-5"
                />
              </div>
              <Form.Select style={{ maxWidth: 220 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Kích hoạt</option>
                <option value="inactive">Tạm dừng</option>
              </Form.Select>
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách thương hiệu</h6>
            <Badge bg="light" text="dark">
              {filteredBrands.length} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <BrandList
              brands={filteredBrands}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
              onRestore={handleRestore}
              page={page}
              pageSize={10}
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

      <BrandForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingBrand}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa thương hiệu này?</Modal.Body>
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
