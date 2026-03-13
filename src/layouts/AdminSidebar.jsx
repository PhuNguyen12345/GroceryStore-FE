import { useState } from "react";
import { NavLink } from "react-router-dom";
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

const navItems = [
  { to: "/admin/orders", icon: FaShoppingCart, label: "Đơn hàng" },
  { to: "/admin/customers", icon: FaUsers, label: "Khách hàng" },
  { to: "/admin/ads", icon: FaBullhorn, label: "Quảng cáo" },
  { to: "/admin/promotions", icon: FaTag, label: "Khuyến mãi" },
  { to: "/admin/reports", icon: FaFileAlt, label: "Báo cáo" },
];

const productItems = [
  { to: "/admin/products", icon: FaWarehouse, label: "Quản lý sản phẩm" },
  { to: "/admin/brands", icon: FaBriefcase, label: "Quản lý thương hiệu" },
  { to: "/admin/categories", icon: FaListUl, label: "Quản lý danh mục" },
  { to: "/admin/product-units", icon: FaBox, label: "Quản lý đơn vị sản phẩm" },
];

export default function Sidebar() {
  const [expandedMenu, setExpandedMenu] = useState("product");

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <strong>GroceryStore Admin</strong>
        <span>Bảng điều khiển quản trị</span>
      </div>

      <div className="py-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
        >
          <FaChartBar size={16} />
          <span>Bảng điều khiển</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setExpandedMenu(expandedMenu === "product" ? null : "product")}
          className="admin-nav-toggle"
        >
          <FaBox size={16} />
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
          <div className="admin-submenu">
            {productItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `admin-submenu-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="mt-3 pt-2" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.18)" }}>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <FaCog size={16} />
            <span>Cài đặt</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
