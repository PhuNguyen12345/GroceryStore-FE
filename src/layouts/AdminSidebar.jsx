import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/common/hooks/useAuth";
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
  FaUserClock,
  FaClipboardCheck,
} from "react-icons/fa";

const ALL_STAFF_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_STAFF", "CASHIER"];
const ADMIN_AND_MANAGER_ROLES = ["ADMIN", "STORE_MANAGER"];
const INVENTORY_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_STAFF"];
const POS_ROLES = ["ADMIN", "STORE_MANAGER", "CASHIER"];
const CRM_READ_ROLES = ["ADMIN", "STORE_MANAGER", "CASHIER"];
const ADMIN_ONLY_ROLES = ["ADMIN"];

const navItems = [
  { to: "/admin/orders", icon: FaShoppingCart, label: "Quản lý đơn hàng", allowedRoles: ADMIN_AND_MANAGER_ROLES },
  { to: "/orders", icon: FaShoppingCart, label: "Bán hàng POS", allowedRoles: POS_ROLES },
  { to: "/admin/attendance", icon: FaClipboardCheck, label: "Chấm công", allowedRoles: ALL_STAFF_ROLES },
  { to: "/admin/customers", icon: FaUsers, label: "Khách hàng", allowedRoles: CRM_READ_ROLES },
  { to: "/admin/promotions", icon: FaBullhorn, label: "Quảng cáo", allowedRoles: ADMIN_AND_MANAGER_ROLES },
  { to: "/admin/vouchers", icon: FaTag, label: "Khuyến mãi", allowedRoles: CRM_READ_ROLES },
  { to: "/admin/hr-shift", icon: FaUserClock, label: "Ca làm việc", allowedRoles: ADMIN_ONLY_ROLES },
  { to: "/admin/reports", icon: FaFileAlt, label: "Báo cáo", allowedRoles: ADMIN_AND_MANAGER_ROLES },
];

const productItems = [
  { to: "/admin/products", icon: FaWarehouse, label: "Quản lý sản phẩm", allowedRoles: ADMIN_AND_MANAGER_ROLES },
  { to: "/admin/brands", icon: FaBriefcase, label: "Quản lý thương hiệu", allowedRoles: ADMIN_AND_MANAGER_ROLES },
  { to: "/admin/categories", icon: FaListUl, label: "Quản lý danh mục", allowedRoles: ADMIN_AND_MANAGER_ROLES },
  { to: "/admin/product-units", icon: FaBox, label: "Quản lý đơn vị sản phẩm", allowedRoles: ADMIN_AND_MANAGER_ROLES },
];

const inventoryItems = [
  { to: "/admin/inventory/suppliers", icon: FaUsers, label: "Nhà cung cấp", allowedRoles: INVENTORY_ROLES },
  { to: "/admin/inventory/warehouses", icon: FaWarehouse, label: "Kho hàng", allowedRoles: INVENTORY_ROLES },
  { to: "/admin/inventory/batches", icon: FaBox, label: "Lô hàng", allowedRoles: INVENTORY_ROLES },
  { to: "/admin/inventory/transactions", icon: FaShoppingCart, label: "Giao dịch", allowedRoles: INVENTORY_ROLES },
  { to: "/admin/inventory/stocks", icon: FaTag, label: "Tồn kho", allowedRoles: INVENTORY_ROLES },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const normalizedRole = String(role || "").toUpperCase().replace(/^ROLE_/, "");

  const canAccess = (allowedRoles = ALL_STAFF_ROLES) => allowedRoles.includes(normalizedRole);

  const visibleNavItems = navItems.filter((item) => canAccess(item.allowedRoles));
  const visibleProductItems = productItems.filter((item) => canAccess(item.allowedRoles));
  const visibleInventoryItems = inventoryItems.filter((item) => canAccess(item.allowedRoles));

  const isInSection = (items) =>
    items.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  const defaultExpanded = isInSection(visibleInventoryItems)
    ? "inventory"
    : isInSection(visibleProductItems)
      ? "product"
      : null;

  const [expandedMenu, setExpandedMenu] = useState(defaultExpanded);

  useEffect(() => {
    setExpandedMenu(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <strong>GroceryStore Admin</strong>
        <span>Bảng điều khiển quản trị</span>
      </div>

      <div className="py-2">
        {canAccess(ADMIN_AND_MANAGER_ROLES) && (
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <FaChartBar size={16} />
            <span>Bảng điều khiển</span>
          </NavLink>
        )}

        {visibleProductItems.length > 0 && (
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
        )}

        {expandedMenu === "product" && (
          <div className="admin-submenu">
            {visibleProductItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `admin-submenu-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {visibleInventoryItems.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setExpandedMenu("inventory");
              navigate("/admin/inventory");
            }}
            className="admin-nav-toggle"
          >
            <FaWarehouse size={16} />
            <span>Kho</span>
            <FaChevronDown
              size={12}
              style={{
                marginLeft: "auto",
                transform: expandedMenu === "inventory" ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>
        )}

        {expandedMenu === "inventory" && (
          <div className="admin-submenu">
            {visibleInventoryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `admin-submenu-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {visibleNavItems.map((item) => {
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

        {canAccess(ADMIN_ONLY_ROLES) && (
          <div className="mt-3 pt-2" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.18)" }}>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            >
              <FaCog size={16} />
              <span>Cài đặt</span>
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
