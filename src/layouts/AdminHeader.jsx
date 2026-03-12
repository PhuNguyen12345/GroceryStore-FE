import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaUser, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";

export default function AdminHeader() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm" sticky="top">
      <Container fluid>
        <Navbar.Brand href="/admin" className="fw-bold text-success fs-5">
          GroceryStore Admin
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center gap-3">
            {/* Notification */}
            <Nav.Link href="#" className="position-relative text-dark">
              <FaBell size={18} />
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "10px" }}
              >
                3
              </span>
            </Nav.Link>

            {/* Settings */}
            <Nav.Link href="/admin/settings" className="text-dark">
              <FaCog size={18} />
            </Nav.Link>

            {/* User Dropdown */}
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-user"
                className="d-flex align-items-center border-0 bg-white"
              >
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaUser size={14} />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item href="/admin/profile">Hồ sơ</Dropdown.Item>
                <Dropdown.Item href="/admin/settings">Cài đặt</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="/logout" className="text-danger">
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
