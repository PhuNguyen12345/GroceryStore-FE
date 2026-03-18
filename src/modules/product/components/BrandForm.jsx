import { useState, useEffect } from "react";
import { Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brandService } from "../../../core/api/brandService";

const EMPTY_FORM = {
  name: "",
  description: "",
  logoUrl: "",
  isActive: true,
};

export default function BrandForm({ show, onHide, onSubmit, initialData }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    setFormData(initialData || EMPTY_FORM);
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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let nextLogoUrl = formData.logoUrl;

      if (selectedFile) {
        const uploadResult = await brandService.uploadBrandLogo(selectedFile, formData.logoUrl);
        nextLogoUrl = uploadResult.url;
      }

      await onSubmit({ ...formData, logoUrl: nextLogoUrl });
      setFormData(EMPTY_FORM);
      setSelectedFile(null);
      setPreviewUrl("");
      setShowPreviewModal(false);
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
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="fw-semibold">Tên thương hiệu *</Form.Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thương hiệu"
              required
              maxLength={100}
            />
            <small className="text-muted">Tối đa 100 ký tự</small>
          </div>

          <div>
            <Form.Label className="fw-semibold">Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Nhập mô tả thương hiệu"
              rows={3}
              maxLength={1000}
            />
            <small className="text-muted">Tối đa 1000 ký tự</small>
          </div>

          <div>
            <Form.Label className="fw-semibold">Logo</Form.Label>
            <Form.Control
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
            />
            <small className="text-muted">Hỗ trợ JPG, JPEG, PNG, WEBP</small>
            {previewUrl && (
              <div className="mt-2">
                <small className="text-muted">Xem trước:</small>
                <div className="mt-1">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    style={{ height: "64px", objectFit: "contain", cursor: "zoom-in" }}
                    role="button"
                    title="Click de xem anh lon"
                    onClick={() => setShowPreviewModal(true)}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Form.Check
            type="switch"
            name="isActive"
            label="Kích hoạt"
            checked={formData.isActive}
            onChange={handleChange}
          />

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onHide}
              disabled={loading}
              className="admin-cancel-btn"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="admin-save-btn">
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xem anh logo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Logo preview large"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Modal>
  );
}
