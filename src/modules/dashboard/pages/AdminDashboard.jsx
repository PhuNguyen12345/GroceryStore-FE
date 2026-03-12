import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div>
        <div className="mb-4">
          <h2 className="fw-bold">Bảng điều khiển</h2>
          <p className="text-muted">Chào mừng đến với trang quản trị GroceryStore</p>
        </div>
      </div>
    </AdminLayout>
  );
}
