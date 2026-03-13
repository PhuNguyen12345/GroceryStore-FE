import { useState } from "react";
import { Table, Badge, Spinner, Alert, Modal } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { brandService } from "../../../core/api/brandService";

export default function BrandList({ brands, loading, onEdit, onDelete, onRestore }) {
  const [previewImage, setPreviewImage] = useState("");

  const openPreview = (imageUrl) => {
    if (!imageUrl) return;
    setPreviewImage(imageUrl);
  };

  const closePreview = () => setPreviewImage("");

  if (loading && brands.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && brands.length === 0) {
    return <Alert variant="info">Chưa có thương hiệu nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0 admin-brand-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Logo</th>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td className="fw-semibold">#{brand.id}</td>
              <td>
                {brand.logoUrl ? (
                  <div className="admin-brand-logo">
                    <img
                      src={brandService.toAbsoluteMediaUrl(brand.logoUrl)}
                      alt={brand.name}
                      style={{ height: "40px", width: "64px", objectFit: "contain" }}
                      role="button"
                      title="Xem anh"
                      onClick={() => openPreview(brandService.toAbsoluteMediaUrl(brand.logoUrl))}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>{brand.name}</td>
              <td className="text-muted">
                {brand.description
                  ? brand.description.length > 60
                    ? `${brand.description.slice(0, 60)}...`
                    : brand.description
                  : "-"}
              </td>
              <td>
                <Badge bg={brand.isActive ? "success" : "secondary"}>
                  {brand.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString("vi-VN") : "-"}</td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onEdit(brand)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </Button>

                  {brand.isActive ? (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(brand.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => onRestore(brand.id)}
                      title="Khôi phục"
                    >
                      <FaUndo />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={Boolean(previewImage)} onHide={closePreview} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xem anh logo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewImage && (
            <img
              src={previewImage}
              alt="Brand logo preview"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
