import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { Search, Menu, ShieldCheck, Clock3 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  return (
    <header className="border-bottom shadow-sm">
      <div
        className="py-3 text-white"
        style={{ background: "linear-gradient(135deg, #145a3a 0%, #1a7a4d 55%, #2c9a67 100%)" }}
      >
        <Container>
          <Row className="align-items-center gy-3">
            <Col lg={3} md={4} sm={12}>
              <Link to="/" className="text-decoration-none text-white">
                <div className="fw-bold fs-3 lh-1">GroceryStore</div>
                <small className="text-white-50">Thực phẩm tươi mỗi ngày</small>
              </Link>
            </Col>

            <Col lg={5} md={8} sm={12}>
              <form
                className="w-100"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="position-relative w-100">
                  <Search
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dark"
                  />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    aria-label="Tìm kiếm sản phẩm"
                    className="ps-5 bg-white text-dark border-white shadow-sm"
                  />
                </div>
              </form>
            </Col>

            <Col lg={4} sm={12}>
              <div className="rounded-4 border border-light-subtle bg-white bg-opacity-10 px-3 py-2">
                <div className="d-flex align-items-center gap-2 small fw-semibold text-white">
                  <ShieldCheck size={15} />
                  Khách tham quan
                </div>
                <div className="mt-1 d-flex align-items-center gap-2 text-white-50 small">
                  <Clock3 size={14} />
                  Xem danh mục, giá bán và chương trình khuyến mãi
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Navbar expand="lg" bg="white" className="py-2" sticky="top" data-bs-theme="light">
        <Container>
          <Navbar.Toggle aria-controls="header-nav">
            <Menu size={20} />
          </Navbar.Toggle>

          <Navbar.Collapse id="header-nav">
            <Nav className="me-auto gap-lg-2">
              <Nav.Link as={NavLink} to="/" end className="fw-medium text-dark">
                Trang chủ
              </Nav.Link>
              <Nav.Link as={NavLink} to="/orders" className="fw-medium text-dark">
              Orders
              </Nav.Link>
              <Nav.Link as={NavLink} to="/products" className="fw-medium text-dark">
                Hàng hóa
              </Nav.Link>
              <Nav.Link as={NavLink} to="/promotions" className="fw-medium text-dark">
                Khuyến mãi
              </Nav.Link>
              <Nav.Link as={NavLink} to="/blog" className="fw-medium text-dark">
                Blog
              </Nav.Link>
              <Nav.Link as={NavLink} to="/hot-deal" className="fw-semibold text-danger">
                Hot Deal
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

