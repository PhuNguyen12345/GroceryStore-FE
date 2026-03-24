import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { Input } from "@/components/ui/input";
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
import { inventoryService } from "@/core/api/inventoryService";

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

function formatDate(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("vi-VN");
}

export default function BatchesPage() {
  const [filters, setFilters] = useState({ batchCode: "", productName: "", warehouseName: "", supplierName: "", fromExpiryDate: "", toExpiryDate: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageItems = useMemo(() => getPageItems(Math.max(totalPages, 1), page + 1), [page, totalPages]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await inventoryService.getBatches({ ...appliedFilters, page, size: PAGE_SIZE });
      setItems(res.content || []);
      setTotalPages(Math.max(res.totalPages || 1, 1));
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách lô hàng");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilter = (event) => { event.preventDefault(); setPage(0); setAppliedFilters(filters); };
  const resetFilter = () => {
    const reset = { batchCode: "", productName: "", warehouseName: "", supplierName: "", fromExpiryDate: "", toExpiryDate: "" };
    setFilters(reset); setAppliedFilters(reset); setPage(0);
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Kho - Lô hàng</h2>
            <p className="text-muted mb-0">Theo dõi lô hàng theo FEFO.</p>
          </div>
        </div>

        {error ? <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert> : null}

        <Card className="admin-panel border-0 mb-4">
          <Card.Body>
            <Form onSubmit={applyFilter}>
              <div className="row g-2">
                <div className="col-12 col-md-4"><Input placeholder="Mã lô" value={filters.batchCode} onChange={(e) => setFilters((p) => ({ ...p, batchCode: e.target.value }))} /></div>
                <div className="col-12 col-md-4"><Input placeholder="Tên sản phẩm" value={filters.productName} onChange={(e) => setFilters((p) => ({ ...p, productName: e.target.value }))} /></div>
                <div className="col-12 col-md-4"><Input placeholder="Tên kho" value={filters.warehouseName} onChange={(e) => setFilters((p) => ({ ...p, warehouseName: e.target.value }))} /></div>
                <div className="col-12 col-md-4"><Input placeholder="Tên nhà cung cấp" value={filters.supplierName} onChange={(e) => setFilters((p) => ({ ...p, supplierName: e.target.value }))} /></div>
                <div className="col-12 col-md-3"><Form.Control type="date" value={filters.fromExpiryDate} onChange={(e) => setFilters((p) => ({ ...p, fromExpiryDate: e.target.value }))} /></div>
                <div className="col-12 col-md-3"><Form.Control type="date" value={filters.toExpiryDate} onChange={(e) => setFilters((p) => ({ ...p, toExpiryDate: e.target.value }))} /></div>
                <div className="col-12 col-md-2 d-flex gap-2">
                  <Button type="submit" className="w-100">Lọc</Button>
                  <Button type="button" variant="outline" className="w-100" onClick={resetFilter}>Đặt lại</Button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card className="admin-panel border-0">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Danh sách lô hàng</h6>
            <Badge bg="light" text="dark">{totalElements} bản ghi</Badge>
          </Card.Header>
          <Card.Body className="pt-1">
            {loading && items.length === 0 ? <Alert variant="info">Đang tải...</Alert> : null}
            {!loading && items.length === 0 ? <Alert variant="warning">Không có lô hàng phù hợp.</Alert> : null}

            {items.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 admin-brand-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Mã lô</th><th>Sản phẩm</th><th>Đơn vị</th><th>Kho</th><th>Nhà cung cấp</th><th>Hạn dùng</th><th>Số lượng</th><th>Giá nhập</th><th>Chiết khấu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{page * PAGE_SIZE + index + 1}</td>
                        <td>{item.batchCode || "-"}</td>
                        <td>{item.productName || "-"}</td>
                        <td>{item.unitName || "-"}</td>
                        <td>{item.warehouseName || "-"}</td>
                        <td>{item.supplierName || "-"}</td>
                        <td>{formatDate(item.expiryDate)}</td>
                        <td>{item.quantityAvailable ?? "-"}</td>
                        <td>{item.importPrice ?? "-"}</td>
                        <td>{item.isDiscounted ? `${item.discountPercent || 0}%` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : null}
          </Card.Body>
        </Card>

        <div className="admin-pagination mt-4">
          <Pagination><PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 0) setPage((p) => p - 1); }} className={page === 0 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
            {pageItems.map((item) => (<PaginationItem key={item}>{typeof item === "number" ? (<PaginationLink href="#" isActive={item === page + 1} onClick={(e) => { e.preventDefault(); setPage(item - 1); }}>{item}</PaginationLink>) : (<PaginationEllipsis />)}</PaginationItem>))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages - 1) setPage((p) => p + 1); }} className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
          </PaginationContent></Pagination>
        </div>
      </Container>
    </AdminLayout>
  );
}
