import AdminHeader from "./AdminHeader";
import Sidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../styles/admin.css";

export default function AdminLayout({children}) {
  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
