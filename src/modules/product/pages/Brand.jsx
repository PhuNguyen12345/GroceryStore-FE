import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, InputGroup, Form, Alert } from "react-bootstrap";
import AdminLayout from "../../../layouts/AdminLayout";
import BrandList from "../components/BrandList";
import BrandForm from "../components/BrandForm";
import { brandService } from "../../../core/api/brandService";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadBrands();
  }, [page]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Đang tải brands...");
      const result = await brandService.getAllBrands(page, 10);
      console.log("Dữ liệu brands:", result);
      setBrands(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải brands:", err);
      setError("Lỗi khi tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadBrands();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await brandService.searchBrands(searchQuery);
      setBrands(result.content || []);
    } catch (err) {
      setError("Lỗi khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

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
      setPage(0); // Reset về trang 1
      await loadBrands(); // Wait cho dữ liệu load xong
      handleCloseForm(); // Rồi đóng modal
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await brandService.deleteBrand(id);
        setSuccess("Xóa thương hiệu thành công");
        loadBrands();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Lỗi khi xóa: " + err.message);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await brandService.restoreBrand(id);
      setSuccess("Khôi phục thương hiệu thành công");
      loadBrands();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Lỗi khi khôi phục: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Quản lý thương hiệu</h2>
          <Button
            variant="success"
            onClick={() => handleOpenForm()}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> Thêm thương hiệu
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  placeholder="Tìm kiếm tên thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline-secondary" type="submit">
                  <FaSearch /> Tìm kiếm
                </Button>
              </InputGroup>
            </Form>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0">
          <Card.Body>
            <BrandList
              brands={brands}
              loading={loading}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          </Card.Body>
        </Card>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <span className="py-2 px-3 bg-light rounded">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      </Container>

      <BrandForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingBrand}
      />
    </AdminLayout>
  );
}
