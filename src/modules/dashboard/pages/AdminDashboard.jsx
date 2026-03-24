import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Col, Row, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { customerService } from "@/core/api/customerService";
import { inventoryService } from "@/core/api/inventoryService";

const CUSTOMER_PAGE_SIZE = 200;
const BATCH_PAGE_SIZE = 200;
const LOW_STOCK_THRESHOLD = 10;

function isToday(input) {
  if (!input) return false;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatDateTime(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("vi-VN");
}

function getDaysDiff(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return Number.POSITIVE_INFINITY;
  const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((aUtc - bUtc) / (1000 * 60 * 60 * 24));
}

function getStatusMeta(type) {
  if (type === "IMPORT") return { tone: "success", text: "Nhập kho" };
  if (type === "EXPORT") return { tone: "primary", text: "Xuất kho" };
  return { tone: "secondary", text: type || "-" };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    newCustomersToday: 0,
    lowStockProducts: 0,
    expiringBatches: 0,
    transactionsToday: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [customerPage0, txToday, txRecentPage] = await Promise.all([
          customerService.getAllCustomers(0, CUSTOMER_PAGE_SIZE),
          inventoryService.getTransactions({
            fromDate: new Date().toISOString().slice(0, 10),
            toDate: new Date().toISOString().slice(0, 10),
            page: 0,
            size: 1,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
          inventoryService.getTransactions({
            page: 0,
            size: 5,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
        ]);

        const totalCustomerPages = Math.max(Number(customerPage0?.totalPages || 1), 1);
        let allCustomers = Array.isArray(customerPage0?.content) ? [...customerPage0.content] : [];

        if (totalCustomerPages > 1) {
          for (let p = 1; p < totalCustomerPages; p += 1) {
            const pageData = await customerService.getAllCustomers(p, CUSTOMER_PAGE_SIZE);
            const list = Array.isArray(pageData?.content) ? pageData.content : [];
            allCustomers = allCustomers.concat(list);
          }
        }

        const newCustomersToday = allCustomers.filter((item) => isToday(item?.createdAt)).length;

        const batchPage0 = await inventoryService.getBatches({ page: 0, size: BATCH_PAGE_SIZE });
        const totalBatchPages = Math.max(Number(batchPage0?.totalPages || 1), 1);
        let allBatches = Array.isArray(batchPage0?.content) ? [...batchPage0.content] : [];

        if (totalBatchPages > 1) {
          for (let p = 1; p < totalBatchPages; p += 1) {
            const pageData = await inventoryService.getBatches({ page: p, size: BATCH_PAGE_SIZE });
            const list = Array.isArray(pageData?.content) ? pageData.content : [];
            allBatches = allBatches.concat(list);
          }
        }

        const stockByProductUnit = new Map();
        for (const batch of allBatches) {
          const key = `${batch?.productName || ""}__${batch?.unitName || ""}`;
          const current = Number(stockByProductUnit.get(key) || 0);
          stockByProductUnit.set(key, current + Number(batch?.quantityAvailable || 0));
        }

        const lowStockProducts = Array.from(stockByProductUnit.values()).filter(
          (qty) => qty > 0 && qty <= LOW_STOCK_THRESHOLD,
        ).length;

        const today = new Date();
        const expiringBatches = allBatches.filter((batch) => {
          const qty = Number(batch?.quantityAvailable || 0);
          if (qty <= 0 || !batch?.expiryDate) return false;
          const daysLeft = getDaysDiff(batch.expiryDate, today);
          return daysLeft >= 0 && daysLeft <= 30;
        }).length;

        if (!isMounted) return;

        setMetrics({
          totalCustomers: Number(customerPage0?.totalElements || allCustomers.length || 0),
          newCustomersToday,
          lowStockProducts,
          expiringBatches,
          transactionsToday: Number(txToday?.totalElements || 0),
        });

        setRecentTransactions(Array.isArray(txRecentPage?.content) ? txRecentPage.content : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu bảng điều khiển");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = useMemo(
    () => [
      { title: "Tổng khách hàng", value: metrics.totalCustomers, tone: "primary" },
      { title: "Khách hàng mới hôm nay", value: metrics.newCustomersToday, tone: "success" },
      { title: "Sản phẩm sắp hết (<=10)", value: metrics.lowStockProducts, tone: "warning" },
      { title: "Lô sắp hết hạn (30 ngày)", value: metrics.expiringBatches, tone: "danger" },
      { title: "Giao dịch kho hôm nay", value: metrics.transactionsToday, tone: "info" },
    ],
    [metrics],
  );

  return (
    <AdminLayout>
      <div className="admin-dashboard-title">
        <h2 className="fw-bold mb-1">Bảng điều khiển</h2>
        <p className="text-muted mb-0">Tổng hợp dữ liệu từ hệ thống hiện tại.</p>
      </div>

      {error ? (
        <Alert variant="danger" className="mb-3" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      ) : null}

      <Row className="g-3 mb-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5">
        {kpis.map((item) => (
          <Col key={item.title}>
            <div className="admin-kpi-card">
              <h6>{item.title}</h6>
              <h3>{loading ? "..." : Number(item.value || 0).toLocaleString("vi-VN")}</h3>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={8}>
          <div className="admin-panel p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Giao dịch kho gần đây</h5>
              <Badge bg="light" text="dark">
                {recentTransactions.length} bản ghi
              </Badge>
            </div>

            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại</th>
                  <th>Kho</th>
                  <th>Nhân viên</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Chưa có dữ liệu giao dịch.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => {
                    const status = getStatusMeta(tx?.transactionType);
                    return (
                      <tr key={tx?.id}>
                        <td>{tx?.id ?? "-"}</td>
                        <td>
                          <Badge bg={status.tone}>{status.text}</Badge>
                        </td>
                        <td>{tx?.warehouseName || "-"}</td>
                        <td>{tx?.employeeName || "-"}</td>
                        <td>{formatDateTime(tx?.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Col>

        <Col lg={4}>
          <div className="admin-panel p-3 p-md-4 h-100">
            <h5 className="mb-3">Việc cần theo dõi</h5>
            <ul className="mb-0 ps-3">
              <li className="mb-2">
                Có <strong>{Number(metrics.lowStockProducts || 0).toLocaleString("vi-VN")}</strong> sản
                phẩm đang ở mức tồn thấp.
              </li>
              <li className="mb-2">
                Có <strong>{Number(metrics.expiringBatches || 0).toLocaleString("vi-VN")}</strong> lô hàng
                sắp hết hạn trong 30 ngày.
              </li>
              <li className="mb-2">
                Hôm nay phát sinh{" "}
                <strong>{Number(metrics.transactionsToday || 0).toLocaleString("vi-VN")}</strong> giao dịch
                kho.
              </li>
              <li>
                Tổng số khách hàng hiện có:{" "}
                <strong>{Number(metrics.totalCustomers || 0).toLocaleString("vi-VN")}</strong>.
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </AdminLayout>
  );
}
