import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaUser, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/core/store/useAuthStore";

export default function AdminHeader() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Navbar expand="lg" className="admin-topbar px-2" sticky="top">
      <Container fluid>
        <div>
          <div className="fw-semibold text-dark">Trang quản trị</div>
          <small className="text-muted">Quản lý dữ liệu và vận hành cửa hàng</small>
        </div>

        <Navbar.Toggle aria-controls="admin-header-nav" />

        <Navbar.Collapse id="admin-header-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3">
            <Nav.Link href="#" className="position-relative text-dark">
              <FaBell size={17} />
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "10px" }}
              >
                3
              </span>
            </Nav.Link>

            <Nav.Link href="/admin/settings" className="text-dark">
              <FaCog size={17} />
            </Nav.Link>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-user"
                className="d-flex align-items-center border bg-white"
              >
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{ width: "30px", height: "30px" }}
                >
                  <FaUser size={13} />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/admin/profile">Hồ sơ</Dropdown.Item>
                <Dropdown.Item href="/admin/settings">Cài đặt</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as="button" type="button" className="text-danger" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
