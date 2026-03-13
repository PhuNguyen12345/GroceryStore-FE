import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";

export default function BrandForm({ show, onHide, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: "", description: "", isActive: true });
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold fs-5">
          {initialData ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên thương hiệu *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thương hiệu"
              required
              maxLength={100}
            />
            <small className="text-muted">Tối đa 100 ký tự</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả thương hiệu"
              rows={3}
              maxLength={1000}
            />
            <small className="text-muted">Tối đa 1000 ký tự</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Kích hoạt"
              checked={formData.isActive}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <Button variant="light" onClick={onHide} className="px-4 fw-medium text-secondary border">
              Huỷ
            </Button>
            <Button variant="primary" type="submit" disabled={loading} className="px-4 fw-medium shadow-sm">
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
