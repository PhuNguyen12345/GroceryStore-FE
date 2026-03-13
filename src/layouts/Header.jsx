import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { Search, Menu, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="gs-header border-bottom bg-white">
      <div className="gs-header-top py-3">
        <Container>
          <Row className="align-items-center gy-3">
            <Col lg={3} md={4} sm={12}>
              <Link
                to="/"
                className="text-decoration-none fw-bold fs-3 text-success"
              >
                GroceryStore
              </Link>
            </Col>

            <Col lg={5} md={8} sm={12}>
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative w-100">
                  <Search
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    aria-label="Search products"
                    className="ps-5"
                  />
                </div>

                <Button type="button" className="shrink-0">
                  Tìm
                </Button>
              </div>
            </Col>

            <Col lg={4} sm={12}>
              <div className="rounded-4 border bg-light px-3 py-2 h-100">
                <div className="d-inline-flex align-items-center gap-2 rounded-pill bg-warning-subtle text-dark px-3 py-1 fw-medium small mb-2">
                  <Tag size={14} />
                  Khách tham quan
                </div>
                <p className="mb-0 text-muted small">
                  Xem danh mục, giá và chương trình khuyến mãi
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Navbar expand="lg" bg="white" className="gs-main-nav py-2" sticky="top">
        <Container>
          <Navbar.Toggle aria-controls="header-nav">
            <Menu size={20} />
          </Navbar.Toggle>

          <Navbar.Collapse id="header-nav">
            <Nav className="me-auto gap-lg-2">
              <Nav.Link as={NavLink} to="/" end>
                Trang chủ
              </Nav.Link>

              <Nav.Link as={NavLink} to="/products">
                Hàng hóa
              </Nav.Link>

              <Nav.Link as={NavLink} to="/promotions">
                Khuyến mãi
              </Nav.Link>

              <Nav.Link as={NavLink} to="/blog">
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