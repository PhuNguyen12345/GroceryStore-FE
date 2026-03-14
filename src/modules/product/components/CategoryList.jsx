import { Table, Badge, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function CategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
  onRestore,
  page = 0,
  pageSize = 10,
}) {
  if (loading && categories.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return <Alert variant="info">Chưa có danh mục nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0 admin-brand-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Danh mục cha</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id}>
              <td className="fw-semibold">{page * pageSize + index + 1}</td>
              <td>{category.name}</td>
              <td>{category.slug || "-"}</td>
              <td>{category.parentName || "-"}</td>
              <td className="text-muted">
                {category.description
                  ? category.description.length > 60
                    ? `${category.description.slice(0, 60)}...`
                    : category.description
                  : "-"}
              </td>
              <td>
                <Badge bg={category.isActive ? "success" : "secondary"}>
                  {category.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>{category.createdAt ? new Date(category.createdAt).toLocaleDateString("vi-VN") : "-"}</td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onEdit(category)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </Button>

                  {category.isActive ? (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(category.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => onRestore(category.id)}
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
    </div>
  );
}
