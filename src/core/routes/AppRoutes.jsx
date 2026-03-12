import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../modules/dashboard/pages/AdminDashboard';
import BrandPage from '../../modules/product/pages/Brand';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/brands" element={<BrandPage />} />
      {/* Add more routes here */}
    </Routes>
  );
}
