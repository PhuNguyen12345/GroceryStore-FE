import { Table, Badge, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

function getTierLabel(tier) {
  switch (tier) {
    case "BRONZE":
      return "Đồng";
    case "SILVER":
      return "Bạc";
    case "GOLD":
      return "Vàng";
    case "DIAMOND":
      return "Kim cương";
    default:
      return tier || "-";
  }
}

export default function CustomerList({ customers, loading, onEdit, onDelete, onRestore, page = 0, size = 10 }) {
  if (loading && customers.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && customers.length === 0) {
    return <Alert variant="info">Chưa có khách hàng nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Hạng</th>
            <th>Điểm</th>
            <th>Trạng thái</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.id}>
              <td>{page * size + index + 1}</td>
              <td>{customer.fullName || "-"}</td>
              <td>{customer.phone}</td>
              <td>{customer.email || "-"}</td>
              <td>{getTierLabel(customer.customerTier)}</td>
              <td>{customer.loyaltyPoints ?? 0}</td>
              <td>
                <Badge bg={customer.isActive ? "success" : "secondary"}>
                  {customer.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onEdit(customer)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </Button>

                  {customer.isActive ? (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(customer.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => onRestore(customer.id)}
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
