import AdminHeader from "./AdminHeader";
import Sidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "250px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <AdminHeader />
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
