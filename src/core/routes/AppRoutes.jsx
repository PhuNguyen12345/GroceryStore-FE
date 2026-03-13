import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../modules/dashboard/pages/AdminDashboard';
import BrandPage from '../../modules/product/pages/Brand';
import DashboardLayout from '../../layouts/DashboardLayout';
import AdminLayout from '../../layouts/AdminLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public/General Routes wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* The index route renders when the path is exactly "/" */}
        <Route index element={<div>Home Page (Inside Dashboard Layout)</div>} />
      </Route>

      {/* Admin Routes wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="brands" element={<BrandPage />} />
      </Route>
    </Routes>
  );
}





