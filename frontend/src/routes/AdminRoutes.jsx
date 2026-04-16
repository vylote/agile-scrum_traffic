import { Routes, Route } from 'react-router-dom';
import { Dashboard as AdminDashboard } from '../pages/Admin/Dashboard';
import { Partners } from '../pages/Admin/Partners';
import { Users } from '../pages/Admin/Users';
import { Reports } from '../pages/Admin/Reports';
import { AdminSettings } from '../pages/Admin/AdminSettings'
import { AdminHeatmap } from '../pages/Admin/AdminHeatmap'

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="partners" element={<Partners />} />
      <Route path="users" element={<Users />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="heatmap" element={<AdminHeatmap />} />
    </Routes>
  );
};