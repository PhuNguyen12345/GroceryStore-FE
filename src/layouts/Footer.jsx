import { Container, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Facebook, Phone, Mail, MapPin, Store, ShieldCheck, Clock3, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer
      className="mt-5 border-top text-white py-5"
      style={{
        background:
          "radial-gradient(circle at 10% 20%, rgba(241, 245, 249, 0.14) 0%, rgba(241, 245, 249, 0) 36%), linear-gradient(145deg, #0d3b2a 0%, #126245 52%, #1d7e58 100%)",
      }}
    >
      <Container>
        <div className="rounded-4 border border-light border-opacity-25 bg-white bg-opacity-10 p-4 p-md-5 mb-4 shadow-sm">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <h4 className="fw-bold mb-2">GroceryStore - Mua Sắm Trực Tiếp Mỗi Ngày</h4>
              <p className="mb-0 text-white">
                Cửa hàng thực phẩm và hàng tiêu dùng dành cho gia đình, ưu tiên sản phẩm tươi,
                rõ nguồn gốc và hỗ trợ khách trực tiếp tại quầy.
              </p>
            </Col>
            <Col lg={5} className="text-lg-end">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <Store size={14} className="me-1" />Mua tại quầy
                </Badge>
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <ShieldCheck size={14} className="me-1" />Nguồn gốc rõ ràng
                </Badge>
                <Badge bg="light" text="dark" pill className="px-3 py-2">
                  <TicketPercent size={14} className="me-1" />Ưu đãi mỗi tuần
                </Badge>
              </div>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          <Col lg={3} md={6}>
            <h6 className="text-uppercase fw-semibold text-white mb-3">Về Cửa Hàng</h6>
            <p className="text-white mb-2 small">
              GroceryStore phục vụ khách mua trực tiếp với danh mục hàng hóa thiết yếu và khu vực trưng bày rõ ràng.
            </p>
            <p className="mb-0 d-flex align-items-start gap-2 text-white small">
              <MapPin size={15} className="mt-1" />
              Thạch Thất, Hà Nội
            </p>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-uppercase fw-semibold text-white mb-3">Thông tin</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/thong-tin-cua-hang" className="text-decoration-none text-white fw-medium">
                  Mua tại cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/uu-dai-voucher" className="text-decoration-none text-white fw-medium">
                  Khuyến mại đang áp dụng
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-decoration-none text-white fw-medium">
                  Blog mẹo mua sắm
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-decoration-none text-white fw-medium">
                  Toàn bộ hàng hóa
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-uppercase fw-semibold text-white mb-3">Giờ Hoạt Động</h6>
            <div className="d-flex flex-column gap-2 text-white small">
              <div className="d-flex align-items-center gap-2">
                <Clock3 size={14} />Thứ 2 - Thứ 6: 07:00 - 21:30
              </div>
              <div className="d-flex align-items-center gap-2">
                <Clock3 size={14} />Thứ 7 - CN: 06:30 - 22:00
              </div>
              <div className="text-white-50">Lễ/Tết có thể thay đổi theo thông báo.</div>
            </div>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-uppercase fw-semibold text-white mb-3">Liên hệ</h6>
            <p className="mb-2 d-flex align-items-center gap-2 text-white">
              <Phone size={16} />1900 1234
            </p>
            <p className="mb-3 d-flex align-items-center gap-2 text-white">
              <Mail size={16} />support@grocerystore.vn
            </p>
            <Button variant="secondary" size="icon" aria-label="Facebook" className="bg-white text-success border-0">
              <Facebook size={18} />
            </Button>
          </Col>
        </Row>

        <hr className="my-4 border-light border-opacity-25" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 text-white small">
          <span>© {new Date().getFullYear()} GroceryStore. Đã đăng ký bản quyền.</span>
          <span>Phục vụ khách mua trực tiếp tại cửa hàng mỗi ngày.</span>
        </div>
      </Container>
    </footer>
  );
}
