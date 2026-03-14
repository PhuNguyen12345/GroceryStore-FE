import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Modal } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import CategoryList from "../components/CategoryList";
import CategoryForm from "../components/CategoryForm";
import { categoryService } from "../../../core/api/categoryService";
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

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parentFilter, setParentFilter] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const currentPage = page + 1;
  const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

  const loadCategoryTree = useCallback(async () => {
    const tree = await categoryService.getCategoryTree();
    setCategoryTree(Array.isArray(tree) ? tree : []);
  }, []);

  const loadCategories = useCallback(async (targetPage, keyword) => {
    try {
      setLoading(true);
      setError(null);

      const result = keyword
        ? await categoryService.searchCategories(keyword, targetPage, 10)
        : parentFilter
          ? await categoryService.getCategoriesByParent(Number(parentFilter), targetPage, 10)
          : await categoryService.getAllCategories(targetPage, 10);

      setCategories(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }, [parentFilter]);

  useEffect(() => {
    loadCategoryTree();
  }, [loadCategoryTree]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadCategories(page, debouncedSearch);
  }, [page, debouncedSearch, loadCategories]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, sortBy, parentFilter]);

  const handleOpenForm = (category = null) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
        setSuccess("Cập nhật danh mục thành công");
      } else {
        await categoryService.createCategory(payload);
        setSuccess("Tạo danh mục thành công");
      }

      setPage(0);
      await Promise.all([loadCategories(0, debouncedSearch), loadCategoryTree()]);
      handleCloseForm();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await categoryService.deleteCategory(deletingId);
      setSuccess("Xóa danh mục thành công");
      await Promise.all([loadCategories(page, debouncedSearch), loadCategoryTree()]);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await categoryService.restoreCategory(id);
      setSuccess("Khôi phục danh mục thành công");
      await Promise.all([loadCategories(page, debouncedSearch), loadCategoryTree()]);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${err.response?.data?.message || err.message}`);
    }
  };

  const displayCategories = useMemo(() => {
    let result = [...categories].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    if (statusFilter === "active") {
      result = result.filter((item) => item.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter((item) => !item.isActive);
    }

    switch (sortBy) {
      case "name_desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi"));
        break;
      case "name_asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
        break;
      case "id_desc":
        result.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "id_asc":
      default:
        result.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }

    return result;
  }, [categories, statusFilter, sortBy]);

  const recordCount = useMemo(() => displayCategories.length, [displayCategories]);

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý danh mục</h2>
            <p className="text-muted mb-0">Theo dõi, cập nhật và tổ chức danh mục sản phẩm.</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm danh mục</span>
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
                  placeholder="Tìm kiếm tên danh mục..."
                  className="ps-5"
                />
              </div>

              <Form.Select style={{ maxWidth: 220 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang kích hoạt</option>
                <option value="inactive">Tạm dừng</option>
              </Form.Select>

              <Form.Select
                style={{ maxWidth: 240 }}
                value={parentFilter}
                onChange={(event) => setParentFilter(event.target.value)}
              >
                <option value="">Tất cả danh mục cha</option>
                {categoryTree.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Select>

              <Form.Select style={{ maxWidth: 220 }} value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
                <option value="id_asc">STT tăng dần</option>
                <option value="id_desc">STT giảm dần</option>
              </Form.Select>

            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách danh mục</h6>
            <Badge bg="light" text="dark">
              {recordCount} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <CategoryList
              categories={displayCategories}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={setDeletingId}
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

      <CategoryForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingCategory}
        categoryTree={categoryTree}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa danh mục này?</Modal.Body>
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
