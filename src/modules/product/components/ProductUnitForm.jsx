import { useEffect, useMemo, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  productId: "",
  unitName: "",
  conversionFactor: 1,
  barcode: "",
  sellingPrice: "",
  reorderLevel: 0,
  isBaseUnit: false,
  isActive: true,
};

export default function ProductUnitForm({ show, onHide, onSubmit, initialData, products, selectedProductId }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const sortedProducts = useMemo(
    () => [...(products || [])].sort((a, b) => String(a.name).localeCompare(String(b.name), "vi")),
    [products]
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId ?? "",
        unitName: initialData.unitName ?? "",
        conversionFactor: initialData.conversionFactor ?? 1,
        barcode: initialData.barcode ?? "",
        sellingPrice: initialData.sellingPrice ?? "",
        reorderLevel: initialData.reorderLevel ?? 0,
        isBaseUnit: Boolean(initialData.isBaseUnit),
        isActive: Boolean(initialData.isActive),
      });
      return;
    }

    setFormData({
      ...EMPTY_FORM,
      productId: selectedProductId ?? "",
    });
  }, [initialData, selectedProductId, show]);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        productId: Number(formData.productId),
        unitName: formData.unitName.trim(),
        conversionFactor: Number(formData.conversionFactor),
        barcode: formData.barcode.trim() || null,
        sellingPrice: Number(formData.sellingPrice),
        reorderLevel: Number(formData.reorderLevel),
        isBaseUnit: Boolean(formData.isBaseUnit),
        isActive: Boolean(formData.isActive),
      });
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật đơn vị sản phẩm" : "Thêm đơn vị sản phẩm"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="fw-semibold">Sản phẩm *</Form.Label>
            <Form.Select name="productId" value={String(formData.productId)} onChange={handleChange} required>
              <option value="">Chọn sản phẩm</option>
              {sortedProducts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Form.Select>
          </div>

          <div>
            <Form.Label className="fw-semibold">Tên đơn vị *</Form.Label>
            <Input
              name="unitName"
              value={formData.unitName}
              onChange={handleChange}
              placeholder="Ví dụ: Lon, Chai, Thùng 24"
              required
              maxLength={50}
            />
          </div>

          <div className="d-flex gap-2">
            <div className="flex-fill">
              <Form.Label className="fw-semibold">Hệ số quy đổi *</Form.Label>
              <Input
                type="number"
                min={1}
                name="conversionFactor"
                value={formData.conversionFactor}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-fill">
              <Form.Label className="fw-semibold">Mức tồn tối thiểu</Form.Label>
              <Input type="number" min={0} name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Form.Label className="fw-semibold">Giá bán *</Form.Label>
            <Input
              type="number"
              min={1}
              step="0.01"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Form.Label className="fw-semibold">Barcode</Form.Label>
            <Input name="barcode" value={formData.barcode} onChange={handleChange} maxLength={50} />
          </div>

          <Form.Check type="switch" name="isBaseUnit" label="Là đơn vị cơ sở" checked={formData.isBaseUnit} onChange={handleChange} />
          <Form.Check type="switch" name="isActive" label="Kích hoạt" checked={formData.isActive} onChange={handleChange} />

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onHide} disabled={loading} className="admin-cancel-btn">
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="admin-save-btn">
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

