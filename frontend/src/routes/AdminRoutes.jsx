import { Routes, Route } from 'react-router-dom';
import { Dashboard as AdminDashboard } from '../pages/Admin/Dashboard';
import { Partners } from '../pages/Admin/Partners';
import { Users } from '../pages/Admin/Users';
import { Reports } from '../pages/Admin/Reports';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="partners" element={<Partners />} />
      <Route path="users" element={<Users />} />
      <Route path="reports" element={<Reports />} />
    </Routes>
  );
};