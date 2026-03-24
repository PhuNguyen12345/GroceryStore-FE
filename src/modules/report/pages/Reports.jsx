import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Col, Row, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { customerService } from "@/core/api/customerService";
import { productService } from "@/core/api/productService";
import { inventoryService } from "@/core/api/inventoryService";
import { promotionService } from "@/core/api/promotionService";
import { voucherService } from "@/core/api/voucherService";

function toDateInput(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("vi-VN");
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    suppliers: 0,
    warehouses: 0,
    promotions: 0,
    vouchers: 0,
    transactionsToday: 0,
    importsToday: 0,
    exportsToday: 0,
    expiringSoonTotal: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expiringSoonBatches, setExpiringSoonBatches] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const todayText = toDateInput(today);
        const in30DaysText = toDateInput(in30Days);

        const [
          productPage,
          customerPage,
          supplierPage,
          warehousePage,
          promotionPage,
          voucherPage,
          txTodayPage,
          txTodayListPage,
          txRecentPage,
          expiringSoonPage,
        ] = await Promise.all([
          productService.getAllProducts(0, 1),
          customerService.getAllCustomers(0, 1),
          inventoryService.getSuppliers({ page: 0, size: 1 }),
          inventoryService.getWarehouses({ page: 0, size: 1 }),
          promotionService.getAllPromotions(0, 1),
          voucherService.getAllVouchers(0, 1),
          inventoryService.getTransactions({
            fromDate: todayText,
            toDate: todayText,
            page: 0,
            size: 1,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
          inventoryService.getTransactions({
            fromDate: todayText,
            toDate: todayText,
            page: 0,
            size: 200,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
          inventoryService.getTransactions({
            page: 0,
            size: 5,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
          inventoryService.getBatches({
            fromExpiryDate: todayText,
            toExpiryDate: in30DaysText,
            page: 0,
            size: 5,
          }),
        ]);

        const txTodayList = Array.isArray(txTodayListPage?.content) ? txTodayListPage.content : [];
        const importsToday = txTodayList.filter((item) => item?.transactionType === "IMPORT").length;
        const exportsToday = txTodayList.filter((item) => item?.transactionType === "EXPORT").length;

        if (!mounted) return;

        setStats({
          products: Number(productPage?.totalElements || 0),
          customers: Number(customerPage?.totalElements || 0),
          suppliers: Number(supplierPage?.totalElements || 0),
          warehouses: Number(warehousePage?.totalElements || 0),
          promotions: Number(promotionPage?.totalElements || 0),
          vouchers: Number(voucherPage?.totalElements || 0),
          transactionsToday: Number(txTodayPage?.totalElements || 0),
          importsToday,
          exportsToday,
          expiringSoonTotal: Number(expiringSoonPage?.totalElements || 0),
        });

        setRecentTransactions(Array.isArray(txRecentPage?.content) ? txRecentPage.content : []);
        setExpiringSoonBatches(Array.isArray(expiringSoonPage?.content) ? expiringSoonPage.content : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || "Không tải được dữ liệu báo cáo.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Sản phẩm", value: stats.products, tone: "primary" },
      { label: "Khách hàng", value: stats.customers, tone: "success" },
      { label: "Nhà cung cấp", value: stats.suppliers, tone: "info" },
      { label: "Kho hàng", value: stats.warehouses, tone: "secondary" },
      { label: "Khuyến mãi", value: stats.promotions, tone: "warning" },
      { label: "Voucher", value: stats.vouchers, tone: "dark" },
    ],
    [stats],
  );

  return (
    <AdminLayout>
      <div className="admin-page-heading mb-4">
        <div className="admin-page-heading-text">
          <h2 className="fw-bold mb-1">Báo cáo</h2>
          <p className="text-muted mb-0">Tổng hợp số liệu thực tế từ hệ thống hiện tại.</p>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mb-3">
          {error}
        </Alert>
      ) : null}

      <Row className="g-3 mb-4">
        {kpis.map((item) => (
          <Col key={item.label} xl={2} md={4} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <p className="text-muted mb-2">{item.label}</p>
                <h4 className="mb-0">
                  {loading ? "..." : Number(item.value || 0).toLocaleString("vi-VN")}
                </h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <div className="admin-panel p-3 p-md-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Giao dịch kho hôm nay</h5>
              <Badge bg="light" text="dark">
                {loading ? "..." : Number(stats.transactionsToday || 0).toLocaleString("vi-VN")} giao dịch
              </Badge>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg="success" className="px-3 py-2">
                Nhập kho: {loading ? "..." : Number(stats.importsToday || 0).toLocaleString("vi-VN")}
              </Badge>
              <Badge bg="primary" className="px-3 py-2">
                Xuất kho: {loading ? "..." : Number(stats.exportsToday || 0).toLocaleString("vi-VN")}
              </Badge>
              <Badge bg="warning" text="dark" className="px-3 py-2">
                Lô sắp hết hạn 30 ngày:{" "}
                {loading ? "..." : Number(stats.expiringSoonTotal || 0).toLocaleString("vi-VN")}
              </Badge>
            </div>
          </div>
        </Col>

        <Col lg={6}>
          <div className="admin-panel p-3 p-md-4 h-100">
            <h5 className="mb-3">Gợi ý vận hành</h5>
            <ul className="mb-0 ps-3">
              <li className="mb-2">
                Có <strong>{Number(stats.expiringSoonTotal || 0).toLocaleString("vi-VN")}</strong> lô hàng
                sắp hết hạn, nên ưu tiên xử lý bán/xuất kho.
              </li>
              <li className="mb-2">
                Hôm nay có <strong>{Number(stats.transactionsToday || 0).toLocaleString("vi-VN")}</strong>{" "}
                giao dịch kho, trong đó nhập{" "}
                <strong>{Number(stats.importsToday || 0).toLocaleString("vi-VN")}</strong> và xuất{" "}
                <strong>{Number(stats.exportsToday || 0).toLocaleString("vi-VN")}</strong>.
              </li>
              <li>
                Theo dõi xu hướng tăng trưởng tệp khách hàng hiện tại:{" "}
                <strong>{Number(stats.customers || 0).toLocaleString("vi-VN")}</strong> khách.
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="admin-panel p-3 p-md-4 h-100">
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
                ) : recentTransactions.length ? (
                  recentTransactions.map((item) => (
                    <tr key={item?.id}>
                      <td>{item?.id ?? "-"}</td>
                      <td>
                        <Badge bg={item?.transactionType === "IMPORT" ? "success" : "primary"}>
                          {item?.transactionType || "-"}
                        </Badge>
                      </td>
                      <td>{item?.warehouseName || "-"}</td>
                      <td>{item?.employeeName || "-"}</td>
                      <td>{formatDate(item?.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>

        <Col lg={5}>
          <div className="admin-panel p-3 p-md-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Lô sắp hết hạn</h5>
              <Badge bg="warning" text="dark">
                30 ngày
              </Badge>
            </div>
            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Mã lô</th>
                  <th>Sản phẩm</th>
                  <th>Hạn dùng</th>
                  <th>SL</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : expiringSoonBatches.length ? (
                  expiringSoonBatches.map((batch) => (
                    <tr key={batch?.id}>
                      <td>{batch?.batchCode || "-"}</td>
                      <td>{batch?.productName || "-"}</td>
                      <td>{formatDate(batch?.expiryDate)}</td>
                      <td>{batch?.quantityAvailable ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      Không có lô sắp hết hạn.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </AdminLayout>
  );
}
