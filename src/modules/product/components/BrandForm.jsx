import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { brandService } from "../../../core/api/brandService";

export default function BrandForm({ show, onHide, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        description: "",
        logoUrl: "",
        isActive: true,
      });
    }
    setSelectedFile(null);
  }, [initialData, show]);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(brandService.toAbsoluteMediaUrl(formData.logoUrl));
  }, [selectedFile, formData.logoUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let nextLogoUrl = formData.logoUrl;

      if (selectedFile) {
        const uploadResult = await brandService.uploadBrandLogo(selectedFile, formData.logoUrl);
        nextLogoUrl = uploadResult.url;
      }

      await onSubmit({ ...formData, logoUrl: nextLogoUrl });
      setFormData({ name: "", description: "", logoUrl: "", isActive: true });
      setSelectedFile(null);
      setPreviewUrl("");
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            <Form.Label>Logo</Form.Label>
            <Form.Control
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
            />
            <small className="text-muted">Hỗ trợ JPG, JPEG, PNG, WEBP</small>
            {previewUrl && (
              <div className="mt-2">
                <small>Xem trước:</small>
                <div>
                  <img src={previewUrl} alt="Logo preview" style={{height: '60px', objectFit: 'contain', marginTop: '5px'}} onError={(e) => e.target.style.display = 'none'} />
                </div>
              </div>
            )}
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

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Huỷ
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
