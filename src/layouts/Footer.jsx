import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Facebook, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="gs-footer mt-5 border-top bg-light py-5">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="fw-bold mb-3 text-success">GroceryStore</h5>
            <p className="mb-0 text-muted">
              Siêu thị tiện lợi - Chuyên cung cấp thực phẩm tươi sống, hàng tiêu
              dùng, giá tốt mỗi ngày.
            </p>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold mb-3">Chính sách</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/shipping-policy" className="text-decoration-none text-muted">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-decoration-none text-muted">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-decoration-none text-muted">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold mb-3">Liên hệ</h5>

            <p className="mb-2 d-flex align-items-center gap-2 text-muted">
              <Phone size={16} />
              1900 1234
            </p>

            <p className="mb-3 d-flex align-items-center gap-2 text-muted">
              <Mail size={16} />
              support@grocerystore.vn
            </p>

            <Button variant="outline" size="icon" aria-label="Facebook">
              <Facebook size={18} />
            </Button>
          </Col>
        </Row>

        <hr className="my-4" />

        <div className="text-center small text-muted">
          Copyright {new Date().getFullYear()} GroceryStore. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}