import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../modules/dashboard/pages/AdminDashboard';
import BrandPage from '../../modules/product/pages/Brand';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomerPage from '../../modules/crm-promotion/pages/Customer';
import PromotionPage from '../../modules/crm-promotion/pages/Promotion';
import VoucherPage from '../../modules/crm-promotion/pages/Voucher';
import ProductUnitsPage from '@/modules/product/pages/ProductUnits';
import ProductsPage from '@/modules/product/pages/Products';
import CategoryPage from '@/modules/product/pages/Category';
import POSPage from '@/modules/pos/pages/POSPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductsPage />} />
      <Route path="/admin/product-units" element={<ProductUnitsPage />} />
      <Route path="/admin/brands" element={<BrandPage />} />
      {/* Add more routes here */}
      <Route path="/admin/categories" element={<CategoryPage />} />
       <Route path="/admin/customers" element={<CustomerPage />} />
      <Route path="/admin/promotions" element={<PromotionPage />} />
      <Route path="/admin/vouchers" element={<VoucherPage />} />
      <Route path="/orders" element={<POSPage />}/>
    </Routes>
  );
}
