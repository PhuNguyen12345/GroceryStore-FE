import { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  id: null,
  code: "",
  quantityLimit: 100,
  minOrderValue: 0,
  description: "",
  discountType: "FIXED_AMOUNT",
  discountValue: 0,
  startDate: "",
  endDate: "",
  isActive: true,
};

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

function validateVoucherForm(formData) {
  const errors = {};
  const code = formData.code.trim();
  const description = formData.description.trim();
  const quantityLimit = Number(formData.quantityLimit);
  const minOrderValue = Number(formData.minOrderValue);
  const discountValue = Number(formData.discountValue);

  if (!code) {
    errors.code = "Mã voucher không được để trống.";
  } else if (code.length > 20) {
    errors.code = "Mã voucher tối đa 20 ký tự.";
  }

  if (description.length > 500) {
    errors.description = "Mô tả tối đa 500 ký tự.";
  }

  if (!formData.discountType) {
    errors.discountType = "Vui lòng chọn hình thức giảm giá.";
  }

  if (Number.isNaN(discountValue)) {
    errors.discountValue = "Giá trị giảm không hợp lệ.";
  } else if (discountValue <= 0) {
    errors.discountValue = "Giá trị giảm phải lớn hơn 0.";
  } else if (formData.discountType === "PERCENTAGE" && discountValue > 100) {
    errors.discountValue = "Giảm theo phần trăm không được vượt quá 100.";
  }

  if (Number.isNaN(quantityLimit)) {
    errors.quantityLimit = "Số lượng voucher không hợp lệ.";
  } else if (quantityLimit < 1) {
    errors.quantityLimit = "Số lượng voucher phải lớn hơn hoặc bằng 1.";
  }

  if (Number.isNaN(minOrderValue)) {
    errors.minOrderValue = "Giá trị đơn tối thiểu không hợp lệ.";
  } else if (minOrderValue < 0) {
    errors.minOrderValue = "Giá trị đơn tối thiểu phải lớn hơn hoặc bằng 0.";
  }

  if (!formData.startDate) {
    errors.startDate = "Vui lòng chọn ngày bắt đầu áp dụng.";
  }

  if (!formData.endDate) {
    errors.endDate = "Vui lòng chọn ngày kết thúc áp dụng.";
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

export default function VoucherForm({ show, onHide, onSubmit, initialData }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setFormData({
        id: initialData.id,
        code: initialData.code || "",
        quantityLimit: initialData.quantityLimit ?? 100,
        minOrderValue: initialData.minOrderValue ?? 0,
        description: initialData.description || "",
        discountType: initialData.discountType || "FIXED_AMOUNT",
        discountValue: initialData.discountValue ?? 0,
        startDate: toDateTimeLocal(initialData.startDate),
        endDate: toDateTimeLocal(initialData.endDate),
        isActive: initialData.isActive ?? true,
      });
      setErrors({});
      return;
    }

    setFormData(EMPTY_FORM);
    setErrors({});
  }, [initialData, show]);

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateVoucherForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        code: formData.code.trim(),
        description: formData.description.trim(),
        quantityLimit: Number(formData.quantityLimit),
        minOrderValue: Number(formData.minOrderValue),
        discountValue: Number(formData.discountValue),
        startDate: toIsoString(formData.startDate),
        endDate: toIsoString(formData.endDate),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật voucher" : "Thêm voucher"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
          <div>
            <Form.Label className="fw-semibold">Mã voucher *</Form.Label>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã voucher"
              maxLength={20}
              className={errors.code ? "border-danger focus-visible:ring-danger/30" : ""}
            />
            {errors.code ? (
              <div className="text-danger small mt-1">{errors.code}</div>
            ) : (
              <Form.Text className="text-muted">
                Ví dụ: SALE10, GIAM50K, FREESHIP20.
              </Form.Text>
            )}
          </div>

          <div>
            <Form.Label className="fw-semibold">Mô tả voucher</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả ngắn về voucher"
              rows={3}
              maxLength={500}
              isInvalid={Boolean(errors.description)}
            />
            {errors.description && (
              <div className="text-danger small mt-1">{errors.description}</div>
            )}
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Label className="fw-semibold">Hình thức giảm giá *</Form.Label>
              <Form.Select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                isInvalid={Boolean(errors.discountType)}
              >
                <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                <option value="PERCENTAGE">Giảm theo phần trăm</option>
              </Form.Select>
              {errors.discountType && (
                <div className="text-danger small mt-1">{errors.discountType}</div>
              )}
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-semibold">Giá trị giảm *</Form.Label>
              <Input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min={0}
                step="0.01"
                className={errors.discountValue ? "border-danger focus-visible:ring-danger/30" : ""}
              />
              {errors.discountValue && (
                <div className="text-danger small mt-1">{errors.discountValue}</div>
              )}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <Form.Label className="fw-semibold">Số lượng voucher *</Form.Label>
              <Input
                type="number"
                name="quantityLimit"
                value={formData.quantityLimit}
                onChange={handleChange}
                min={1}
                className={errors.quantityLimit ? "border-danger focus-visible:ring-danger/30" : ""}
              />
              {errors.quantityLimit && (
                <div className="text-danger small mt-1">{errors.quantityLimit}</div>
              )}
            </div>

            <div className="col-12">
              <Form.Label className="fw-semibold">Giá trị đơn tối thiểu được áp dụng *</Form.Label>
              <Input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                min={0}
                step="0.01"
                className={errors.minOrderValue ? "border-danger focus-visible:ring-danger/30" : ""}
              />
              {errors.minOrderValue ? (
                <div className="text-danger small mt-1">{errors.minOrderValue}</div>
              ) : (
                <Form.Text className="text-muted">
                  Khách phải đạt mức đơn hàng này thì voucher mới được áp dụng.
                </Form.Text>
              )}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Label className="fw-semibold">Ngày bắt đầu áp dụng *</Form.Label>
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`pe-5 text-sm ${errors.startDate ? "border-danger focus-visible:ring-danger/30" : ""}`}
              />
              {errors.startDate && (
                <div className="text-danger small mt-1">{errors.startDate}</div>
              )}
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-semibold">Ngày kết thúc áp dụng *</Form.Label>
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`pe-5 text-sm ${errors.endDate ? "border-danger focus-visible:ring-danger/30" : ""}`}
              />
              {errors.endDate && (
                <div className="text-danger small mt-1">{errors.endDate}</div>
              )}
            </div>
          </div>

          <Form.Check
            type="switch"
            name="isActive"
            label="Kích hoạt voucher"
            checked={formData.isActive}
            onChange={handleChange}
          />

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onHide} disabled={loading}>
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
