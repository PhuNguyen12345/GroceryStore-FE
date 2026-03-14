import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Modal } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";
import ProductUnitList from "../components/ProductUnitList";
import ProductUnitForm from "../components/ProductUnitForm";
import { Button } from "@/components/ui/button";

export default function ProductUnitsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const sortedProducts = useMemo(
    () => [...(products || [])].sort((a, b) => String(a.name).localeCompare(String(b.name), "vi")),
    [products]
  );

  const loadProducts = useCallback(async () => {
    try {
      const firstPage = await productService.getAllProducts(0, 300);
      setProducts(firstPage.content || []);
    } catch {
      setError("Lỗi khi tải danh sách sản phẩm");
    }
  }, []);

  const loadUnits = useCallback(async (productId) => {
    if (!productId) {
      setUnits([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productUnitService.getUnitsByProduct(productId);
      setUnits(data || []);
    } catch (err) {
      setError(`Lỗi khi tải đơn vị sản phẩm: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadUnits(selectedProductId);
  }, [selectedProductId, loadUnits]);

  const handleOpenForm = (unit = null) => {
    if (!selectedProductId && !unit) {
      setError("Vui lòng chọn sản phẩm trước khi thêm đơn vị");
      return;
    }
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
      await loadUnits(payload.productId || selectedProductId);
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
      await loadUnits(selectedProductId);
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
      await loadUnits(selectedProductId);
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
            <Form.Select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
              <option value="">Chọn sản phẩm để xem đơn vị</option>
              {sortedProducts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Form.Select>
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
            <ProductUnitList units={units} loading={loading} onEdit={handleOpenForm} onDelete={setDeletingId} onRestore={handleRestore} />
          </Card.Body>
        </Card>
      </Container>

      <ProductUnitForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingUnit}
        products={products}
        selectedProductId={selectedProductId}
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
