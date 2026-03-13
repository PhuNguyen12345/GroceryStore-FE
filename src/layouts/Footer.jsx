import { Container, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Facebook, Phone, Mail, MapPin, Truck, ShieldCheck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer
      className="mt-5 border-top text-white py-5"
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(34, 197, 94, 0.14) 0%, rgba(34, 197, 94, 0) 36%), radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 34%), linear-gradient(145deg, #0b1220 0%, #0f1f1b 45%, #133129 100%)",
      }}
    >
      <Container>
        <div className="rounded-4 border border-light border-opacity-25 bg-white bg-opacity-5 p-4 p-md-5 mb-4 shadow">
          <Row className="align-items-center g-3">
            <Col lg={8}>
              <h4 className="fw-bold mb-2">GroceryStore - Tươi ngon mỗi ngày</h4>
              <p className="mb-0 text-white-50">
                Không gian mua sắm thực phẩm tiện lợi cho gia đình: tươi sạch, giá hợp lý
                và dịch vụ nhanh chóng.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <Truck size={14} className="me-1" />
                  Giao nhanh
                </Badge>
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <ShieldCheck size={14} className="me-1" />
                  An toàn
                </Badge>
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <Leaf size={14} className="me-1" />
                  Tươi sạch
                </Badge>
              </div>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          <Col lg={4} md={6}>
            <h5 className="fw-bold mb-3">GroceryStore</h5>
            <p className="text-white-50 mb-3">
              Hệ thống cửa hàng tập trung vào thực phẩm tươi sống, hàng tiêu dùng thiết
              yếu và ưu đãi định kỳ cho khách hàng.
            </p>
            <p className="mb-2 d-flex align-items-center gap-2 text-white-50 small">
              <MapPin size={15} />
              123 Nguyễn Trãi, Quận 1, TP.HCM
            </p>
          </Col>

          <Col lg={4} md={6}>
            <h6 className="text-uppercase fw-semibold text-white-50 mb-3">Chính sách</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/shipping-policy" className="text-decoration-none text-white">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-decoration-none text-white">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-decoration-none text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={4} md={12}>
            <h6 className="text-uppercase fw-semibold text-white-50 mb-3">Liên hệ</h6>
            <p className="mb-2 d-flex align-items-center gap-2 text-white-50">
              <Phone size={16} />
              1900 1234
            </p>
            <p className="mb-3 d-flex align-items-center gap-2 text-white-50">
              <Mail size={16} />
              support@grocerystore.vn
            </p>

            <Button
              variant="secondary"
              size="icon"
              aria-label="Facebook"
              className="bg-white text-success border-0"
            >
              <Facebook size={18} />
            </Button>
          </Col>
        </Row>

        <hr className="my-4 border-light border-opacity-25" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 text-white-50 small">
          <span>© {new Date().getFullYear()} GroceryStore. Đã đăng ký bản quyền.</span>
          <span>Phục vụ khách hàng từ 7:00 - 22:00 mỗi ngày.</span>
        </div>
      </Container>
    </footer>
  );
}
