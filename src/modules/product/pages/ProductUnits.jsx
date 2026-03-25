import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Container, Modal } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";
import ProductUnitList from "../components/ProductUnitList";
import ProductUnitForm from "../components/ProductUnitForm";
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
  for (let i = start; i <= end; i += 1) pages.push(i);

  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

export default function ProductUnitsPage() {
  const [products, setProducts] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      const firstPage = await productService.getAllProducts(0, 300);
      setProducts(firstPage.content || []);
    } catch {
      setError("Lỗi khi tải danh sách sản phẩm");
    }
  }, []);

  const loadAllUnits = useCallback(async (productList) => {
    if (!productList?.length) {
      setAllUnits([]);
      setUnits([]);
      return;
    }

    const responses = await Promise.all(
      productList.map((product) => productUnitService.getUnitsByProduct(product.id))
    );

    const merged = responses.flat().filter(Boolean);
    const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());

    setAllUnits(uniqueById);
    return uniqueById;
  }, []);

  const searchByProductName = useCallback(async (keyword) => {
    const data = await productUnitService.searchUnitsByProductName(keyword);
    setUnits(data || []);
  }, []);

  const refreshUnits = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setError(null);

      const loadedAll = await loadAllUnits(products);
      const normalizedKeyword = String(keyword || "").trim();

      if (normalizedKeyword) {
        await searchByProductName(normalizedKeyword);
      } else {
        setUnits(loadedAll || []);
      }
    } catch (err) {
      setError(`Lỗi khi tải đơn vị sản phẩm: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [loadAllUnits, products, searchByProductName]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!products.length) {
      setAllUnits([]);
      setUnits([]);
      return;
    }

    refreshUnits("");
  }, [products, refreshUnits]);

  useEffect(() => {
    if (!products.length) return;

    const keyword = searchQuery.trim();
    const timer = setTimeout(async () => {
      try {
        setError(null);

        if (!keyword) {
          setUnits(allUnits);
          return;
        }

        await searchByProductName(keyword);
      } catch (err) {
        setError(`Lỗi khi tìm kiếm đơn vị sản phẩm: ${err.response?.data?.message || err.message}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allUnits, products, searchByProductName]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(units.length / PAGE_SIZE));
  const currentPage = Math.min(page + 1, totalPages);
  const pageItems = getPageItems(totalPages, currentPage);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedUnits = units.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handleOpenForm = (unit = null) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUnit(null);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingUnit) {
        await productUnitService.updateProductUnit(editingUnit.id, payload);
        setSuccess("Cập nhật đơn vị sản phẩm thành công");
      } else {
        await productUnitService.createProductUnit(payload);
        setSuccess("Thêm đơn vị sản phẩm thành công");
      }

      await refreshUnits(searchQuery);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await productUnitService.deleteProductUnit(deletingId);
      setSuccess("Xóa đơn vị sản phẩm thành công");
      await refreshUnits(searchQuery);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await productUnitService.restoreProductUnit(id);
      setSuccess("Khôi phục đơn vị sản phẩm thành công");
      await refreshUnits(searchQuery);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(`Lỗi khi khôi phục: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý đơn vị sản phẩm</h2>
            <p className="text-muted mb-0">Thiết lập đơn vị bán cho từng sản phẩm: lon, chai, thùng...</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="admin-add-btn d-flex align-items-center gap-2">
            <span className="admin-add-btn-icon d-inline-flex">
              <FaPlus size={12} />
            </span>
            <span>Thêm đơn vị</span>
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
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên sản phẩm..."
                className="ps-5"
              />
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách đơn vị</h6>
            <Badge bg="light" text="dark">
              {units.length} bản ghi
            </Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            <ProductUnitList
              units={pagedUnits}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={setDeletingId}
              onRestore={handleRestore}
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

      <ProductUnitForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingUnit}
        products={products}
        selectedProductId={editingUnit?.productId || ""}
      />

      <Modal show={Boolean(deletingId)} onHide={() => setDeletingId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa đơn vị sản phẩm này?</Modal.Body>
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
