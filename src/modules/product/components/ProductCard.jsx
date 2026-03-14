import { useState } from "react";
import { Alert, Badge, Modal, Spinner, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { productService } from "../../../core/api/productService";

export default function ProductCard({ products, loading, onEdit, onDelete, onRestore, page = 0, pageSize = 10 }) {
  const [previewImage, setPreviewImage] = useState("");

  if (loading && products.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return <Alert variant="info">Chưa có sản phẩm nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0 admin-brand-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td className="fw-semibold">{page * pageSize + index + 1}</td>
              <td>
                {product.imageUrl ? (
                  <div className="admin-brand-logo">
                    <img
                      src={productService.toAbsoluteMediaUrl(product.imageUrl)}
                      alt={product.name}
                      style={{ height: "40px", width: "64px", objectFit: "contain" }}
                      role="button"
                      title="Xem ảnh"
                      onClick={() => setPreviewImage(productService.toAbsoluteMediaUrl(product.imageUrl))}
                    />
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.categoryName || "-"}</td>
              <td>{product.brandName || "-"}</td>
              <td>
                <Badge bg={product.isActive ? "success" : "secondary"}>
                  {product.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "-"}</td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline" size="icon-sm" onClick={() => onEdit(product)} title="Sửa">
                    <FaEdit />
                  </Button>

                  {product.isActive ? (
                    <Button variant="destructive" size="icon-sm" onClick={() => onDelete(product.id)} title="Xóa">
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button variant="secondary" size="icon-sm" onClick={() => onRestore(product.id)} title="Khôi phục">
                      <FaUndo />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={Boolean(previewImage)} onHide={() => setPreviewImage("")} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xem ảnh sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewImage && (
            <img
              src={previewImage}
              alt="Product preview"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
