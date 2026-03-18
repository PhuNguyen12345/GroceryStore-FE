import { Row, Col, Table, Badge } from "react-bootstrap";
import AdminLayout from "../../../layouts/AdminLayout";
import { FaBoxOpen, FaChartLine, FaShoppingBag, FaUsers } from "react-icons/fa";

const kpis = [
  { title: "Đơn hàng hôm nay", value: "128", tone: "success" },
  { title: "Doanh thu hôm nay", value: "78.500.000đ", tone: "primary" },
  { title: "Khách hàng mới", value: "43", tone: "warning" },
  { title: "Sản phẩm sắp hết", value: "12", tone: "danger" },
];

export default function AdminDashboard() {
  const stats = [
    { title: "Tổng Doanh Thu", value: "125.000.000 ₫", icon: <FaChartLine size={24} />, color: "primary" },
    { title: "Đơn Hàng Mới", value: "48", icon: <FaShoppingBag size={24} />, color: "success" },
    { title: "Sản Phẩm", value: "320", icon: <FaBoxOpen size={24} />, color: "info" },
    { title: "Thành Viên", value: "1,250", icon: <FaUsers size={24} />, color: "warning" },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-title">
        <h2 className="fw-bold mb-1">Bảng điều khiển</h2>
        <p className="text-muted mb-0">Chào mừng đến với trang quản trị GroceryStore</p>
      </div>

      <Row className="g-3 mb-4">
        {kpis.map((item) => (
          <Col key={item.title} xl={3} md={6}>
            <div className="admin-kpi-card">
              <h6>{item.title}</h6>
              <h3>{item.value}</h3>
              <Badge bg={item.tone} className="mt-2">
                Cập nhật realtime
              </Badge>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="admin-panel p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Đơn hàng gần đây</h5>
              <Badge bg="light" text="dark">
                5 bản ghi
              </Badge>
            </div>

            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#ORD-1208</td>
                  <td>Nguyễn Văn A</td>
                  <td>1.250.000đ</td>
                  <td>
                    <Badge bg="success">Hoàn tất</Badge>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-1207</td>
                  <td>Trần Thị B</td>
                  <td>845.000đ</td>
                  <td>
                    <Badge bg="warning" text="dark">
                      Đang xử lý
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-1206</td>
                  <td>Lê Minh C</td>
                  <td>560.000đ</td>
                  <td>
                    <Badge bg="secondary">Đang giao</Badge>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Col>

        <Col lg={5}>
          <div className="admin-panel p-3 p-md-4 h-100">
            <h5 className="mb-3">Công việc cần xử lý</h5>
            <ul className="mb-0 ps-3">
              <li className="mb-2">Kiểm tra 12 sản phẩm sắp hết hàng trong kho.</li>
              <li className="mb-2">Duyệt 4 chiến dịch khuyến mãi mới.</li>
              <li className="mb-2">Phản hồi 7 ticket hỗ trợ từ khách hàng.</li>
              <li>Đối soát doanh thu cuối ngày với POS.</li>
            </ul>
          </div>
        </Col>
      </Row>
    </AdminLayout>
  );
}
