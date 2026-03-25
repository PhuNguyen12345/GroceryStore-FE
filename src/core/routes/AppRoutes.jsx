import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../../modules/dashboard/pages/AdminDashboard";
import BrandPage from "../../modules/product/pages/Brand";
import DashboardLayout from "../../layouts/DashboardLayout";
import ProductsPage from "../../modules/product/pages/Products";
import ProductUnitsPage from "../../modules/product/pages/ProductUnits";
import CategoryPage from "../../modules/product/pages/Category";
import StoreProductsPage from "../../modules/product/pages/StoreProductsPage";
import StoreProductDetailPage from "../../modules/product/pages/StoreProductDetailPage";
import PromotionInfoPage from "../../modules/dashboard/pages/PromotionInfoPage";
import VoucherInfoPage from "../../modules/dashboard/pages/VoucherInfoPage";
import ShippingPolicyPage from "../../modules/dashboard/pages/ShippingPolicyPage";
import BlogPage from "../../modules/dashboard/pages/BlogPage";
import BlogDetailPage from "../../modules/dashboard/pages/BlogDetailPage";
import HotDealPage from "../../modules/dashboard/pages/HotDealPage";
import PromotionPage from "@/modules/crm-promotion/pages/Promotion";
import CustomerPage from "@/modules/crm-promotion/pages/Customer";
import VoucherPage from "@/modules/crm-promotion/pages/Voucher";
import LoginPage from "@/modules/auth/pages/LoginPage";
import StaffPage from "@/modules/hr-shift/pages/Staff";
import AttendanceCheckinPage from "@/modules/hr-shift/pages/AttendanceCheckin";
import SuppliersPage from "@/modules/inventory/pages/Suppliers";
import WarehousesPage from "@/modules/inventory/pages/Warehouses";
import BatchesPage from "@/modules/inventory/pages/Batches";
import TransactionsPage from "@/modules/inventory/pages/Transactions";
import StockPage from "@/modules/inventory/pages/Stocks";
import InventoryPage from "@/modules/inventory/pages/Inventory";
import ReportsPage from "@/modules/report/pages/Reports";
import SettingsPage from "@/modules/settings/pages/Settings";
import ProfilePage from "@/modules/profile/pages/Profile";
import PrivateRoutes from "@/core/routes/PrivateRoutes";
import POSPage from '@/modules/pos/pages/POSPage';

const ADMIN_ONLY = ["ADMIN"];
const ADMIN_AND_MANAGER = ["ADMIN", "STORE_MANAGER"];
const PRODUCT_ROLES = ["ADMIN", "STORE_MANAGER"];
const INVENTORY_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_STAFF"];
const POS_ROLES = ["ADMIN", "STORE_MANAGER", "CASHIER"];
const CRM_READ_ROLES = ["ADMIN", "STORE_MANAGER", "CASHIER"];
const STAFF_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_STAFF", "CASHIER"];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<DashboardLayout />} />
      <Route path="/products" element={<StoreProductsPage />} />
      <Route path="/products/:productId" element={<StoreProductDetailPage />} />
      <Route path="/khuyen-mai" element={<PromotionInfoPage />} />
      <Route path="/promotions" element={<PromotionInfoPage />} />
      <Route path="/vouchers" element={<PromotionInfoPage />} />
      <Route path="/uu-dai-voucher" element={<VoucherInfoPage />} />
      <Route path="/thong-tin-cua-hang" element={<ShippingPolicyPage />} />
      <Route path="/chinh-sach-giao-hang" element={<ShippingPolicyPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/hot-deal" element={<HotDealPage />} />

      <Route element={<PrivateRoutes allowedRoles={ADMIN_AND_MANAGER} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/promotions" element={<PromotionPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={PRODUCT_ROLES} />}>
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/product-units" element={<ProductUnitsPage />} />
        <Route path="/admin/brands" element={<BrandPage />} />
        <Route path="/admin/categories" element={<CategoryPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={INVENTORY_ROLES} />}>
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/admin/inventory/suppliers" element={<SuppliersPage />} />
        <Route path="/admin/inventory/warehouses" element={<WarehousesPage />} />
        <Route path="/admin/inventory/batches" element={<BatchesPage />} />
        <Route path="/admin/inventory/transactions" element={<TransactionsPage />} />
        <Route path="/admin/inventory/stocks" element={<StockPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={CRM_READ_ROLES} />}>
        <Route path="/admin/customers" element={<CustomerPage />} />
        <Route path="/admin/vouchers" element={<VoucherPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={ADMIN_ONLY} />}>
        <Route path="/admin/hr-shift" element={<StaffPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={STAFF_ROLES} />}>
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/attendance" element={<AttendanceCheckinPage />} />
      </Route>

      <Route element={<PrivateRoutes allowedRoles={POS_ROLES} />}>
        <Route path="/orders" element={<POSPage />} />
      </Route>
    </Routes>
  );
}
