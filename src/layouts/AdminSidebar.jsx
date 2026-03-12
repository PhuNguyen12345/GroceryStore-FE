import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaChartBar,
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaTag,
  FaCog,
  FaFileAlt,
  FaBriefcase,
  FaChevronDown,
  FaWarehouse,
  FaListUl,
  FaBullhorn,
} from "react-icons/fa";

export default function Sidebar() {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "250px",
        height: "100vh",
        background: "linear-gradient(180deg, #228B22 0%, #1a6a1a 100%)",
        color: "white",
        padding: "20px 0",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <Nav className="flex-column">
        <Nav.Link
          as={Link}
          to="/admin"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaChartBar size={18} />
          <span>Bảng điều khiển</span>
        </Nav.Link>

        {/* Product Dropdown Menu */}
        <div>
          <button
            onClick={() => toggleMenu("product")}
            className="d-flex align-items-center gap-2 w-100"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              padding: "12px 20px",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FaBox size={18} />
            <span>Sản phẩm</span>
            <FaChevronDown
              size={12}
              style={{
                marginLeft: "auto",
                transform: expandedMenu === "product" ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {expandedMenu === "product" && (
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Nav.Link
                as={Link}
                to="/admin/products"
                className="d-flex align-items-center gap-2"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 20px 10px 50px",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaWarehouse size={14} />
                <span>Quản lý sản phẩm</span>
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/brands"
                className="d-flex align-items-center gap-2"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 20px 10px 50px",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaBriefcase size={14} />
                <span>Quản lý thương hiệu</span>
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/categories"
                className="d-flex align-items-center gap-2"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 20px 10px 50px",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaListUl size={14} />
                <span>Quản lý danh mục</span>
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/admin/product-units"
                className="d-flex align-items-center gap-2"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 20px 10px 50px",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaBox size={14} />
                <span>Quản lý đơn vị sản phẩm</span>
              </Nav.Link>
            </div>
          )}
        </div>

        <Nav.Link
          as={Link}
          to="/admin/orders"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaShoppingCart size={18} />
          <span>Đơn hàng</span>
        </Nav.Link>

        {/* Customers link above promotions */}
        <Nav.Link
          as={Link}
          to="/admin/customers"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaUsers size={18} />
          <span>Khách hàng</span>
        </Nav.Link>

        {/* Ads link above promotions */}
        <Nav.Link
          as={Link}
          to="/admin/ads"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaBullhorn size={18} />
          <span>Quảng cáo</span>
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/admin/promotions"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaTag size={18} />
          <span>Khuyến mãi</span>
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/admin/reports"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaFileAlt size={18} />
          <span>Báo cáo</span>
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/admin/settings"
          className="d-flex align-items-center gap-2"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            padding: "12px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            marginTop: "12px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FaCog size={18} />
          <span>Cài đặt</span>
        </Nav.Link>
      </Nav>
    </div>
  );
}
