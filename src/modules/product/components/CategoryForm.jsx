import { useEffect, useMemo, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  name: "",
  parentId: "",
  slug: "",
  description: "",
  isActive: true,
};

function flattenTree(nodes, level = 0, acc = []) {
  nodes.forEach((node) => {
    acc.push({ id: node.id, name: node.name, level });
    if (node.children?.length) {
      flattenTree(node.children, level + 1, acc);
    }
  });
  return acc;
}

export default function CategoryForm({ show, onHide, onSubmit, initialData, categoryTree }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setFormData({
        name: initialData.name || "",
        parentId: initialData.parentId ?? "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        isActive: Boolean(initialData.isActive),
      });
      return;
    }

    setFormData(EMPTY_FORM);
  }, [initialData, show]);

  const parentOptions = useMemo(() => {
    // Backend only allows 2 levels, so parent must be a root category.
    const roots = flattenTree(categoryTree || []).filter((item) => item.level === 0);

    if (!initialData?.id) return roots;

    return roots.filter((item) => item.id !== initialData.id);
  }, [categoryTree, initialData]);

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
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId === "" ? null : Number(formData.parentId),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      await onSubmit(payload);
      setFormData(EMPTY_FORM);
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Cập nhật danh mục" : "Thêm danh mục"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="fw-semibold">Tên danh mục *</Form.Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên danh mục"
              required
              maxLength={100}
            />
            <small className="text-muted">Tối đa 100 ký tự</small>
          </div>

          <div>
            <Form.Label className="fw-semibold">Slug</Form.Label>
            <Input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="vi-du-danh-muc"
              maxLength={150}
              pattern="^[-a-z0-9]*$"
              title="Chỉ được chứa chữ thường, số và dấu gạch ngang"
            />
            <small className="text-muted">Tối đa 150 ký tự, chỉ gồm a-z, 0-9 và -</small>
          </div>

          <div>
            <Form.Label className="fw-semibold">Danh mục cha</Form.Label>
            <Form.Select name="parentId" value={String(formData.parentId)} onChange={handleChange}>
              <option value="">Không có (danh mục gốc)</option>
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              placeholder="Nhập mô tả danh mục"
              rows={3}
              maxLength={1000}
            />
            <small className="text-muted">Tối đa 1000 ký tự</small>
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
    </Modal>
  );
}
