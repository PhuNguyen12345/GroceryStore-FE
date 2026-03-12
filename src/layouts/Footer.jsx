import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaFacebook, FaPhone, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#228B22" }}
      className="text-white pt-5 pb-3 mt-5"
    >
      <Container>
        <Row>
          <Col md={4}>
            <h5 className="fw-bold">GroceryStore</h5>
            <p>
              Siêu thị tiện lợi – Chuyên cung cấp thực phẩm tươi sống,
              hàng tiêu dùng, giá tốt mỗi ngày.
            </p>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold">Chính sách</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/shipping-policy" className="text-white text-decoration-none">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-white text-decoration-none">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white text-decoration-none">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold">Liên hệ</h5>
            <p><FaPhone className="me-2" /> 1900 1234</p>
            <p><FaEnvelope className="me-2" /> support@grocerystore.vn</p>

            <div className="mt-2">
              <FaFacebook size={22} className="me-3" style={{ cursor: "pointer" }} />
            </div>
          </Col>
        </Row>

        <hr className="border-light" />

        <div className="text-center">
          © {new Date().getFullYear()} GroceryStore. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}