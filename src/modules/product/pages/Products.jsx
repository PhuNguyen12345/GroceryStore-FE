import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Modal } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import { productService } from "../../../core/api/productService";
import { categoryService } from "../../../core/api/categoryService";
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

function flattenCategoryTree(nodes, acc = []) {
  nodes.forEach((node) => {
    acc.push({ id: node.id, name: node.name });
    if (node.children?.length) flattenCategoryTree(node.children, acc);
  });
  return acc;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [canUseServerFilter, setCanUseServerFilter] = useState(true);

  const currentPage = page + 1;
  const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

  const loadLookups = useCallback(async () => {
    const [categoryTreeResult, brandResult] = await Promise.all([
      categoryService.getCategoryTree(),
      brandService.getAllBrands(0, 200),
    ]);

    setCategoryTree(Array.isArray(categoryTreeResult) ? categoryTreeResult : []);
    setBrands(brandResult.content || []);
  }, []);

  const loadProducts = useCallback(async (targetPage, keyword, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const statusToApi = filters.statusFilter === "active"
        ? true
        : filters.statusFilter === "inactive"
          ? false
          : "";

      const loadLegacy = async () => {
        if (filters.categoryId) {
          return productService.getProductsByCategory(Number(filters.categoryId), targetPage, 10);
        }
        if (filters.brandId) {
          return productService.getProductsByBrand(Number(filters.brandId), targetPage, 10);
        }
        if (keyword) {
          return productService.searchProducts(keyword, targetPage, 10);
        }
        return productService.getAllProducts(targetPage, 10);
      };

      let result;
      if (canUseServerFilter) {
        try {
          result = await productService.filterProducts(
            {
              name: keyword,
              categoryId: filters.categoryId,
              brandId: filters.brandId,
              isActive: statusToApi,
            },
            targetPage,
            10
          );
        } catch (err) {
          if (err?.response?.status === 404 || err?.response?.status === 403) {
            setCanUseServerFilter(false);
            result = await loadLegacy();
          } else {
            throw err;
          }
        }
      } else {
        result = await loadLegacy();
      }

      setProducts(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(`Lỗi khi tải danh sách sản phẩm: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [canUseServerFilter]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadProducts(page, debouncedSearch, {
      statusFilter,
      categoryId: categoryFilter,
      brandId: brandFilter,
    });
  }, [page, debouncedSearch, statusFilter, categoryFilter, brandFilter, loadProducts]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, categoryFilter, brandFilter]);

  const handleOpenForm = (product = null) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        setSuccess("Cập nhật sản phẩm thành công");
      } else {
        await productService.createProduct(payload);
        setSuccess("Tạo sản phẩm thành công");
      }

      setPage(0);
      await loadProducts(0, debouncedSearch, {
        statusFilter,
        categoryId: categoryFilter,
        brandId: brandFilter,
      });
      handleCloseForm();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await productService.deleteProduct(deletingId);
      setSuccess("Xóa sản phẩm thành công");
      await loadProducts(page, debouncedSearch, {
        statusFilter,
        categoryId: categoryFilter,
        brandId: brandFilter,
      });
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await productService.restoreProduct(id);
      setSuccess("Khôi phục sản phẩm thành công");
      await loadProducts(page, debouncedSearch, {
        statusFilter,
        categoryId: categoryFilter,
        brandId: brandFilter,
      });
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${err.response?.data?.message || err.message}`);
    }
  };

  const categoryOptions = useMemo(() => flattenCategoryTree(categoryTree || []), [categoryTree]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((item) => {
      if (statusFilter === "active" && !item.isActive) return false;
      if (statusFilter === "inactive" && item.isActive) return false;
      if (categoryFilter && String(item.categoryId) !== String(categoryFilter)) return false;
      if (brandFilter && String(item.brandId) !== String(brandFilter)) return false;
      if (debouncedSearch && !String(item.name || "").toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter, brandFilter, debouncedSearch]);

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý sản phẩm</h2>
            <p className="text-muted mb-0">Theo dõi, cập nhật và quản trị sản phẩm bán trong cửa hàng.</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm sản phẩm</span>
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
                  placeholder="Tìm kiếm tên sản phẩm..."
                  className="ps-5"
                />
              </div>

              <Form.Select style={{ maxWidth: 220 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Kích hoạt</option>
                <option value="inactive">Tạm dừng</option>
              </Form.Select>

              <Form.Select style={{ maxWidth: 220 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                {categoryOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Select>

              <Form.Select style={{ maxWidth: 220 }} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
                <option value="">Tất cả thương hiệu</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách sản phẩm</h6>
            <Badge bg="light" text="dark">
              {filteredProducts.length} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <ProductCard
              products={filteredProducts}
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

      <ProductForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingProduct}
        categoryTree={categoryTree}
        brands={brands}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa sản phẩm này?</Modal.Body>
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
