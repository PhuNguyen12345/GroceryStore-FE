import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../../modules/dashboard/pages/AdminDashboard";
import BrandPage from "../../modules/product/pages/Brand";
import CategoryPage from "../../modules/product/pages/Category";
import ProductsPage from "../../modules/product/pages/Products";
import ProductUnitsPage from "../../modules/product/pages/ProductUnits";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductsPage />} />
      <Route path="/admin/product-units" element={<ProductUnitsPage />} />
      <Route path="/admin/brands" element={<BrandPage />} />
      <Route path="/admin/categories" element={<CategoryPage />} />
      {/* Add more routes here */}
    </Routes>
  );
}
