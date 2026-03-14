import { useEffect, useState } from "react";
import { Alert, Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  id: null,
  phone: "",
  fullName: "",
  email: "",
  address: "",
};

function validateCustomerForm(formData) {
  const errors = {};
  const phone = formData.phone.trim();
  const fullName = formData.fullName.trim();
  const email = formData.email.trim();
  const address = formData.address.trim();
  const phoneRegex = /^(0(3|5|7|8|9)\d{8}|(\+84|84)(3|5|7|8|9)\d{8})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!phone) {
    errors.phone = "Số điện thoại không được để trống.";
  } else if (!phoneRegex.test(phone)) {
    errors.phone = "Số điện thoại phải đúng định dạng di động Việt Nam.";
  }

  if (fullName.length > 100) {
    errors.fullName = "Họ và tên tối đa 100 ký tự.";
  }

  if (email && !emailRegex.test(email)) {
    errors.email = "Email không đúng định dạng.";
  } else if (email.length > 100) {
    errors.email = "Email tối đa 100 ký tự.";
  }

  if (address.length > 500) {
    errors.address = "Địa chỉ tối đa 500 ký tự.";
  }

  return errors;
}

export default function CustomerForm({
  show,
  onHide,
  onSubmit,
  initialData,
  submitError,
  onClearSubmitError,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setFormData({
        id: initialData.id,
        phone: initialData.phone || "",
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        address: initialData.address || "",
      });
      setErrors({});
      return;
    }

    setFormData(EMPTY_FORM);
    setErrors({});
  }, [initialData, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitError && onClearSubmitError) {
      onClearSubmitError();
    }

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCustomerForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        phone: formData.phone.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClearSubmitError) {
      onClearSubmitError();
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật khách hàng" : "Thêm khách hàng"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
          {submitError && (
            <Alert variant="danger" className="mb-0" onClose={onClearSubmitError} dismissible>
              {submitError}
            </Alert>
          )}

          <div>
            <Form.Label className="fw-semibold">Số điện thoại *</Form.Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className={errors.phone ? "border-danger focus-visible:ring-danger/30" : ""}
            />
            {errors.phone ? (
              <div className="text-danger small mt-1">{errors.phone}</div>
            ) : (
              <Form.Text className="text-muted">Ví dụ: 0987654321 hoặc 84987654321.</Form.Text>
            )}
          </div>

          <div>
            <Form.Label className="fw-semibold">Họ và tên</Form.Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên khách hàng"
              maxLength={100}
              className={errors.fullName ? "border-danger focus-visible:ring-danger/30" : ""}
            />
            {errors.fullName && (
              <div className="text-danger small mt-1">{errors.fullName}</div>
            )}
          </div>

          <div>
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              maxLength={100}
              className={errors.email ? "border-danger focus-visible:ring-danger/30" : ""}
            />
            {errors.email && (
              <div className="text-danger small mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <Form.Label className="fw-semibold">Địa chỉ</Form.Label>
            <Form.Control
              as="textarea"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ khách hàng"
              rows={3}
              maxLength={500}
              isInvalid={Boolean(errors.address)}
            />
            {errors.address && (
              <div className="text-danger small mt-1">{errors.address}</div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
