import { Row, Col, Card } from "react-bootstrap";
import { FaBoxOpen, FaUsers, FaChartLine, FaShoppingBag } from "react-icons/fa";

export default function AdminDashboard() {
  const stats = [
    { title: "Tổng Doanh Thu", value: "125.000.000 ₫", icon: <FaChartLine size={24} />, color: "primary" },
    { title: "Đơn Hàng Mới", value: "48", icon: <FaShoppingBag size={24} />, color: "success" },
    { title: "Sản Phẩm", value: "320", icon: <FaBoxOpen size={24} />, color: "info" },
    { title: "Thành Viên", value: "1,250", icon: <FaUsers size={24} />, color: "warning" },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Welcome Banner */}
      <Card className="border-0 shadow-sm mb-4 bg-gradient-primary text-white" style={{ background: "linear-gradient(45deg, #4e73df, #224abe)" }}>
        <Card.Body className="p-4 d-flex align-items-center justify-content-between">
          <div>
            <h2 className="fw-bold mb-1">Bảng điều khiển</h2>
            <p className="mb-0 text-white-50">Chào mừng bạn trở lại! Dưới đây là tổng quan về cửa hàng hôm nay.</p>
          </div>
          <div className="d-none d-md-block opacity-50">
            <FaChartLine size={64} />
          </div>
        </Card.Body>
      </Card>

      {/* Stats Grid */}
      <Row className="g-4 mb-4">
        {stats.map((stat, idx) => (
          <Col xs={12} sm={6} xl={3} key={idx}>
            <Card className="border-0 shadow-sm h-100 overflow-hidden">
              <Card.Body className="p-4 relative">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="text-muted fw-semibold mb-0 text-uppercase">{stat.title}</h6>
                  <div 
                    className={`bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-circle d-flex align-items-center justify-content-center`}
                    style={{ width: "48px", height: "48px" }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
              </Card.Body>
              <div 
                className={`bg-${stat.color}`} 
                style={{ height: "4px", width: "100%", position: "absolute", bottom: 0, left: 0 }} 
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
