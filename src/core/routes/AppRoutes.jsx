import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../modules/dashboard/pages/AdminDashboard';
import BrandPage from '../../modules/product/pages/Brand';
import CustomerPage from '../../modules/crm-promotion/pages/Customer';
import PromotionPage from '../../modules/crm-promotion/pages/Promotion';
import VoucherPage from '../../modules/crm-promotion/pages/Voucher';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/brands" element={<BrandPage />} />
      <Route path="/admin/customers" element={<CustomerPage />} />
      <Route path="/admin/promotions" element={<PromotionPage />} />
      <Route path="/admin/vouchers" element={<VoucherPage />} />
      {/* Add more routes here */}
    </Routes>
  );
}
