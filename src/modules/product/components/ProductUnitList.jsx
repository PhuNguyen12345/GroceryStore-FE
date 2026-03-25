import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function ProductUnitList({ units, loading, onEdit, onDelete, onRestore }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!units?.length) {
    return <Alert variant="info">Chưa có đơn vị sản phẩm</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0 admin-brand-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Sản phẩm</th>
            <th>Tên đơn vị</th>
            <th>Hệ số</th>
            <th>Giá bán</th>
            <th>Barcode</th>
            <th>Tồn tối thiểu</th>
            <th>Cơ sở</th>
            <th>Trạng thái</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {units.map((item, index) => (
            <tr key={item.id}>
              <td className="fw-semibold">{index + 1}</td>
              <td>{item.productName || "-"}</td>
              <td>{item.unitName}</td>
              <td>{item.conversionFactor}</td>
              <td>{Number(item.sellingPrice || 0).toLocaleString("vi-VN")}</td>
              <td>{item.barcode || "-"}</td>
              <td>{item.reorderLevel ?? 0}</td>
              <td>
                <Badge bg={item.isBaseUnit ? "primary" : "light"} text={item.isBaseUnit ? "light" : "dark"}>
                  {item.isBaseUnit ? "Đơn vị gốc" : "Đơn vị phụ"}
                </Badge>
              </td>
              <td>
                <Badge bg={item.isActive ? "success" : "secondary"}>
                  {item.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline" size="icon-sm" onClick={() => onEdit(item)} title="Sửa">
                    <FaEdit />
                  </Button>
                  {item.isActive ? (
                    <Button variant="destructive" size="icon-sm" onClick={() => onDelete(item.id)} title="Xóa">
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button variant="secondary" size="icon-sm" onClick={() => onRestore(item.id)} title="Khôi phục">
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
