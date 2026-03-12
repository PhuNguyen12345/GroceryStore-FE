import { Container, Row, Col, Form, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";

export default function Header() {
  return (
    <>
      <div style={{ backgroundColor: "#228B22" }} className="py-2 text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={2}>
              <Link to="/" className="text-white text-decoration-none fw-bold fs-4">
                GroceryStore
              </Link>
            </Col>

            <Col md={4} className="d-flex justify-content-center">
              <Form className="d-flex w-100" style={{ maxWidth: "300px" }}>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  size="sm"
                  className="rounded-start"
                />
                <Button
                  variant="warning"
                  size="sm"
                  className="rounded-end d-flex align-items-center justify-content-center"
                  style={{ width: "40px" }}
                >
                  <FaSearch />
                </Button>
              </Form>
            </Col>

            <Col md={6} className="d-flex justify-content-end align-items-center">
              <Link to="/login" className="text-white me-4 text-decoration-none">
                <FaUser className="me-1" />
                Đăng nhập
              </Link>

              <Link to="/register" className="text-white me-4 text-decoration-none">
                Đăng ký
              </Link>

              <Link to="/cart" className="text-white text-decoration-none">
                <FaShoppingCart className="me-1" />
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
              <Nav.Link as={Link} to="/products">Hàng hóa</Nav.Link>
              <Nav.Link as={Link} to="/promotions">Khuyến mãi</Nav.Link>
              <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
              <Nav.Link as={Link} to="/hot-deal" className="text-danger fw-bold">
                Hot Deal
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}