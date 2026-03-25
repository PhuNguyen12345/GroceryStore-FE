import { Table, Badge, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getDiscountTypeLabel(discountType) {
  switch (discountType) {
    case "FIXED_AMOUNT":
      return "Giảm số tiền cố định";
    case "PERCENTAGE":
      return "Giảm theo phần trăm";
    default:
      return discountType || "-";
  }
}

function formatVoucherValue(discountType, value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (discountType === "PERCENTAGE") {
    return `${value}%`;
  }

  return vndFormatter.format(Number(value));
}

function formatCurrencyVnd(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return vndFormatter.format(Number(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export default function VoucherList({ vouchers, loading, onEdit, onDelete, onRestore, page = 0, size = 10 }) {
  if (loading && vouchers.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!loading && vouchers.length === 0) {
    return <Alert variant="info">Chưa có voucher nào</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>STT</th>
            <th>Code</th>
            <th>Loại giảm</th>
            <th>Giá trị</th>
            <th>Đơn tối thiểu</th>
            <th>Đã dùng</th>
            <th>Trạng thái</th>
            <th>Hiệu lực</th>
            <th className="text-end"></th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher, index) => (
            <tr key={voucher.id}>
              <td>{page * size + index + 1}</td>
              <td>{voucher.code}</td>
              <td>{getDiscountTypeLabel(voucher.discountType)}</td>
              <td>{formatVoucherValue(voucher.discountType, voucher.discountValue)}</td>
              <td>{formatCurrencyVnd(voucher.minOrderValue)}</td>
              <td>
                {voucher.quantityUsed ?? 0}/{voucher.quantityLimit}
              </td>
              <td>
                <Badge bg={voucher.isActive ? "success" : "secondary"}>
                  {voucher.isActive ? "Kích hoạt" : "Tạm dừng"}
                </Badge>
              </td>
              <td>
                {formatDateTime(voucher.startDate)} - {formatDateTime(voucher.endDate)}
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline" size="icon-sm" onClick={() => onEdit(voucher)} title="Sửa">
                    <FaEdit />
                  </Button>

                  {voucher.isActive ? (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(voucher.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => onRestore(voucher.id)}
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
