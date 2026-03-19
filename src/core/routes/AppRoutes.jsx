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
import PrivateRoutes from "@/core/routes/PrivateRoutes";
import { ALLOWED_STAFF_ROLES } from "@/core/store/useAuthStore";

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

      <Route element={<PrivateRoutes allowedRoles={ALLOWED_STAFF_ROLES} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/product-units" element={<ProductUnitsPage />} />
        <Route path="/admin/brands" element={<BrandPage />} />
        <Route path="/admin/categories" element={<CategoryPage />} />

        <Route path="/admin/customers" element={<CustomerPage />} />
        <Route path="/admin/promotions" element={<PromotionPage />} />
        <Route path="/admin/vouchers" element={<VoucherPage />} />
        <Route path="/admin/hr-shift" element={<StaffPage />} />
      </Route>
    </Routes>
  );
}
