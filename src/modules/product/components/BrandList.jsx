import { Table, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { brandService } from "../../../core/api/brandService";

export default function BrandList({ brands, loading, onEdit, onDelete, onRestore, onLoadMore }) {
  return (
    <div>
      {loading && brands.length === 0 && (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      )}

      {brands.length === 0 && !loading && (
        <Alert variant="info">Chưa có thương hiệu nào</Alert>
      )}

      {brands.length > 0 && (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td>{brand.id}</td>
                <td>
                  {brand.logoUrl ? (
                    <img src={brandService.toAbsoluteMediaUrl(brand.logoUrl)} alt={brand.name} style={{height: '40px', objectFit: 'contain'}} />
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>{brand.name}</td>
                <td>{brand.description?.substring(0, 50)}...</td>
                <td>
                  <Badge bg={brand.isActive ? "success" : "secondary"}>
                    {brand.isActive ? "Kích hoạt" : "Tắt"}
                  </Badge>
                </td>
                <td>{new Date(brand.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => onEdit(brand)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </Button>
                    {brand.isActive ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(brand.id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </Button>
                    ) : (
                      <Button
                        variant="warning"
                        size="sm"
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
      )}
    </div>
  );
}
