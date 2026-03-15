import { useEffect, useState } from "react";
import { Alert, Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { promotionService } from "../../../core/api/promotionService";

const EMPTY_FORM = {
  id: null,
  name: "",
  description: "",
  bannerUrl: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoString(value) {
  return value ? new Date(value).toISOString() : null;
}

function validatePromotionForm(formData) {
  const errors = {};
  const name = formData.name.trim();
  const description = formData.description.trim();
  const bannerUrl = formData.bannerUrl.trim();

  if (!name) {
    errors.name = "Tên khuyến mãi không được để trống.";
  } else if (name.length > 200) {
    errors.name = "Tên khuyến mãi tối đa 200 ký tự.";
  }

  if (description.length > 1000) {
    errors.description = "Mô tả tối đa 1000 ký tự.";
  }

  if (bannerUrl.length > 500) {
    errors.bannerUrl = "Đường dẫn banner tối đa 500 ký tự.";
  }

  if (!formData.startDate) {
    errors.startDate = "Vui lòng chọn ngày bắt đầu.";
  }

  if (!formData.endDate) {
    errors.endDate = "Vui lòng chọn ngày kết thúc.";
  }

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (Number.isNaN(start.getTime())) {
      errors.startDate = "Ngày bắt đầu không hợp lệ.";
    }

    if (Number.isNaN(end.getTime())) {
      errors.endDate = "Ngày kết thúc không hợp lệ.";
    }

    if (!errors.startDate && !errors.endDate && start >= end) {
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    }
  }

  return errors;
}

export default function PromotionForm({ show, onHide, onSubmit, initialData }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || "",
        description: initialData.description || "",
        bannerUrl: initialData.bannerUrl || "",
        startDate: toDateTimeLocal(initialData.startDate),
        endDate: toDateTimeLocal(initialData.endDate),
        isActive: initialData.isActive ?? true,
      });
      setPreviewUrl(initialData.bannerUrl || "");
      setSelectedFile(null);
      setErrors({});
      setSubmitError(null);
      return;
    }

    setFormData(EMPTY_FORM);
    setPreviewUrl("");
    setSelectedFile(null);
    setErrors({});
    setSubmitError(null);
  }, [initialData, show]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setErrors((prev) => {
      if (!prev.bannerUrl) return prev;
      const next = { ...prev };
      delete next.bannerUrl;
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(formData.bannerUrl || "");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        bannerUrl: "Chỉ hỗ trợ ảnh JPG, JPEG, PNG, WEBP.",
      }));
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validatePromotionForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      let bannerUrl = formData.bannerUrl.trim();

      if (selectedFile) {
        setUploading(true);
        const uploadResponse = await promotionService.uploadBannerImage(selectedFile);
        bannerUrl = uploadResponse?.url || "";
        setUploading(false);
      }

      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        bannerUrl,
        startDate: toIsoString(formData.startDate),
        endDate: toIsoString(formData.endDate),
      });
    } catch (error) {
      const data = error?.response?.data;
      setSubmitError(
        data?.message || (typeof data === "string" && data) || error?.message || "Không thể lưu khuyến mãi."
      );
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
          {submitError && (
            <Alert variant="danger" className="mb-0" onClose={() => setSubmitError(null)} dismissible>
              {submitError}
            </Alert>
          )}

          <div>
            <Form.Label className="fw-semibold">Tên khuyến mãi *</Form.Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên khuyến mãi"
              maxLength={200}
              className={errors.name ? "border-danger focus-visible:ring-danger/30" : ""}
            />
            {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
          </div>

          <div>
            <Form.Label className="fw-semibold">Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả ngắn về khuyến mãi"
              rows={3}
              maxLength={1000}
              isInvalid={Boolean(errors.description)}
            />
            {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
          </div>

          <div>
            <Form.Label className="fw-semibold">Ảnh banner</Form.Label>
            <Form.Control type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} />
            {errors.bannerUrl ? (
              <div className="text-danger small mt-1">{errors.bannerUrl}</div>
            ) : (
              <Form.Text className="text-muted">
                Chọn ảnh JPG, JPEG, PNG hoặc WEBP để tải lên.
              </Form.Text>
            )}
          </div>

          {previewUrl && (
            <div>
              <Form.Label className="fw-semibold">Xem trước banner</Form.Label>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                style={{
                  width: "100%",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "zoom-in",
                }}
              >
                <img
                  src={resolveImageUrl(previewUrl)}
                  alt="Xem trước banner"
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12 }}
                />
              </button>
              <Form.Text className="text-muted">Bấm vào ảnh để xem kích thước lớn hơn.</Form.Text>
            </div>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Label className="fw-semibold">Ngày bắt đầu *</Form.Label>
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`pe-5 text-sm ${errors.startDate ? "border-danger focus-visible:ring-danger/30" : ""}`}
              />
              {errors.startDate && <div className="text-danger small mt-1">{errors.startDate}</div>}
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-semibold">Ngày kết thúc *</Form.Label>
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`pe-5 text-sm ${errors.endDate ? "border-danger focus-visible:ring-danger/30" : ""}`}
              />
              {errors.endDate && <div className="text-danger small mt-1">{errors.endDate}</div>}
            </div>
          </div>

          <Form.Check
            type="switch"
            name="isActive"
            label="Kích hoạt khuyến mãi"
            checked={formData.isActive}
            onChange={handleChange}
          />

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onHide} disabled={loading || uploading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? "Đang tải ảnh..." : loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Xem ảnh banner</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewUrl && (
            <img
              src={resolveImageUrl(previewUrl)}
              alt="Xem trước banner"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Modal>
  );
}
