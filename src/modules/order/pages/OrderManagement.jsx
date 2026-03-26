import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { orderService } from "@/core/api/orderService";

const PAGE_SIZE = 10;

function getPageItems(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("ellipsis-left");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

function formatDateTime(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("vi-VN");
}

function formatCurrencyVnd(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function statusTone(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "COMPLETED") return "success";
  if (normalized === "CANCELLED") return "secondary";
  return "warning";
}

function paymentLabel(method) {
  if (method === "QR_CODE") return "QR";
  if (method === "CREDIT_CARD") return "Thẻ";
  if (method === "POINTS") return "Điểm";
  return "Tiền mặt";
}

export default function OrderManagementPage() {
  const [filters, setFilters] = useState({
    orderCode: "",
    status: "",
    date: "",
    fromTime: "",
    toTime: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageItems = useMemo(() => getPageItems(Math.max(totalPages, 1), page + 1), [page, totalPages]);

  const toQueryParams = useCallback(() => {
    const date = appliedFilters.date?.trim();
    const fromTime = appliedFilters.fromTime?.trim() || "00:00";
    const toTime = appliedFilters.toTime?.trim() || "23:59";

    const params = {
      page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      sortDir: "DESC",
      orderCode: appliedFilters.orderCode?.trim() || undefined,
      status: appliedFilters.status || undefined,
      fromDateTime: date ? `${date}T${fromTime}` : undefined,
      toDateTime: date ? `${date}T${toTime}` : undefined,
    };

    return params;
  }, [appliedFilters, page]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await orderService.getAdminOrders(toQueryParams());
      setItems(res.content || []);
      setTotalPages(Math.max(res.totalPages || 1, 1));
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [toQueryParams]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const applyFilter = (event) => {
    event.preventDefault();
    setPage(0);
    setAppliedFilters(filters);
  };

  const resetFilter = () => {
    const reset = { orderCode: "", status: "", date: "", fromTime: "", toTime: "" };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(0);
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Quản lý đơn hàng</h2>
            <p className="text-muted mb-0">Tìm kiếm đơn theo ngày và giờ để kiểm tra lịch sử bán hàng.</p>
          </div>
        </div>

        {error ? (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        ) : null}

        <Card className="admin-panel border-0 mb-4">
          <Card.Body>
            <Form onSubmit={applyFilter}>
              <div className="row g-2">
                <div className="col-12 col-md-3">
                  <div className="text-muted small mb-1">Mã đơn</div>
                  <Form.Control
                    placeholder="VD: ORD-260326"
                    value={filters.orderCode}
                    onChange={(e) => setFilters((p) => ({ ...p, orderCode: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <div className="text-muted small mb-1">Trạng thái</div>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="">Tất cả</option>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </div>
                <div className="col-12 col-md-3">
                  <div className="text-muted small mb-1">Ngày</div>
                  <Form.Control
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <div className="text-muted small mb-1">Từ giờ</div>
                  <Form.Control
                    type="time"
                    value={filters.fromTime}
                    onChange={(e) => setFilters((p) => ({ ...p, fromTime: e.target.value }))}
                    disabled={!filters.date}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <div className="text-muted small mb-1">Đến giờ</div>
                  <Form.Control
                    type="time"
                    value={filters.toTime}
                    onChange={(e) => setFilters((p) => ({ ...p, toTime: e.target.value }))}
                    disabled={!filters.date}
                  />
                </div>
                <div className="col-12 d-flex gap-2 mt-2">
                  <Button type="submit">Lọc</Button>
                  <Button type="button" variant="outline" onClick={resetFilter}>
                    Đặt lại
                  </Button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách đơn</h6>
            <Badge bg="light" text="dark">{totalElements} đơn</Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            {loading && items.length === 0 ? <Alert variant="info">Đang tải...</Alert> : null}
            {!loading && items.length === 0 ? <Alert variant="warning">Không có đơn phù hợp.</Alert> : null}
            {items.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 admin-brand-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã đơn</th>
                      <th>Khách</th>
                      <th>Nhân viên</th>
                      <th>Số món</th>
                      <th>Thanh toán</th>
                      <th>Tổng thu</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td className="fw-semibold">{item.orderCode}</td>
                        <td>{item.customerName || "Khách lẻ"}</td>
                        <td>{item.employeeName || "-"}</td>
                        <td>{item.itemCount ?? 0}</td>
                        <td>{paymentLabel(item.paymentMethod)}</td>
                        <td>{formatCurrencyVnd(item.finalAmount)}</td>
                        <td><Badge bg={statusTone(item.status)}>{item.status || "-"}</Badge></td>
                        <td>{formatDateTime(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : null}
          </Card.Body>
        </Card>

        <div className="admin-pagination mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 0) setPage((p) => p - 1);
                  }}
                  className={page === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {pageItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink
                      href="#"
                      isActive={item === page + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item - 1);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages - 1) setPage((p) => p + 1);
                  }}
                  className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Container>
    </AdminLayout>
  );
}
