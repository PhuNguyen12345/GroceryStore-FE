import { useEffect, useMemo, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productService } from "../../../core/api/productService";

const EMPTY_FORM = {
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  imageUrl: "",
  isActive: true,
};

function flattenCategoryTree(nodes, level = 0, acc = []) {
  nodes.forEach((node) => {
    acc.push({ id: node.id, name: node.name, level });
    if (node.children?.length) {
      flattenCategoryTree(node.children, level + 1, acc);
    }
  });
  return acc;
}

export default function ProductForm({ show, onHide, onSubmit, initialData, categoryTree, brands }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId ?? "",
        brandId: initialData.brandId ?? "",
        imageUrl: initialData.imageUrl || "",
        isActive: Boolean(initialData.isActive),
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setSelectedFile(null);
    setShowPreviewModal(false);
  }, [initialData, show]);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(productService.toAbsoluteMediaUrl(formData.imageUrl));
  }, [selectedFile, formData.imageUrl]);

  const categoryOptions = useMemo(() => flattenCategoryTree(categoryTree || []), [categoryTree]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let nextImageUrl = formData.imageUrl;

      if (selectedFile) {
        const uploadResult = await productService.uploadProductImage(selectedFile, formData.imageUrl);
        nextImageUrl = uploadResult.url;
      }

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId),
        imageUrl: nextImageUrl,
        isActive: formData.isActive,
      });

      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="fw-semibold">Tên sản phẩm *</Form.Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              maxLength={100}
              required
            />
          </div>

          <div>
            <Form.Label className="fw-semibold">Danh mục *</Form.Label>
            <Form.Select name="categoryId" value={String(formData.categoryId)} onChange={handleChange} required>
              <option value="">Chọn danh mục</option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {`${"-- ".repeat(item.level)}${item.name}`}
                </option>
              ))}
            </Form.Select>
          </div>

          <div>
            <Form.Label className="fw-semibold">Thương hiệu *</Form.Label>
            <Form.Select name="brandId" value={String(formData.brandId)} onChange={handleChange} required>
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Form.Select>
          </div>

          <div>
            <Form.Label className="fw-semibold">Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div>
            <Form.Label className="fw-semibold">Ảnh sản phẩm</Form.Label>
            <Form.Control
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ height: 64, objectFit: "contain", cursor: "zoom-in" }}
                  role="button"
                  title="Click de xem anh lon"
                  onClick={() => setShowPreviewModal(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
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
            <Button type="button" variant="outline" onClick={onHide} disabled={loading} className="admin-cancel-btn">
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
          <Modal.Title>Xem ảnh sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Product preview large"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Modal>
  );
}
