import { useState } from "react";
import { Table, Badge, Spinner, Alert, Modal } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export default function PromotionList({
  promotions,
  loading,
  onEdit,
  onDelete,
  onRestore,
  page = 0,
  size = 10,
}) {
  const [previewImage, setPreviewImage] = useState(null);

  if (loading && promotions.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && promotions.length === 0) {
    return <Alert variant="info">Chưa có khuyến mãi nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên khuyến mãi</th>
            <th>Mô tả</th>
            <th>Banner</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion, index) => (
            <tr key={promotion.id}>
              <td>{page * size + index + 1}</td>
              <td className="fw-semibold">{promotion.name}</td>
              <td style={{ maxWidth: 240 }} title={promotion.description || ""}>
                {promotion.description}
              </td>
              <td style={{ width: 200 }}>
                {promotion.bannerUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        src: resolveImageUrl(promotion.bannerUrl),
                        alt: promotion.name,
                      })
                    }
                    style={{
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      cursor: "zoom-in",
                    }}
                  >
                    <img
                      src={resolveImageUrl(promotion.bannerUrl)}
                      alt={promotion.name}
                      style={{
                        width: 200,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        display: "block",
                        backgroundColor: "#f8f9fa",
                      }}
                    />
                  </button>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center text-muted small"
                    style={{
                      width: 136,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: "#f8f9fa",
                      border: "1px dashed #d0d7de",
                    }}
                  >
                    Chưa có ảnh
                  </div>
                )}
              </td>
              <td>{formatDateTime(promotion.startDate)}</td>
              <td>{formatDateTime(promotion.endDate)}</td>
              <td>
                <Badge bg={promotion.isActive ? "success" : "secondary"}>
                  {promotion.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onEdit(promotion)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </Button>

                  {promotion.isActive ? (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(promotion.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => onRestore(promotion.id)}
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

      <Modal show={Boolean(previewImage)} onHide={() => setPreviewImage(null)} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Xem ảnh banner</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewImage && (
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
