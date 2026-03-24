import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";

const inventoryLinks = [
  { to: "/admin/inventory/suppliers", title: "Nhà cung cấp", desc: "Quản lý thông tin nhà cung cấp." },
  { to: "/admin/inventory/warehouses", title: "Kho hàng", desc: "Theo dõi danh sách và trạng thái kho." },
  { to: "/admin/inventory/batches", title: "Lô hàng", desc: "Quản lý lô nhập, hạn sử dụng, tồn hiện có." },
  { to: "/admin/inventory/transactions", title: "Giao dịch", desc: "Xem lịch sử nhập xuất kho." },
  { to: "/admin/inventory/stocks", title: "Tồn kho", desc: "Tra cứu tồn kho theo sản phẩm/đơn vị." },
];

export default function InventoryPage() {
  return (
    <AdminLayout>
      <div className="admin-page-heading mb-4">
        <div className="admin-page-heading-text">
          <h2 className="fw-bold mb-1">Kho</h2>
          <p className="text-muted mb-0">Chọn một mục dưới đây để tiếp tục.</p>
        </div>
      </div>

      <div className="row g-3">
        {inventoryLinks.map((item) => (
          <div className="col-12 col-md-6 col-lg-4" key={item.to}>
            <Link to={item.to} className="text-decoration-none">
              <div className="admin-panel p-3 h-100">
                <h5 className="mb-1 text-dark">{item.title}</h5>
                <p className="mb-0 text-muted">{item.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
